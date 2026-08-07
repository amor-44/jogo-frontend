"""Orchestrates the full analysis pipeline:

validate -> save -> extract metadata -> detect/track -> analyze movement
-> generate visualizations -> generate report -> store result

This is the single place that wires the otherwise-isolated modules
together, so each module (detection, tracking, analysis, reports) stays
independently testable and swappable.
"""
from pathlib import Path
from typing import List, Optional

import cv2

from ultralytics import YOLO

from app.analysis.movement_analyzer import MovementAnalyzer
from app.config import get_settings
from app.models.schemas import AnalysisStatus, KeyFrame, VisualizationPaths
from app.reports.report_generator import ReportGenerator
from app.reports.visualizer import Visualizer
from app.services.video_service import VideoService, VideoValidationError
from app.storage.job_store import job_store
from app.tracking.tracker import PlayerTracker, TrackObservation
from app.utils.file_utils import build_output_dir
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AnalysisService:
    """Depends on a shared YOLO model instance, loaded once at app
    startup and injected here, so requests never pay model-load cost.
    """

    def __init__(self, model: YOLO):
        self.settings = get_settings()
        self.video_service = VideoService()
        self.tracker = PlayerTracker(model=model)
        self.movement_analyzer = MovementAnalyzer()
        self.visualizer = Visualizer()
        self.report_generator = ReportGenerator()

    def run(self, analysis_id: str, video_path: Path) -> None:
        """Runs the full pipeline synchronously. Intended to be invoked
        from a FastAPI BackgroundTask so the API can respond immediately.
        """
        job_store.update_status(analysis_id, AnalysisStatus.PROCESSING)
        try:
            video_metadata = self.video_service.read_metadata(video_path)
            tracking_result = self.tracker.track_video(str(video_path), fps=video_metadata.fps or 25.0)

            main_track_id = tracking_result.main_track_id()
            observations = (
                tracking_result.observations_by_track.get(main_track_id, [])
                if main_track_id is not None
                else []
            )

            movement_metrics = self.movement_analyzer.analyze(observations, tracking_result.total_frames)

            output_dir = build_output_dir(self.settings.output_dir, analysis_id)
            key_frames = self._extract_key_frames(video_path, observations, output_dir)
            visualizations = self._build_visualizations(observations, video_metadata, video_path, output_dir)

            report = self.report_generator.build(
                analysis_id=analysis_id,
                video_filename=video_path.name,
                video_metadata=video_metadata,
                movement_metrics=movement_metrics,
                key_frames=key_frames,
                visualizations=visualizations,
            )
            job_store.set_report(analysis_id, report)
            logger.info("Analysis %s completed successfully", analysis_id)

        except VideoValidationError as exc:
            logger.warning("Analysis %s failed validation: %s", analysis_id, exc)
            job_store.update_status(analysis_id, AnalysisStatus.FAILED, error=str(exc))
        except Exception as exc:  # noqa: BLE001 - top-level pipeline guard, must never crash the worker
            logger.exception("Analysis %s failed unexpectedly", analysis_id)
            job_store.update_status(analysis_id, AnalysisStatus.FAILED, error=f"Internal processing error: {exc}")

    def _extract_key_frames(
        self, video_path: Path, observations: List[TrackObservation], output_dir: Path
    ) -> List[KeyFrame]:
        if not observations:
            return []

        by_index = {obs.frame_index: obs for obs in observations}
        sorted_obs = sorted(observations, key=lambda o: o.frame_index)

        wanted = {
            "beginning": sorted_obs[0],
            "middle": sorted_obs[len(sorted_obs) // 2],
            "end": sorted_obs[-1],
        }
        max_movement_obs = self._frame_with_max_movement(sorted_obs)
        if max_movement_obs is not None:
            wanted["max_movement"] = max_movement_obs

        wanted_indices = {obs.frame_index for obs in wanted.values()}
        frames_by_index = {}
        for idx, frame in self.video_service.iter_frames(video_path):
            if idx in wanted_indices:
                frames_by_index[idx] = frame
            if len(frames_by_index) == len(wanted_indices):
                break

        key_frames: List[KeyFrame] = []
        for label, obs in wanted.items():
            frame = frames_by_index.get(obs.frame_index)
            if frame is None:
                continue
            annotated = self.visualizer.annotate_frame(frame, by_index.get(obs.frame_index))
            image_path = output_dir / f"keyframe_{label}.jpg"
            self.visualizer.save_key_frame(annotated, image_path)
            key_frames.append(
                KeyFrame(
                    label=label,
                    frame_index=obs.frame_index,
                    timestamp_seconds=round(obs.timestamp, 2),
                    image_path=str(image_path),
                )
            )
        return key_frames

    @staticmethod
    def _frame_with_max_movement(sorted_obs: List[TrackObservation]) -> Optional[TrackObservation]:
        if len(sorted_obs) < 2:
            return None
        best_obs, best_dist = None, -1.0
        for prev_obs, curr_obs in zip(sorted_obs, sorted_obs[1:]):
            dx = curr_obs.center[0] - prev_obs.center[0]
            dy = curr_obs.center[1] - prev_obs.center[1]
            dist = (dx**2 + dy**2) ** 0.5
            if dist > best_dist:
                best_dist, best_obs = dist, curr_obs
        return best_obs

    def _build_visualizations(
        self,
        observations: List[TrackObservation],
        video_metadata,
        video_path: Path,
        output_dir: Path,
    ) -> VisualizationPaths:
        path = [obs.center for obs in sorted(observations, key=lambda o: o.frame_index)]

        trajectory_path = self.visualizer.draw_trajectory(
            path, video_metadata.width, video_metadata.height, output_dir / "trajectory.jpg"
        )
        heatmap_path = self.visualizer.draw_heatmap(
            path, video_metadata.width, video_metadata.height, output_dir / "heatmap.jpg"
        )
        annotated_video_path = self._build_annotated_video(video_path, video_metadata, observations, output_dir)

        return VisualizationPaths(
            trajectory_image=trajectory_path,
            heatmap_image=heatmap_path,
            annotated_video=annotated_video_path,
        )

    def _build_annotated_video(
        self,
        video_path: Path,
        video_metadata,
        observations: List[TrackObservation],
        output_dir: Path,
    ) -> Optional[str]:
        if not observations or video_metadata.width <= 0 or video_metadata.height <= 0:
            return None

        by_index = {obs.frame_index: obs for obs in observations}
        output_path = output_dir / "annotated.mp4"
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(
            str(output_path), fourcc, video_metadata.fps or 25.0, (video_metadata.width, video_metadata.height)
        )
        try:
            for idx, frame in self.video_service.iter_frames(video_path):
                annotated = self.visualizer.annotate_frame(frame, by_index.get(idx))
                writer.write(annotated)
        finally:
            writer.release()
        return str(output_path)
