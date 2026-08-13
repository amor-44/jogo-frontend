from dataclasses import dataclass
from typing import List, Tuple

import numpy as np
from ultralytics import YOLO

from app.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

PERSON_CLASS_ID = 0  # COCO class id for "person"


@dataclass
class Detection:
    bbox: Tuple[float, float, float, float]  # x1, y1, x2, y2 in pixel coords
    confidence: float
    class_id: int


class PlayerDetector:
    """Thin wrapper around a YOLO model, filtered to person detections."""

    def __init__(self, model_path: str | None = None, confidence_threshold: float | None = None):
        settings = get_settings()
        self.model_path = model_path or settings.yolo_model_path
        self.confidence_threshold = (
            confidence_threshold if confidence_threshold is not None else settings.detection_confidence_threshold
        )
        logger.info("Loading YOLO model from %s", self.model_path)
        self.model = YOLO(self.model_path)

    def detect_frame(self, frame: np.ndarray) -> List[Detection]:
        """Run detection on a single frame, returning only person detections."""
        results = self.model.predict(
            source=frame,
            classes=[PERSON_CLASS_ID],
            conf=self.confidence_threshold,
            verbose=False,
        )
        detections: List[Detection] = []
        if not results:
            return detections

        result = results[0]
        if result.boxes is None:
            return detections

        for box in result.boxes:
            xyxy = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            detections.append(Detection(bbox=tuple(xyxy), confidence=conf, class_id=cls_id))
        return detections
