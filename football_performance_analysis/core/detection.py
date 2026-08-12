from __future__ import annotations
import cv2
import numpy as np
from dataclasses import dataclass
from typing import List, Optional, Tuple

@dataclass
class Detection:
    bbox: Tuple[int, int, int, int]  # x, y, w, h
    confidence: float

    @property
    def center(self) -> Tuple[float, float]:
        x, y, w, h = self.bbox
        return (x + w / 2.0, y + h / 2.0)

    @property
    def foot_point(self) -> Tuple[float, float]:
        """Approximate ground-contact point (bottom-center of bbox)."""
        x, y, w, h = self.bbox
        return (x + w / 2.0, y + h)


class PersonDetector:
    def __init__(self):
        if hasattr(cv2, 'HOGDescriptor'):
            self._hog = cv2.HOGDescriptor()
            self._hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        else:
            self._hog = cv2.objdetect.HOGDescriptor()
            self._hog.setSVMDetector(cv2.objdetect.HOGDescriptor_getDefaultPeopleDetector())

    def detect(self, frame: np.ndarray) -> List[Detection]:
        # Downscale for speed/stability; HOG is expensive at full broadcast resolution.
        h, w = frame.shape[:2]
        scale = 640.0 / w if w > 640 else 1.0
        small = cv2.resize(frame, (int(w * scale), int(h * scale))) if scale != 1.0 else frame

        rects, weights = self._hog.detectMultiScale(
            small, winStride=(8, 8), padding=(8, 8), scale=1.05
        )
        detections = []
        for (x, y, bw, bh), weight in zip(rects, weights):
            conf = float(1.0 / (1.0 + np.exp(-weight)))  # squash HOG score to (0,1)
            detections.append(Detection(
                bbox=(int(x / scale), int(y / scale), int(bw / scale), int(bh / scale)),
                confidence=conf,
            ))
        return detections

    def detect_primary(self, frame: np.ndarray, prior_center: Optional[Tuple[float, float]] = None) -> Optional[Detection]:
        """Return the single most likely 'primary' player detection.

        If a prior center (from tracking) is given, prefer the closest
        detection to it; otherwise prefer the largest / most confident box
        (assumes the analyzed player tends to be the most prominent one).
        """
        dets = self.detect(frame)
        if not dets:
            return None
        if prior_center is not None:
            def dist(d: Detection) -> float:
                cx, cy = d.center
                return (cx - prior_center[0]) ** 2 + (cy - prior_center[1]) ** 2
            return min(dets, key=dist)
        return max(dets, key=lambda d: d.bbox[2] * d.bbox[3] * d.confidence)


class BallDetector:
    """Hough-circle based ball candidate detector."""

    def __init__(self, min_radius: int = 4, max_radius: int = 30):
        self.min_radius = min_radius
        self.max_radius = max_radius

    def detect(self, frame: np.ndarray, prior_center: Optional[Tuple[float, float]] = None) -> Optional[Detection]:
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
            # No prior: pick the circle whose local patch is brightest/most
            # uniform (white/orange balls tend to be brighter than turf).
            def brightness(c):
                x, y, r = c
                y0, y1 = max(0, y - r), min(gray.shape[0], y + r)
                x0, x1 = max(0, x - r), min(gray.shape[1], x + r)
                patch = gray[y0:y1, x0:x1]
                return float(np.mean(patch)) if patch.size else 0.0
            cx, cy, r = max(circles, key=brightness)

        # crude confidence: fraction of circles collapsing near this one
        # (a stable, isolated circle is more likely a real ball)
        conf = 0.5
        return Detection(bbox=(int(cx - r), int(cy - r), int(2 * r), int(2 * r)), confidence=conf)
