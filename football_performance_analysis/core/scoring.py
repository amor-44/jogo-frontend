from __future__ import annotations
from typing import Dict, Optional


DIMENSION_WEIGHTS = {
    "technical": 0.35,
    "tactical": 0.30,
    "physical": 0.15,
    "contribution": 0.20,
}

DIMENSION_METRICS = {
    "technical": ["passing_accuracy", "ball_control"],
    "tactical": ["positioning_score", "decision_making"],
    "physical": ["movement_efficiency"],
    "contribution": ["defensive_actions", "attacking_impact"],
}


def compute_overall_score(metric_values: Dict[str, Optional[float]]) -> Optional[float]:
    available_count = sum(1 for v in metric_values.values() if v is not None)
    if available_count < 2:
        return None

    dim_scores = {}
    for dim, names in DIMENSION_METRICS.items():
        vals = [metric_values[n] for n in names if metric_values.get(n) is not None]
        if vals:
            dim_scores[dim] = sum(vals) / len(vals)

    if not dim_scores:
        return None

    total_weight = sum(DIMENSION_WEIGHTS[d] for d in dim_scores)
    overall = sum(dim_scores[d] * DIMENSION_WEIGHTS[d] for d in dim_scores) / total_weight
    return round(overall, 1)
