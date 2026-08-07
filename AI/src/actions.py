"""Action recognition — MVP movement actions (PRD Section 5.7).

Classifies sprint/jog/change-of-direction from the tracking trajectory using simple,
explainable rule-based thresholds (PRD 5.7 steps 62-64) — a RandomForestClassifier is
only worth adding later if the rules prove too rigid on real footage, per the PRD, and
is deliberately not implemented here to keep the feature set small and explainable.

Ball-related actions (pass/shot/header/tackle) are Production V1 scope (depend on ball
detection, PRD 5.6, which is also Production V1) — not implemented here.

Output matches the `actions` field of the backend<->AI contract (PRD Section 11.2):
a list of `{type, confidence, timestampMs}`.
"""

import math
from dataclasses import dataclass
from typing import Literal

from metrics import TrajectoryPoint

ActionType = Literal["sprint", "jog", "change_of_direction"]

SPRINT_SPEED_KMH = 20.0
JOG_SPEED_MIN_KMH = 8.0
JOG_SPEED_MAX_KMH = 20.0
SPRINT_MIN_DURATION_S = 1.0
DIRECTION_CHANGE_ANGLE_DEG = 60.0
LOW_CONFIDENCE_THRESHOLD = 0.6  # PRD 5.7 step 66: below this, report as "unconfirmed"


@dataclass
class ActionEvent:
    action_type: ActionType
    confidence: float
    timestamp_ms: float
    unconfirmed: bool = False


def _velocity_vectors(real_world_points_m: list[tuple[float, float]], timestamps_ms: list[float]):
    """Per-segment (speed_kmh, direction_deg, midpoint_timestamp_ms)."""
    vectors = []
    for i in range(1, len(real_world_points_m)):
        (x0, y0), (x1, y1) = real_world_points_m[i - 1], real_world_points_m[i]
        dt_s = (timestamps_ms[i] - timestamps_ms[i - 1]) / 1000.0
        if dt_s <= 0:
            continue
        dx, dy = x1 - x0, y1 - y0
        distance_m = math.hypot(dx, dy)
        speed_kmh = (distance_m / dt_s) * 3.6
        direction_deg = math.degrees(math.atan2(dy, dx))
        midpoint_ts = (timestamps_ms[i] + timestamps_ms[i - 1]) / 2
        vectors.append((speed_kmh, direction_deg, midpoint_ts))
    return vectors


def classify_actions(trajectory: list[TrajectoryPoint], real_world_points_m: list[tuple[float, float]]) -> list[ActionEvent]:
    """PRD 5.7 steps 62-64: rule-based sprint/jog/direction-change classification.

    `real_world_points_m` must be the same length as `trajectory`, aligned index-for-index
    (i.e. the output of `metrics.compute_metrics`'s homography transform).
    """
    if len(trajectory) != len(real_world_points_m) or len(trajectory) < 2:
        return []

    timestamps_ms = [p.timestamp_ms for p in trajectory]
    vectors = _velocity_vectors(real_world_points_m, timestamps_ms)

    events: list[ActionEvent] = []
    sprint_start_idx: int | None = None

    for i, (speed_kmh, direction_deg, ts) in enumerate(vectors):
        if speed_kmh > SPRINT_SPEED_KMH:
            if sprint_start_idx is None:
                sprint_start_idx = i
        else:
            if sprint_start_idx is not None:
                _emit_sprint_if_long_enough(events, vectors, sprint_start_idx, i)
                sprint_start_idx = None

        if JOG_SPEED_MIN_KMH <= speed_kmh <= JOG_SPEED_MAX_KMH:
            events.append(ActionEvent("jog", confidence=0.8, timestamp_ms=ts))

        if i > 0:
            _, prev_direction_deg, _ = vectors[i - 1]
            angle_delta = abs((direction_deg - prev_direction_deg + 180) % 360 - 180)
            if angle_delta > DIRECTION_CHANGE_ANGLE_DEG and speed_kmh > JOG_SPEED_MIN_KMH:
                confidence = min(1.0, angle_delta / 180)
                events.append(
                    ActionEvent(
                        "change_of_direction",
                        confidence=confidence,
                        timestamp_ms=ts,
                        unconfirmed=confidence < LOW_CONFIDENCE_THRESHOLD,
                    )
                )

    if sprint_start_idx is not None:
        _emit_sprint_if_long_enough(events, vectors, sprint_start_idx, len(vectors))

    return events


def _emit_sprint_if_long_enough(events: list[ActionEvent], vectors, start_idx: int, end_idx: int) -> None:
    if end_idx <= start_idx:
        return
    duration_s = (vectors[end_idx - 1][2] - vectors[start_idx][2]) / 1000.0
    if duration_s < SPRINT_MIN_DURATION_S:
        return
    peak_speed = max(v[0] for v in vectors[start_idx:end_idx])
    confidence = min(1.0, peak_speed / (SPRINT_SPEED_KMH * 1.5))
    events.append(
        ActionEvent(
            "sprint",
            confidence=confidence,
            timestamp_ms=vectors[start_idx][2],
            unconfirmed=confidence < LOW_CONFIDENCE_THRESHOLD,
        )
    )
