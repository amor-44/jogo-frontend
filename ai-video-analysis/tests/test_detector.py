import numpy as np
import pytest

from app.detection import detector as detector_module


class DummyBox:
    def __init__(self, xyxy, conf, cls):
        self.xyxy = [np.array(xyxy, dtype=float)]
        self.conf = [conf]
        self.cls = [cls]


class DummyResult:
    def __init__(self, boxes):
        self.boxes = boxes


class DummyModel:
    def __init__(self, *args, **kwargs):
        pass

    def predict(self, *args, **kwargs):
        return [DummyResult([DummyBox([10, 10, 50, 100], 0.83, 0)])]


class DummyModelNoDetections:
    def __init__(self, *args, **kwargs):
        pass

    def predict(self, *args, **kwargs):
        return [DummyResult(None)]


def test_detect_frame_parses_person_detections(monkeypatch):
    monkeypatch.setattr(detector_module, "YOLO", DummyModel)
    d = detector_module.PlayerDetector(model_path="dummy.pt", confidence_threshold=0.4)

    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    detections = d.detect_frame(frame)

    assert len(detections) == 1
    assert detections[0].confidence == pytest.approx(0.83)
    assert detections[0].bbox == (10.0, 10.0, 50.0, 100.0)
    assert detections[0].class_id == 0


def test_detect_frame_handles_no_detections(monkeypatch):
    monkeypatch.setattr(detector_module, "YOLO", DummyModelNoDetections)
    d = detector_module.PlayerDetector(model_path="dummy.pt")

    frame = np.zeros((100, 100, 3), dtype=np.uint8)
    detections = d.detect_frame(frame)

    assert detections == []
