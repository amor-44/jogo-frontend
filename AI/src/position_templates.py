"""Position-based analysis (PRD Section 5.9).

No new model here — a business-logic/config layer that picks which metrics to surface
per position (Goalkeeper/Defender/Midfielder/Forward), and marks anything not actually
present in the job's output as unavailable rather than fabricating a number (PRD 5.9
step 73). Output matches the `positionAnalysis` field of the backend<->AI contract
(PRD Section 11.2): `{"position": ..., "unavailableMetrics": [...]}`.

Metric keys reference whatever 5.1-5.8 modules actually produce; ball-dependent metrics
(passAccuracy, shotsOnTarget, etc.) are always marked unavailable for MVP since ball
detection (5.6) is Production V1, not MVP, per the PRD.
"""

from dataclasses import dataclass
from typing import Literal

Position = Literal["Goalkeeper", "Defender", "Midfielder", "Forward"]

# One ordered metric list per position — this is the part meant to be co-designed with
# the Business Analyst (PRD 5.9 step 75), so keep it easy to edit without touching logic.
POSITION_TEMPLATES: dict[Position, list[str]] = {
    "Goalkeeper": [
        "distanceCoveredKm",
        "avgSpeedKmh",
        "maxSpeedKmh",
        "reactionTimeMs",  # ball-dependent, currently unavailable
        "positioningRelativeToGoalLine",  # ball-dependent, currently unavailable
    ],
    "Defender": [
        "distanceCoveredKm",
        "avgSpeedKmh",
        "maxSpeedKmh",
        "sprintsCount",
        "tackleCount",  # ball-dependent, currently unavailable
        "interceptionCount",  # ball-dependent, currently unavailable
    ],
    "Midfielder": [
        "distanceCoveredKm",
        "avgSpeedKmh",
        "maxSpeedKmh",
        "sprintsCount",
        "workRateHeatmapUrl",
        "passAccuracy",  # ball-dependent, currently unavailable
    ],
    "Forward": [
        "distanceCoveredKm",
        "avgSpeedKmh",
        "maxSpeedKmh",
        "sprintsCount",
        "movementIntoSpaceScore",
        "shotsOnTarget",  # ball-dependent, currently unavailable
    ],
}

# Metrics no upstream MVP module produces yet — always unavailable regardless of job output,
# until ball detection (5.6, Production V1) and its dependents ship.
BALL_DEPENDENT_METRICS = {
    "reactionTimeMs",
    "positioningRelativeToGoalLine",
    "tackleCount",
    "interceptionCount",
    "passAccuracy",
    "shotsOnTarget",
}


@dataclass
class PositionAnalysis:
    position: Position
    available_metrics: dict[str, object]
    unavailable_metrics: list[str]


def build_position_analysis(position: Position, job_metrics: dict[str, object]) -> PositionAnalysis:
    """Select the template for `position` and populate it from whatever `job_metrics` has.

    `job_metrics` is the flat dict of everything 5.1-5.8 actually computed for this job
    (e.g. from the `metrics` block of PRD 11.2). Anything the template wants that isn't
    in there — ball-dependent or otherwise missing — is reported as unavailable rather
    than fabricated (PRD 5.9 step 73).
    """
    template = POSITION_TEMPLATES.get(position)
    if template is None:
        raise ValueError(f"no template defined for position {position!r}")

    available: dict[str, object] = {}
    unavailable: list[str] = []

    for metric_key in template:
        if metric_key in BALL_DEPENDENT_METRICS or metric_key not in job_metrics:
            unavailable.append(metric_key)
            continue
        available[metric_key] = job_metrics[metric_key]

    return PositionAnalysis(
        position=position,
        available_metrics=available,
        unavailable_metrics=unavailable,
    )
