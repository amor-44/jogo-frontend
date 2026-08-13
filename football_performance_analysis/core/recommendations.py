"""
Training Recommendations
=========================
Generates specific, actionable recommendations tied to the ACTUAL detected
weakness and its supporting evidence numbers — never a generic "keep
practicing" line.

Always produces at least 2-3 recommendations even when data is limited.
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
        "Passing Accuracy": "passing_accuracy",
        "Passing": "passing_accuracy",
        "Ball Control": "ball_control",
        "Positioning": "positioning_score",
        "Positional Play": "position_score",
        "Movement Efficiency": "movement_efficiency",
        "Defensive Contribution": "defensive_actions",
        "Defensive Actions": "defensive_actions",
        "Attacking Impact": "attacking_impact",
        "Decision Making": "decision_making",
    }

    for label in weaknesses:
        metric_name = label_to_metric.get(label)
        result = evidence.get(metric_name) if metric_name else None
        val = result.value if result else None
        ev = result.evidence if result else {}

        if metric_name == "passing_accuracy":
            completed = ev.get("completed_passes", 0)
            attempts = ev.get("pass_attempts", 0)
            if val is not None:
                recs.append(
                    f"Passing accuracy scored {val:.0f}/100"
                    + (f" ({completed}/{attempts} passes completed)" if attempts > 0 else "")
                    + ". Focus on short-range passing drills under pressure — "
                    "practice 1-touch and 2-touch passing in tight rondos (4v2, 5v3) "
                    "to improve speed and accuracy of distribution."
                )
            else:
                recs.append(
                    "Limited passing data detected. Record match footage with a wider camera angle "
                    "to capture passing sequences, and focus on scanning the field before receiving the ball."
                )

        elif metric_name == "ball_control":
            losses = ev.get("uncontrolled_losses", 0)
            touches = ev.get("touches", 0)
            if val is not None:
                recs.append(
                    f"Ball control scored {val:.0f}/100"
                    + (f" with {losses} uncontrolled loss(es) from {touches} touches" if touches > 0 else "")
                    + ". Add daily close-control drills: cone weaves at pace, "
                    "wall-pass first-touch cushioning, and receiving under pressure "
                    "(have a partner apply light pressure while controlling)."
                )
            else:
                recs.append(
                    "Work on first-touch technique: practice receiving balls from various angles "
                    "and heights, aiming to settle the ball within one stride of your body."
                )

        elif metric_name == "movement_efficiency":
            smoothness = ev.get("movement_smoothness_0to1")
            if val is not None:
                recs.append(
                    f"Movement efficiency scored {val:.0f}/100"
                    + (f" (smoothness: {smoothness:.2f})" if smoothness is not None else "")
                    + ". Improve off-ball movement with exercises: shadow runs following "
                    "a coach's hand signals, 5-10m shuttle sprints with sharp direction "
                    "changes, and practice scanning (shoulder checks) before making runs."
                )
            else:
                recs.append(
                    "Work on purposeful off-ball movement: practice making diagonal runs, "
                    "checking in and out of spaces, and timing runs to lose your marker."
                )

        elif metric_name == "attacking_impact":
            shots = ev.get("shot_attempts", 0)
            dribbles_count = ev.get("dribbles", 0)
            if val is not None:
                recs.append(
                    f"Attacking impact scored {val:.0f}/100 "
                    f"({shots} shot attempt(s), {dribbles_count} dribble(s)). "
                    "Increase attacking output by: getting into the box more often, "
                    "taking on 1v1 situations when space allows, and practicing "
                    "first-time finishing drills from different angles."
                )
            else:
                recs.append(
                    "Increase attacking involvement: practice making runs into the final third, "
                    "combination play (give-and-go's), and shooting from various distances."
                )

        elif metric_name == "defensive_actions":
            if val is not None:
                recs.append(
                    f"Defensive contribution scored {val:.0f}/100. "
                    "Improve defensive work by: practicing jockeying technique to delay "
                    "attackers, working on recovery runs to get goal-side quickly, "
                    "and positioning to cut passing lanes rather than ball-watching."
                )
            else:
                recs.append(
                    "Build defensive awareness: practice tracking runners, "
                    "maintaining a compact shape with teammates, and timing tackles."
                )

        elif metric_name in ("positioning_score", "position_score"):
            if val is not None:
                recs.append(
                    f"Positioning scored {val:.0f}/100. "
                    "Improve spatial awareness with: small-sided possession games (rondos, "
                    "positional play 6v4), practice finding pockets of space between lines, "
                    "and study match footage to understand optimal positioning for your role."
                )
            else:
                recs.append(
                    "Develop positional awareness: watch professional matches focusing on "
                    "a player in your position, practice finding space in training, "
                    "and work on anticipating play patterns."
                )

        elif metric_name == "decision_making":
            success_rate = ev.get("success_rate", 0)
            action_variety = ev.get("action_variety", 0)
            if val is not None:
                recs.append(
                    f"Decision making scored {val:.0f}/100 "
                    f"(success rate: {success_rate:.0%}, action variety: {action_variety}/3). "
                    "Improve decisions by: scanning the field before receiving (shoulder checks "
                    "every 2-3 seconds), practicing in game-realistic scenarios (small-sided games), "
                    "and learning to recognize when to play simple vs. attempt a creative pass."
                )
            else:
                recs.append(
                    "Enhance decision-making: practice in game-realistic scenarios, "
                    "scan the field frequently before receiving the ball, and review "
                    "your own match footage to identify better options in key moments."
                )

    # Always include at least 2 recommendations
    if len(recs) < 2:
        recs.append(
            "Record your training sessions from a wider camera angle that shows the full pitch "
            "or half-pitch — this allows AI analysis to evaluate tactical positioning, "
            "decision-making, and interaction with teammates more accurately."
        )

    if len(recs) < 2:
        recs.append(
            "Consistency is key: aim for structured training 3-4 times per week, combining "
            "technical drills (ball mastery, passing patterns) with physical conditioning "
            "(sprint intervals, agility ladders) for well-rounded development."
        )

    return recs
