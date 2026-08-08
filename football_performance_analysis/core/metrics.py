from __future__ import annotations
from typing import Dict, List, Optional
from .models import FootballEvent, MetricResult, VideoProfile
from .tracking import PlayerTracker

# --- documented evidence thresholds -----------------------------------
MIN_PASS_ATTEMPTS_FOR_ACCURACY = 3
MIN_POSSESSION_EVENTS_FOR_BALL_CONTROL = 3
MIN_TRACK_FRAMES_FOR_MOVEMENT = 15
MIN_DEFENSIVE_CANDIDATES_FOR_SCORE = 1
MIN_ATTACKING_EVENTS_FOR_SCORE = 1
MIN_DECISION_SITUATIONS = 3
# ------------------------------------------------------------------------


def _events_by_type(events: List[FootballEvent], t: str) -> List[FootballEvent]:
    return [e for e in events if e.type == t]


def compute_passing_accuracy(events: List[FootballEvent], video: VideoProfile) -> MetricResult:
    if video.other_players_detected < 2:
        return MetricResult(
            value=None, confidence=0.0,
            evidence={"other_players_detected": video.other_players_detected},
            unavailable_reason=(
                "Fewer than 2 players were ever detected together, so a pass's "
                "receiving player cannot be identified and completion cannot be judged."
            ),
        )
    attempts = _events_by_type(events, "pass_attempt")
    completed = _events_by_type(events, "pass_completed")
    if len(attempts) < MIN_PASS_ATTEMPTS_FOR_ACCURACY:
        return MetricResult(
            value=None, confidence=0.2,
            evidence={"pass_attempts": len(attempts), "completed_passes": len(completed)},
            unavailable_reason=(
                f"Only {len(attempts)} pass attempt(s) detected "
                f"(need >= {MIN_PASS_ATTEMPTS_FOR_ACCURACY} for a stable accuracy estimate)."
            ),
        )
    accuracy = 100.0 * len(completed) / len(attempts)
    # confidence grows with sample size, capped
    confidence = min(0.85, 0.35 + 0.08 * len(attempts))
    return MetricResult(
        value=round(accuracy, 1), confidence=round(confidence, 2),
        evidence={"pass_attempts": len(attempts), "completed_passes": len(completed)},
    )


def compute_ball_control(events: List[FootballEvent], video: VideoProfile) -> MetricResult:
    if not video.ball_visible:
        return MetricResult(
            value=None, confidence=0.0, evidence={"ball_visibility_ratio": video.ball_visibility_ratio},
            unavailable_reason="Ball was not reliably visible in the video.",
        )
    receptions = _events_by_type(events, "ball_reception")
    losses = _events_by_type(events, "ball_loss")
    dribbles = _events_by_type(events, "dribble")
    touches = len(receptions)
    if touches < MIN_POSSESSION_EVENTS_FOR_BALL_CONTROL:
        return MetricResult(
            value=None, confidence=0.2,
            evidence={"touches": touches, "uncontrolled_losses": len(losses), "dribbles": len(dribbles)},
            unavailable_reason=(
                f"Only {touches} clean possession event(s) detected "
                f"(need >= {MIN_POSSESSION_EVENTS_FOR_BALL_CONTROL})."
            ),
        )
    clean = max(0, touches - len(losses))
    retention_rate = clean / touches if touches else 0.0
    # dribbling under control nudges the score up a little (evidence of sustained control)
    dribble_bonus = min(10.0, 2.0 * min(len(dribbles), 5))
    score = min(100.0, 100.0 * retention_rate * 0.9 + dribble_bonus)
    confidence = min(0.8, 0.3 + 0.06 * touches)
    return MetricResult(
        value=round(score, 1), confidence=round(confidence, 2),
        evidence={"touches": touches, "uncontrolled_losses": len(losses), "dribbles": len(dribbles)},
    )


def compute_positioning(video: VideoProfile) -> Dict[str, MetricResult]:
    reason = (
        "The camera does not show enough of the pitch and/or fewer than 2 players "
        "are visible together, so positioning relative to teammates/opponents/space "
        "cannot be evaluated."
    )
    if not video.pitch_context_available:
        r = MetricResult(value=None, confidence=0.0,
                          evidence={"pitch_context_available": False}, unavailable_reason=reason)
        return {"position_score": r, "positioning_score": r}
    # Even with pitch context available, this MVP does not implement field
    # calibration (homography) or a tactical model, so we still cannot
    # produce a trustworthy positioning number - we say so explicitly
    # rather than inventing one. This is the honest MVP boundary from
    # spec section 18/20 ("add the component only if practical for MVP").
    r = MetricResult(
        value=None, confidence=0.1,
        evidence={"pitch_context_available": True},
        unavailable_reason=(
            "Pitch context is visible, but this MVP does not yet include field "
            "calibration (homography) or a tactical positioning model, so a "
            "numeric positioning score is not computed. See 'Known limitations'."
        ),
    )
    return {"position_score": r, "positioning_score": r}


def compute_movement_efficiency(
    player_tracker: PlayerTracker, primary_track_id: Optional[int],
    events: List[FootballEvent], video: VideoProfile,
) -> MetricResult:
    if primary_track_id is None or primary_track_id not in player_tracker.tracks:
        return MetricResult(value=None, confidence=0.0, evidence={},
                             unavailable_reason="No stable player track was available.")
    history = player_tracker.tracks[primary_track_id].history
    if len(history) < MIN_TRACK_FRAMES_FOR_MOVEMENT:
        return MetricResult(
            value=None, confidence=0.2, evidence={"tracked_frames": len(history)},
            unavailable_reason=(
                f"Player was only tracked for {len(history)} frames "
                f"(need >= {MIN_TRACK_FRAMES_FOR_MOVEMENT})."
            ),
        )
    if video.camera_movement == "high":
        return MetricResult(
            value=None, confidence=0.15, evidence={"camera_movement": video.camera_movement},
            unavailable_reason=(
                "Camera movement is high enough that on-field player displacement cannot "
                "be reliably separated from camera motion without field calibration."
            ),
        )
    total_dist = 0.0
    step_dists = []
    for (t0, d0), (t1, d1) in zip(history, history[1:]):
        dx = d1.center[0] - d0.center[0]
        dy = d1.center[1] - d0.center[1]
        d = (dx ** 2 + dy ** 2) ** 0.5
        step_dists.append(d)
        total_dist += d
    if not step_dists:
        return MetricResult(value=None, confidence=0.0, evidence={},
                             unavailable_reason="Not enough consecutive frames to compute movement.")

    import statistics
    mean_step = statistics.mean(step_dists)
    stdev_step = statistics.pstdev(step_dists) if len(step_dists) > 1 else 0.0
    # "Efficiency" = purposeful, sustained movement rather than jittery/erratic
    # motion. We approximate this with a coefficient-of-variation penalty:
    # low relative variance in step size => smoother, more purposeful
    # movement => higher efficiency. This is a proxy, not a biomechanical
    # measurement (no pose/acceleration data available in this MVP).
    cov = (stdev_step / mean_step) if mean_step > 0 else 1.0
    smoothness = max(0.0, 1.0 - min(cov, 1.5) / 1.5)  # 0..1

    ball_actions = len(_events_by_type(events, "possession_start")) + len(_events_by_type(events, "pass_attempt"))
    purposefulness = min(1.0, 0.4 + 0.15 * ball_actions)  # more ball involvement -> more purposeful sample

    score = 100.0 * (0.6 * smoothness + 0.4 * purposefulness)
    confidence = min(0.7, 0.3 + 0.005 * len(history))
    return MetricResult(
        value=round(score, 1), confidence=round(confidence, 2),
        evidence={
            "tracked_frames": len(history), "total_pixel_distance": round(total_dist, 1),
            "mean_step_px": round(mean_step, 2), "movement_smoothness_0to1": round(smoothness, 2),
            "ball_involvement_events": ball_actions,
        },
    )


def compute_defensive_actions(events: List[FootballEvent], video: VideoProfile) -> MetricResult:
    if video.other_players_detected < 2:
        return MetricResult(
            value=None, confidence=0.0, evidence={"other_players_detected": video.other_players_detected},
            unavailable_reason="Fewer than 2 players tracked; defensive actions against an opponent cannot be identified.",
        )
    candidates = _events_by_type(events, "pass_completed")  # possession-change proxy pool
    # NOTE: this MVP's event vocabulary does not yet include a dedicated
    # tackle/interception classifier (would need opponent-vs-teammate
    # identification, which requires team/kit classification - not
    # implemented). We therefore do not fabricate a defensive_actions
    # number even when possession changes are observed.
    return MetricResult(
        value=None, confidence=0.1,
        evidence={"possession_change_events": len(candidates)},
        unavailable_reason=(
            "Possession changes were observed, but distinguishing a defensive action "
            "(tackle/interception/press) from an unrelated possession change requires "
            "team/kit identification, which this MVP does not implement."
        ),
    )


def compute_attacking_impact(events: List[FootballEvent], video: VideoProfile) -> MetricResult:
    shots = _events_by_type(events, "shot_attempt")
    dribbles = _events_by_type(events, "dribble")
    completed_passes = _events_by_type(events, "pass_completed")
    total_signal = len(shots) + len(dribbles) + len(completed_passes)
    if total_signal < MIN_ATTACKING_EVENTS_FOR_SCORE:
        return MetricResult(
            value=None, confidence=0.1,
            evidence={"shot_attempts": len(shots), "dribbles": len(dribbles), "completed_passes": len(completed_passes)},
            unavailable_reason="No shot, dribble, or completed-pass evidence detected.",
        )
    # weighted, documented combination - shots weigh most, then progression
    raw = 18 * len(shots) + 6 * len(dribbles) + 4 * len(completed_passes)
    score = min(100.0, raw)
    confidence = 0.3 if not shots else 0.45  # shot-detection here is a speed proxy, not goal-confirmed
    return MetricResult(
        value=round(score, 1), confidence=round(confidence, 2),
        evidence={
            "shot_attempts_candidate": len(shots), "dribbles": len(dribbles),
            "completed_passes": len(completed_passes),
            "note": "shot_attempts_candidate is a high-ball-speed release proxy, not a confirmed shot-on-goal.",
        },
    )


def compute_decision_making(events: List[FootballEvent], video: VideoProfile) -> MetricResult:
    if not video.pitch_context_available:
        return MetricResult(
            value=None, confidence=0.0, evidence={"pitch_context_available": False},
            unavailable_reason=(
                "The video does not show enough of the field/surrounding players to know what "
                "options were actually available to the player, so decisions cannot be judged."
            ),
        )
    situations = len(_events_by_type(events, "possession_start"))
    if situations < MIN_DECISION_SITUATIONS:
        return MetricResult(
            value=None, confidence=0.15, evidence={"possession_situations": situations},
            unavailable_reason=(
                f"Only {situations} on-ball situation(s) observed "
                f"(need >= {MIN_DECISION_SITUATIONS}) and this has no tactical-option "
                "model to compare the chosen action against visible alternatives."
            ),
        )
    return MetricResult(
        value=None, confidence=0.15, evidence={"possession_situations": situations},
        unavailable_reason=(
            "This detects on-ball situations but does not yet model which options "
            "(pass lanes, space, opponent pressure) were actually available at each moment, "
            "so it cannot judge whether the chosen action was appropriate. Returning null "
            "rather than guessing, per spec section 7."
        ),
    )
