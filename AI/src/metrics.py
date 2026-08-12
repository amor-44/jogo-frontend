"""Football metrics: pitch calibration + real-world distance/speed/heatmap (PRD Section 5.8).

Converts a locked player's pixel-space trajectory (from `tracking.py`, or any other
tracker producing `(timestamp_ms, x_px, y_px)` triples) into the real-world metrics the
backend<->AI contract actually expects (PRD 11.2): `distanceCoveredKm`, `avgSpeedKmh`,
`maxSpeedKmh`, plus a heatmap PNG. This is a genuine gap versus `ai-video-analysis/`'s
movement analyzer, which reports pixel-space estimates only (`estimated_distance_pixels`,
`average_speed_pixels_per_second`) — not the contract's real-world units. Deliberately
takes a plain trajectory rather than a specific tracker's output type so it can sit on
top of either tracker once the team consolidates.
"""

from dataclasses import dataclass

import cv2
import numpy as np

PITCH_LENGTH_M = 105.0
PITCH_WIDTH_M = 68.0
SPEED_SMOOTHING_WINDOW = 5  # frames, moving average to remove tracking jitter


@dataclass
class TrajectoryPoint:
    timestamp_ms: float
    x_px: float
    y_px: float


@dataclass
class FootballMetrics:
    distance_covered_km: float
    avg_speed_kmh: float
    max_speed_kmh: float
    heatmap_positions_m: list[tuple[float, float]]  # real-world (x, y) for heatmap rendering


def compute_homography(pixel_corners: list[tuple[float, float]]) -> np.ndarray:
    """PRD 5.8 steps 67-68: 4 clicked pitch corners -> homography to standard 105x68m pitch.

    `pixel_corners` must be the 4 corners in a consistent order (e.g. top-left,
    top-right, bottom-right, bottom-left) matching `real_world_corners` below.
    """
    real_world_corners = np.array(
        [[0, 0], [PITCH_LENGTH_M, 0], [PITCH_LENGTH_M, PITCH_WIDTH_M], [0, PITCH_WIDTH_M]],
        dtype=np.float32,
    )
    homography, _ = cv2.findHomography(np.array(pixel_corners, dtype=np.float32), real_world_corners)
    if homography is None:
        raise ValueError("cv2.findHomography failed — check that pixel_corners are 4 non-collinear points")
    return homography


def _transform_to_real_world(points_px: np.ndarray, homography: np.ndarray) -> np.ndarray:
    """PRD 5.8 step 69: cv2.perspectiveTransform every tracked pixel position."""
    reshaped = points_px.reshape(-1, 1, 2).astype(np.float32)
    transformed = cv2.perspectiveTransform(reshaped, homography)
    return transformed.reshape(-1, 2)


def _moving_average(values: np.ndarray, window: int) -> np.ndarray:
    if len(values) < window:
        return values
    kernel = np.ones(window) / window
    return np.convolve(values, kernel, mode="same")


def compute_metrics(trajectory: list[TrajectoryPoint], homography: np.ndarray) -> FootballMetrics:
    """PRD 5.8 steps 69-71: distance, speed, acceleration and heatmap positions in real-world meters."""
    if len(trajectory) < 2:
        return FootballMetrics(distance_covered_km=0.0, avg_speed_kmh=0.0, max_speed_kmh=0.0, heatmap_positions_m=[])

    pixel_points = np.array([[p.x_px, p.y_px] for p in trajectory])
    real_world_points = _transform_to_real_world(pixel_points, homography)
    timestamps_s = np.array([p.timestamp_ms for p in trajectory]) / 1000.0

    segment_distances_m = np.linalg.norm(np.diff(real_world_points, axis=0), axis=1)
    segment_durations_s = np.diff(timestamps_s)
    segment_durations_s[segment_durations_s <= 0] = np.nan  # avoid divide-by-zero on duplicate timestamps

    instantaneous_speeds_kmh = (segment_distances_m / segment_durations_s) * 3.6
    smoothed_speeds_kmh = _moving_average(np.nan_to_num(instantaneous_speeds_kmh), SPEED_SMOOTHING_WINDOW)

    total_distance_m = float(np.nansum(segment_distances_m))
    avg_speed_kmh = float(np.nanmean(smoothed_speeds_kmh)) if len(smoothed_speeds_kmh) else 0.0
    max_speed_kmh = float(np.nanmax(smoothed_speeds_kmh)) if len(smoothed_speeds_kmh) else 0.0

    return FootballMetrics(
        distance_covered_km=round(total_distance_m / 1000.0, 3),
        avg_speed_kmh=round(avg_speed_kmh, 2),
        max_speed_kmh=round(max_speed_kmh, 2),
        heatmap_positions_m=[(float(x), float(y)) for x, y in real_world_points],
    )


def render_heatmap(positions_m: list[tuple[float, float]], output_path: str) -> str:
    """PRD 5.8 step 71: bin real-world positions into a pitch-shaped grid and render a heatmap PNG."""
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(PITCH_LENGTH_M / 10, PITCH_WIDTH_M / 10))
    if positions_m:
        xs, ys = zip(*positions_m)
        ax.hist2d(xs, ys, bins=(21, 14), range=[[0, PITCH_LENGTH_M], [0, PITCH_WIDTH_M]], cmap="hot")
    ax.set_xlim(0, PITCH_LENGTH_M)
    ax.set_ylim(0, PITCH_WIDTH_M)
    ax.axis("off")
    fig.savefig(output_path, bbox_inches="tight", pad_inches=0)
    plt.close(fig)
    return output_path
