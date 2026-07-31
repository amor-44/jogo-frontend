"""Player detection (PRD Section 5.3) — pretrained YOLOv8, person class only."""

from dataclasses import dataclass

from ultralytics import YOLO

CONFIDENCE_THRESHOLD = 0.5
MIN_BOX_AREA_PX = 400  # filters far-background spectators/staff

_PERSON_CLASS_ID = 0


@dataclass
class BoundingBox:
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float

    @property
    def area(self) -> float:
        return max(0.0, self.x2 - self.x1) * max(0.0, self.y2 - self.y1)


_model: YOLO | None = None


def _get_model(weights: str = "yolov8n.pt") -> YOLO:
    global _model
    if _model is None:
        _model = YOLO(weights)
    return _model


def detect_players(frame) -> list[BoundingBox]:
    model = _get_model()
    results = model.predict(frame, classes=[_PERSON_CLASS_ID], verbose=False)

    boxes: list[BoundingBox] = []
    for result in results:
        for box in result.boxes:
            confidence = float(box.conf[0])
            if confidence < CONFIDENCE_THRESHOLD:
                continue
            x1, y1, x2, y2 = (float(v) for v in box.xyxy[0])
            candidate = BoundingBox(x1, y1, x2, y2, confidence)
            if candidate.area < MIN_BOX_AREA_PX:
                continue
            boxes.append(candidate)

    return boxes
