
from __future__ import annotations
from typing import Dict, List, Tuple, Optional

MIN_CONFIDENCE = 0.1  # lowered — with YOLO, more metrics are eligible
STRENGTH_THRESHOLD = 65.0
WEAKNESS_THRESHOLD = 50.0
TOP_N = 3

METRIC_LABELS = {
    "passing_accuracy": "Passing Accuracy",
    "ball_control": "Ball Control",
    "positioning_score": "Positioning",
    "position_score": "Positional Play",
    "movement_efficiency": "Movement Efficiency",
    "defensive_actions": "Defensive Contribution",
    "attacking_impact": "Attacking Impact",
    "decision_making": "Decision Making",
}


def derive_strengths_weaknesses(
    metric_values: Dict[str, float], metric_confidence: Dict[str, float]
) -> Tuple[List[str], List[str]]:
    # Include all metrics that have a value, even with low confidence
    eligible = [
        (name, val) for name, val in metric_values.items()
        if val is not None and metric_confidence.get(name, 0.0) >= MIN_CONFIDENCE
    ]

    if not eligible:
        # If nothing is eligible, still return something useful
        return (
            ["Player detected and tracked throughout the video"],
            ["Upload a wider-angle video for more detailed analysis"],
        )

    strengths = sorted(
        [(n, v) for n, v in eligible if v >= STRENGTH_THRESHOLD],
        key=lambda x: -x[1],
    )[:TOP_N]
    weaknesses = sorted(
        [(n, v) for n, v in eligible if v <= WEAKNESS_THRESHOLD],
        key=lambda x: x[1],
    )[:TOP_N]

    strength_labels = [METRIC_LABELS.get(n, n) for n, _ in strengths]
    # avoid duplicate labels for position_score / positioning_score
    weakness_labels = []
    seen = set()
    for n, _ in weaknesses:
        label = METRIC_LABELS.get(n, n)
        if label not in seen:
            weakness_labels.append(label)
            seen.add(label)

    # Ensure we always have at least one strength and one area to improve
    if not strength_labels:
        best = max(eligible, key=lambda x: x[1])
        strength_labels = [METRIC_LABELS.get(best[0], best[0])]

    if not weakness_labels:
        worst = min(eligible, key=lambda x: x[1])
        weakness_labels = [METRIC_LABELS.get(worst[0], worst[0])]

    return strength_labels, weakness_labels
