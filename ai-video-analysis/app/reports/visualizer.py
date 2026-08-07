"""Generates visual outputs: trajectory plots, a movement heatmap, and
annotated frames/video. Kept independent from metric calculation so
visualizations can be extended or skipped without touching analysis
logic.
"""
from pathlib import Path
from typing import List, Optional

import cv2
import numpy as np

from app.tracking.tracker import TrackObservation
from app.utils.logger import get_logger

logger = get_logger(__name__)


class Visualizer:
    def draw_trajectory(self, path: List[tuple], width: int, height: int, output_path: Path) -> Optional[str]:
        """Draws the player's movement path on a blank canvas the size of
        the source video, marking start (green) and end (red).
        """
        if len(path) < 2 or width <= 0 or height <= 0:
            return None
        canvas = np.full((height, width, 3), 255, dtype=np.uint8)
        points = np.array(path, dtype=np.int32)
        for i in range(1, len(points)):
            cv2.line(canvas, tuple(points[i - 1]), tuple(points[i]), (0, 128, 255), 2)
        cv2.circle(canvas, tuple(points[0]), 6, (0, 200, 0), -1)
        cv2.circle(canvas, tuple(points[-1]), 6, (0, 0, 220), -1)
        cv2.imwrite(str(output_path), canvas)
        return str(output_path)

    def draw_heatmap(self, path: List[tuple], width: int, height: int, output_path: Path) -> Optional[str]:
        """A simple Gaussian-blurred occupancy heatmap of visited positions."""
        if not path or width <= 0 or height <= 0:
            return None
        heat = np.zeros((height, width), dtype=np.float32)
        for x, y in path:
            xi = int(np.clip(x, 0, width - 1))
            yi = int(np.clip(y, 0, height - 1))
            cv2.circle(heat, (xi, yi), 15, 1.0, -1)
        heat = cv2.GaussianBlur(heat, (0, 0), sigmaX=15)
        max_val = heat.max()
        if max_val <= 0:
            return None
        heat_normalized = (heat / max_val * 255).astype(np.uint8)
        heat_color = cv2.applyColorMap(heat_normalized, cv2.COLORMAP_JET)
        cv2.imwrite(str(output_path), heat_color)
        return str(output_path)

    def save_key_frame(self, frame: np.ndarray, output_path: Path) -> str:
        cv2.imwrite(str(output_path), frame)
        return str(output_path)

    def annotate_frame(self, frame: np.ndarray, observation: Optional[TrackObservation]) -> np.ndarray:
        """Draws the tracked player's bounding box + id/confidence label."""
        annotated = frame.copy()
        if observation is not None:
            x1, y1, x2, y2 = (int(v) for v in observation.bbox)
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 220, 0), 2)
            label = f"player {observation.track_id} ({observation.confidence:.2f})"
            cv2.putText(
                annotated, label, (x1, max(0, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 220, 0), 2
            )
        return annotated
