"""
Training Recommendations
=========================
Generates specific, actionable recommendations tied to the ACTUAL detected
weakness and its supporting evidence numbers (spec section 12) - never a
generic "keep practicing" line.

Each weakness label maps to a template that is filled in with the real
evidence for that metric, so two players with the same weak label but
different underlying numbers get differently-worded advice.
"""
from __future__ import annotations
from typing import Dict, List, Optional

from .models import MetricResult


def _fmt_evidence(evidence: Dict) -> str:
    parts = [f"{k.replace('_', ' ')}: {v}" for k, v in evidence.items()
             if isinstance(v, (int, float, str)) and k != "note"]
    return ", ".join(parts)


def generate_recommendations(
    weaknesses: List[str], evidence: Dict[str, MetricResult]
) -> List[str]:
    recs: List[str] = []

    label_to_metric = {
        "Passing": "passing_accuracy",
        "Ball Control": "ball_control",
        "Positioning": "positioning_score",
        "Positional Play": "position_score",
        "Movement Efficiency": "movement_efficiency",
        "Defensive Actions": "defensive_actions",
        "Attacking Impact": "attacking_impact",
        "Decision Making": "decision_making",
    }

    for label in weaknesses:
        metric_name = label_to_metric.get(label)
        result = evidence.get(metric_name) if metric_name else None
        val = result.value if result else None
        ev = result.evidence if result else {}

        if metric_name == "passing_accuracy" and val is not None:
            completed = ev.get("completed_passes", 0)
            attempts = ev.get("pass_attempts", 0)
            recs.append(
                f"Passing accuracy was {val}% ({completed}/{attempts} passes completed in the "
                "clip). Work on scanning the field and picking the pass target before receiving "
                "the ball, and prioritize shorter, higher-percentage passes under pressure "
                "instead of forcing longer ones."
            )
        elif metric_name == "ball_control" and val is not None:
            losses = ev.get("uncontrolled_losses", 0)
            touches = ev.get("touches", 0)
            recs.append(
                f"Ball control scored {val}/100, with {losses} uncontrolled loss(es) out of "
                f"{touches} tracked touches. Add close-control drills (cone weaves, first-touch "
                "cushioning against a wall) focused on taking the ball away from pressure in one "
                "touch rather than needing a second touch to settle it."
            )
        elif metric_name == "movement_efficiency" and val is not None:
            smoothness = ev.get("movement_smoothness_0to1")
            recs.append(
                f"Movement efficiency scored {val}/100"
                + (f" (movement smoothness {smoothness})" if smoothness is not None else "")
                + ". Add short interval sprints with direction changes (e.g. 5-10m shuttle runs) "
                "to build more purposeful, less erratic off-ball movement, and work on scanning "
                "before making a run so movement is directed rather than reactive."
            )
        elif metric_name == "attacking_impact" and val is not None:
            recs.append(
                f"Attacking output scored {val}/100 based on shot/dribble/progressive-pass "
                "activity in the clip. Increase off-ball movement into space in the final third "
                "and practice first-time shooting/finishing drills to increase attacking touches "
                "per possession."
            )
        elif metric_name == "defensive_actions" and val is not None:
            recs.append(
                f"Defensive actions scored {val}/100. Work on jockeying and delaying 1v1 duels "
                "rather than diving into early challenges, to convert more defensive situations "
                "into clean recoveries."
            )
        elif metric_name in ("positioning_score", "position_score") and val is not None:
            recs.append(
                f"Positioning scored {val}/100. Focus on positional awareness drills (rondos, "
                "small-sided possession games) that reward finding space relative to teammates "
                "before the ball arrives."
            )
        elif metric_name == "decision_making" and val is not None:
            recs.append(
                f"Decision making scored {val}/100. Work on scanning the field before receiving "
                "the ball (shoulder checks every few seconds off the ball) to speed up and "
                "improve the pass/dribble/shoot decision once it arrives."
            )
        # If val is None the metric was flagged unavailable, not weak - it
        # should not have produced a weakness label in the first place, so
        # there's intentionally no fallback branch generating advice from
        # nothing here.

    return recs
