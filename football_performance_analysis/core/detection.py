from __future__ import annotations
import cv2
import numpy as np
from dataclasses import dataclass
from typing import List, Optional, Tuple

@dataclass
class Detection:
    bbox: Tuple[int, int, int, int]  # x, y, w, h
    confidence: float
    class_id: int = 0  # 0 = person, 32 = sports ball (COCO)

    @property
    def center(self) -> Tuple[float, float]:
        x, y, w, h = self.bbox
        return (x + w / 2.0, y + h / 2.0)

    @property
    def foot_point(self) -> Tuple[float, float]:
        """Approximate ground-contact point (bottom-center of bbox)."""
        x, y, w, h = self.bbox
        return (x + w / 2.0, y + h)

    @property
    def area(self) -> float:
        return self.bbox[2] * self.bbox[3]


# ---------------------------------------------------------------------------
# Lazy-loaded YOLO model (singleton) — loaded once on first use so the import
# cost doesn't hit every module that touches detection.py.
# ---------------------------------------------------------------------------
_yolo_model = None

def _get_yolo_model():
    global _yolo_model
    if _yolo_model is None:
        try:
            from ultralytics import YOLO
            _yolo_model = YOLO("yolov8n.pt")
            print("[detection] YOLOv8 nano model loaded successfully")
        except Exception as e:
            print(f"[detection] WARNING: Could not load YOLOv8: {e}. Falling back to HOG.")
            _yolo_model = "unavailable"
    return _yolo_model


class PersonDetector:
    """Detects people using YOLOv8 (COCO class 0).
    Falls back to HOG if YOLO is unavailable."""

    def __init__(self, confidence_threshold: float = 0.35):
        self.confidence_threshold = confidence_threshold
        self._hog_fallback = None

    def _get_hog(self):
        if self._hog_fallback is None:
            if hasattr(cv2, 'HOGDescriptor'):
                self._hog_fallback = cv2.HOGDescriptor()
                self._hog_fallback.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
            else:
                self._hog_fallback = cv2.objdetect.HOGDescriptor()
                self._hog_fallback.setSVMDetector(cv2.objdetect.HOGDescriptor_getDefaultPeopleDetector())
        return self._hog_fallback

    def detect(self, frame: np.ndarray) -> List[Detection]:
        model = _get_yolo_model()

        if model != "unavailable":
            return self._detect_yolo(frame, model)
        return self._detect_hog(frame)

    def _detect_yolo(self, frame: np.ndarray, model) -> List[Detection]:
        results = model(frame, classes=[0], conf=self.confidence_threshold, verbose=False)
        detections = []
        for r in results:
            if r.boxes is None:
                continue
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0])
                w, h = x2 - x1, y2 - y1
                detections.append(Detection(
                    bbox=(int(x1), int(y1), int(w), int(h)),
                    confidence=conf,
                    class_id=0,
                ))
        return detections

    def _detect_hog(self, frame: np.ndarray) -> List[Detection]:
        hog = self._get_hog()
        h, w = frame.shape[:2]
        scale = 640.0 / w if w > 640 else 1.0
        small = cv2.resize(frame, (int(w * scale), int(h * scale))) if scale != 1.0 else frame
        rects, weights = hog.detectMultiScale(small, winStride=(8, 8), padding=(8, 8), scale=1.05)
        detections = []
        for (x, y, bw, bh), weight in zip(rects, weights):
            conf = float(1.0 / (1.0 + np.exp(-weight)))
            detections.append(Detection(
                bbox=(int(x / scale), int(y / scale), int(bw / scale), int(bh / scale)),
                confidence=conf,
                class_id=0,
            ))
        return detections

    def detect_primary(self, frame: np.ndarray, prior_center: Optional[Tuple[float, float]] = None) -> Optional[Detection]:
        dets = self.detect(frame)
        if not dets:
            return None
        if prior_center is not None:
            def dist(d: Detection) -> float:
                cx, cy = d.center
                return (cx - prior_center[0]) ** 2 + (cy - prior_center[1]) ** 2
            return min(dets, key=dist)
        return max(dets, key=lambda d: d.area * d.confidence)


class BallDetector:
    """Detects sports balls using YOLOv8 (COCO class 32).
    Falls back to Hough circle detection if YOLO is unavailable."""

    def __init__(self, min_radius: int = 4, max_radius: int = 30, confidence_threshold: float = 0.25):
        self.min_radius = min_radius
        self.max_radius = max_radius
        self.confidence_threshold = confidence_threshold

    def detect(self, frame: np.ndarray, prior_center: Optional[Tuple[float, float]] = None) -> Optional[Detection]:
        model = _get_yolo_model()

        if model != "unavailable":
            det = self._detect_yolo(frame, model, prior_center)
            if det is not None:
                return det
            # Fall through to Hough as backup even when YOLO is available
            # (YOLO sometimes misses small/occluded balls)

        return self._detect_hough(frame, prior_center)

    def _detect_yolo(self, frame: np.ndarray, model, prior_center: Optional[Tuple[float, float]] = None) -> Optional[Detection]:
        results = model(frame, classes=[32], conf=self.confidence_threshold, verbose=False)
        candidates = []
        for r in results:
            if r.boxes is None:
                continue
            for box in r.boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0])
                w, h = x2 - x1, y2 - y1
                candidates.append(Detection(
                    bbox=(int(x1), int(y1), int(w), int(h)),
                    confidence=conf,
                    class_id=32,
                ))
        if not candidates:
            return None
        if prior_center is not None:
            def dist(d: Detection) -> float:
                cx, cy = d.center
                return (cx - prior_center[0]) ** 2 + (cy - prior_center[1]) ** 2
            return min(candidates, key=dist)
        return max(candidates, key=lambda d: d.confidence)

    def _detect_hough(self, frame: np.ndarray, prior_center: Optional[Tuple[float, float]] = None) -> Optional[Detection]:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 1.2)
        circles = cv2.HoughCircles(
            gray, cv2.HOUGH_GRADIENT, dp=1.2, minDist=20,
            param1=100, param2=22,
            minRadius=self.min_radius, maxRadius=self.max_radius,
        )
        if circles is None:
            return None
        circles = np.round(circles[0, :]).astype(int)

        if prior_center is not None:
            def dist(c):
                return (c[0] - prior_center[0]) ** 2 + (c[1] - prior_center[1]) ** 2
            cx, cy, r = min(circles, key=dist)
        else:
            def brightness(c):
                x, y, r = c
                y0, y1 = max(0, y - r), min(gray.shape[0], y + r)
                x0, x1 = max(0, x - r), min(gray.shape[1], x + r)
                patch = gray[y0:y1, x0:x1]
                return float(np.mean(patch)) if patch.size else 0.0
            cx, cy, r = max(circles, key=brightness)

        conf = 0.35  # Hough is less reliable than YOLO
        return Detection(bbox=(int(cx - r), int(cy - r), int(2 * r), int(2 * r)), confidence=conf, class_id=32)
