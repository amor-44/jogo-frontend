from dataclasses import dataclass, field
from typing import Dict, List, Optional

from ultralytics import YOLO

from app.config import get_settings
from app.detection.detector import PERSON_CLASS_ID
from app.utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class TrackObservation:
    frame_index: int
    timestamp: float
    track_id: int
    bbox: tuple
    confidence: float

    @property
    def center(self) -> tuple:
        x1, y1, x2, y2 = self.bbox
        return ((x1 + x2) / 2.0, (y1 + y2) / 2.0)


@dataclass
class TrackingResult:
    observations_by_track: Dict[int, List[TrackObservation]] = field(default_factory=dict)
    total_frames: int = 0

    def add(self, obs: TrackObservation) -> None:
        self.observations_by_track.setdefault(obs.track_id, []).append(obs)

    def main_track_id(self) -> Optional[int]:
        """Heuristic: the main player is the track present in the most frames.

        This is an explicit MVP approximation. It assumes a single
        dominant subject in frame and does not attempt re-identification
        if the subject temporarily leaves and re-enters under a new
        track id - handling that robustly would require a re-ID model,
        which is out of scope for this MVP.
        """
        if not self.observations_by_track:
            return None
        return max(self.observations_by_track, key=lambda tid: len(self.observations_by_track[tid]))


class PlayerTracker:
    def __init__(
        self,
        model: Optional[YOLO] = None,
        confidence_threshold: Optional[float] = None,
        tracker_config: Optional[str] = None,
    ):
        settings = get_settings()
        self.model = model or YOLO(settings.yolo_model_path)
        self.confidence_threshold = (
            confidence_threshold if confidence_threshold is not None else settings.detection_confidence_threshold
        )
        self.tracker_config = tracker_config or settings.tracker_config

    def track_video(self, video_path: str, fps: float) -> TrackingResult:
        """Run detection + ByteTrack across the whole video, streaming
        frame-by-frame to avoid loading everything into memory at once.
        """
        result = TrackingResult()
        stream = self.model.track(
            source=video_path,
            classes=[PERSON_CLASS_ID],
            conf=self.confidence_threshold,
            tracker=self.tracker_config,
            persist=False,
            stream=True,
            verbose=False,
        )

        frame_index = 0
        for frame_result in stream:
            boxes = getattr(frame_result, "boxes", None)
            if boxes is not None and boxes.id is not None:
                ids = boxes.id.tolist()
                for box, track_id in zip(boxes, ids):
                    xyxy = box.xyxy[0].tolist()
                    conf = float(box.conf[0])
                    obs = TrackObservation(
                        frame_index=frame_index,
                        timestamp=(frame_index / fps) if fps else 0.0,
                        track_id=int(track_id),
                        bbox=tuple(xyxy),
                        confidence=conf,
                    )
                    result.add(obs)
            frame_index += 1

        result.total_frames = frame_index
        logger.info(
            "Tracking complete: %d frames processed, %d distinct track ids",
            frame_index,
            len(result.observations_by_track),
        )
        return result
