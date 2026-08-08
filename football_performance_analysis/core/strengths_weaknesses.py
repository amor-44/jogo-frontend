
from __future__ import annotations
from typing import Dict, List, Tuple

MIN_CONFIDENCE = 0.5
STRENGTH_THRESHOLD = 75.0
WEAKNESS_THRESHOLD = 65.0
TOP_N = 3

METRIC_LABELS = {
    "passing_accuracy": "Passing",
    "ball_control": "Ball Control",
    "positioning_score": "Positioning",
    "position_score": "Positional Play",
    "movement_efficiency": "Movement Efficiency",
    "defensive_actions": "Defensive Actions",
    "attacking_impact": "Attacking Impact",
    "decision_making": "Decision Making",
}


def derive_strengths_weaknesses(
    metric_values: Dict[str, float], metric_confidence: Dict[str, float]
) -> Tuple[List[str], List[str]]:
    eligible = [
        (name, val) for name, val in metric_values.items()
        if val is not None and metric_confidence.get(name, 0.0) >= MIN_CONFIDENCE
    ]

    strengths = sorted(
        [(n, v) for n, v in eligible if v >= STRENGTH_THRESHOLD],
        key=lambda x: -x[1],
    )[:TOP_N]
    weaknesses = sorted(
        [(n, v) for n, v in eligible if v <= WEAKNESS_THRESHOLD],
        key=lambda x: x[1],
    )[:TOP_N]

    strength_labels = [METRIC_LABELS.get(n, n) for n, _ in strengths]
    # avoid "Positioning" / "Positional Play" both appearing for the same underlying metric
    weakness_labels = []
    seen = set()
    for n, _ in weaknesses:
        label = METRIC_LABELS.get(n, n)
        if label not in seen:
            weakness_labels.append(label)
            seen.add(label)

    return strength_labels, weakness_labels
