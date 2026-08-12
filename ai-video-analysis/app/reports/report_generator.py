from typing import List
from app.analysis.movement_analyzer import MovementMetrics
from app.models.schemas import KeyFrame, MetricsModel, Report, VisualizationPaths
from app.services.video_service import VideoMetadata


class ReportGenerator:
    def build(
        self,
        analysis_id: str,
        video_filename: str,
        video_metadata: VideoMetadata,
        movement_metrics: MovementMetrics,
        key_frames: List[KeyFrame],
        visualizations: VisualizationPaths,
    ) -> Report:
        metrics = MetricsModel(
            video_duration_seconds=round(video_metadata.duration_seconds, 2),
            frames_processed=movement_metrics.frames_processed,
            fps=round(video_metadata.fps, 2),
            resolution=video_metadata.resolution,
            player_detected=movement_metrics.player_detected,
            detection_rate=movement_metrics.detection_rate,
            average_detection_confidence=movement_metrics.average_detection_confidence,
            tracking_duration_seconds=movement_metrics.tracking_duration_seconds,
            estimated_distance_pixels=movement_metrics.estimated_distance_pixels,
            average_speed_pixels_per_second=movement_metrics.average_speed_pixels_per_second,
            movement_consistency=movement_metrics.movement_consistency,
            direction_changes=movement_metrics.direction_changes,
            activity_time_seconds=movement_metrics.activity_time_seconds,
            confidence_level=self._confidence_level(movement_metrics.detection_rate),
        )

        return Report(
            analysis_id=analysis_id,
            video_filename=video_filename,
            metrics=metrics,
            key_frames=key_frames,
            visualizations=visualizations,
            observations=self._build_observations(metrics),
            recommendations=self._build_recommendations(metrics),
            limitations=self._default_limitations(),
        )

    @staticmethod
    def _confidence_level(detection_rate: float) -> str:
        if detection_rate >= 0.8:
            return "High"
        if detection_rate >= 0.5:
            return "Medium"
        return "Low"

    @staticmethod
    def _build_observations(m: MetricsModel) -> List[str]:
        if not m.player_detected:
            return ["No player could be reliably detected and tracked in this video."]

        observations = [
            f"The player was tracked for {m.tracking_duration_seconds}s out of a "
            f"{m.video_duration_seconds}s video (detection rate: {m.detection_rate * 100:.0f}%).",
            f"Estimated movement covered approximately {m.estimated_distance_pixels:.0f} pixels "
            f"at an average speed of {m.average_speed_pixels_per_second:.0f} px/s.",
        ]
        if m.direction_changes > 0:
            observations.append(f"{m.direction_changes} notable direction change(s) were detected during tracking.")
        return observations

    @staticmethod
    def _build_recommendations(m: MetricsModel) -> List[str]:
        recommendations = []
        if m.confidence_level == "Low":
            recommendations.append(
                "Re-record with steadier framing, better lighting, and the player kept in frame "
                "to improve detection reliability."
            )
        if m.player_detected and m.movement_consistency < 0.4:
            recommendations.append(
                "Movement speed varied significantly across the clip; this may reflect drills with "
                "frequent stop-start actions rather than a tracking issue."
            )
        if not recommendations:
            recommendations.append("Video quality and tracking were sufficient for a reliable analysis.")
        return recommendations

    @staticmethod
    def _default_limitations() -> List[str]:
        return [
            "Distance and speed are pixel-based approximations, not calibrated to real-world units "
            "(no camera calibration is performed in this).",
            "Metrics reflect movement only - not passing accuracy, decision-making, tactical "
            "understanding, or any form of scouting score.",
            "Analysis assumes a single dominant player subject in a short (<=60s), well-framed clip "
            "with limited camera movement.",
        ]
