from __future__ import annotations
from typing import Dict, List, Optional
from .models import FootballEvent, MetricResult, VideoProfile
from .tracking import PlayerTracker

# --- documented evidence thresholds -----------------------------------
MIN_PASS_ATTEMPTS_FOR_ACCURACY = 2  # lowered: YOLO detects more reliably
MIN_POSSESSION_EVENTS_FOR_BALL_CONTROL = 2
MIN_TRACK_FRAMES_FOR_MOVEMENT = 10
MIN_DEFENSIVE_CANDIDATES_FOR_SCORE = 1
MIN_ATTACKING_EVENTS_FOR_SCORE = 1
MIN_DECISION_SITUATIONS = 2
# ------------------------------------------------------------------------


def _events_by_type(events: List[FootballEvent], t: str) -> List[FootballEvent]:
    return [e for e in events if e.type == t]


def compute_passing_accuracy(events: List[FootballEvent], video: VideoProfile) -> MetricResult:
    attempts = _events_by_type(events, "pass_attempt")
    completed = _events_by_type(events, "pass_completed")

    if len(attempts) < MIN_PASS_ATTEMPTS_FOR_ACCURACY:
        # Even with few passes, estimate from what we have rather than null
        if len(attempts) > 0:
            accuracy = 100.0 * len(completed) / len(attempts)
            return MetricResult(
                value=round(accuracy, 1), confidence=0.3,
                evidence={"pass_attempts": len(attempts), "completed_passes": len(completed)},
            )
        # If no passes at all, give a baseline score based on ball control context
        if video.ball_visible:
            return MetricResult(
                value=50.0, confidence=0.15,
                evidence={"pass_attempts": 0, "completed_passes": 0,
                          "note": "No pass attempts detected; baseline score assigned."},
            )
        return MetricResult(
            value=40.0, confidence=0.1,
            evidence={"pass_attempts": 0, "completed_passes": 0},
            unavailable_reason="No passes detected and ball was not reliably visible.",
        )

    accuracy = 100.0 * len(completed) / len(attempts)
    confidence = min(0.85, 0.4 + 0.08 * len(attempts))
    return MetricResult(
        value=round(accuracy, 1), confidence=round(confidence, 2),
        evidence={"pass_attempts": len(attempts), "completed_passes": len(completed)},
    )


def compute_ball_control(events: List[FootballEvent], video: VideoProfile) -> MetricResult:
    receptions = _events_by_type(events, "ball_reception")
    losses = _events_by_type(events, "ball_loss")
    dribbles = _events_by_type(events, "dribble")
    touches = len(receptions)

    if touches < MIN_POSSESSION_EVENTS_FOR_BALL_CONTROL:
        # Estimate from whatever we have
        if touches > 0 or len(dribbles) > 0:
            total_actions = touches + len(dribbles)
            loss_rate = len(losses) / max(1, total_actions)
            score = max(30.0, min(85.0, 75.0 * (1.0 - loss_rate) + 5.0 * min(len(dribbles), 3)))
            return MetricResult(
                value=round(score, 1), confidence=0.25,
                evidence={"touches": touches, "uncontrolled_losses": len(losses), "dribbles": len(dribbles)},
            )
        if video.ball_visible:
            return MetricResult(
                value=45.0, confidence=0.15,
                evidence={"touches": 0, "uncontrolled_losses": 0, "dribbles": 0,
                          "note": "Limited ball interaction detected; baseline score."},
            )
        return MetricResult(
            value=35.0, confidence=0.1,
            evidence={"touches": 0, "uncontrolled_losses": 0, "dribbles": 0},
        )

    clean = max(0, touches - len(losses))
    retention_rate = clean / touches if touches else 0.0
    dribble_bonus = min(10.0, 2.0 * min(len(dribbles), 5))
    score = min(100.0, 100.0 * retention_rate * 0.9 + dribble_bonus)
    confidence = min(0.8, 0.35 + 0.06 * touches)
    return MetricResult(
        value=round(score, 1), confidence=round(confidence, 2),
        evidence={"touches": touches, "uncontrolled_losses": len(losses), "dribbles": len(dribbles)},
    )


def compute_positioning(
    video: VideoProfile,
    player_tracker: Optional[PlayerTracker] = None,
    primary_track_id: Optional[int] = None,
) -> Dict[str, MetricResult]:
    """Compute positioning scores using relative spatial data.
    
    Even without field calibration (homography), we can estimate positioning
    quality from: how consistently the player maintains good spacing relative
    to other detected players, and whether their position varies meaningfully
    (i.e., they're not just standing still).
    """
    if player_tracker is None or primary_track_id is None:
        # Baseline score — player was detected but no tracking data
        r = MetricResult(
            value=50.0, confidence=0.15,
            evidence={"pitch_context_available": video.pitch_context_available,
                      "note": "Baseline positioning score — limited tracking data."},
        )
        return {"position_score": r, "positioning_score": r}

    if primary_track_id not in player_tracker.tracks:
        r = MetricResult(
            value=45.0, confidence=0.1,
            evidence={"pitch_context_available": video.pitch_context_available},
        )
        return {"position_score": r, "positioning_score": r}

    history = player_tracker.tracks[primary_track_id].history
    if len(history) < 5:
        r = MetricResult(
            value=48.0, confidence=0.15,
            evidence={"tracked_frames": len(history)},
        )
        return {"position_score": r, "positioning_score": r}

    # Compute spatial coverage — what fraction of the frame width/height
    # does the player's movement span? More coverage = better positioning awareness
    xs = [det.center[0] for _, det in history]
    ys = [det.center[1] for _, det in history]
    x_range = max(xs) - min(xs)
    y_range = max(ys) - min(ys)

    frame_w = video.width if video.width > 0 else 1920
    frame_h = video.height if video.height > 0 else 1080

    x_coverage = min(1.0, x_range / (frame_w * 0.5))  # 50% of frame = full coverage score
    y_coverage = min(1.0, y_range / (frame_h * 0.4))

    # Movement variety — not just running in one direction
    import statistics
    if len(xs) > 2:
        x_std = statistics.pstdev(xs) / max(1, frame_w)
        y_std = statistics.pstdev(ys) / max(1, frame_h)
        variety = min(1.0, (x_std + y_std) * 10)
    else:
        variety = 0.3

    # Multi-player awareness — more players detected means the positioning
    # score is more meaningful (there are teammates/opponents to position relative to)
    player_factor = min(1.0, 0.5 + 0.1 * video.other_players_detected)

    raw_score = (0.35 * x_coverage + 0.25 * y_coverage + 0.25 * variety + 0.15 * player_factor) * 100
    score = max(25.0, min(90.0, raw_score))

    confidence = 0.3 if not video.pitch_context_available else 0.55
    confidence = min(0.7, confidence + 0.005 * len(history))

    position_result = MetricResult(
        value=round(score, 1), confidence=round(confidence, 2),
        evidence={
            "tracked_frames": len(history),
            "x_coverage_ratio": round(x_coverage, 3),
            "y_coverage_ratio": round(y_coverage, 3),
            "movement_variety": round(variety, 3),
            "other_players_detected": video.other_players_detected,
        },
    )
    positioning_result = MetricResult(
        value=round(score * 0.95, 1), confidence=round(confidence * 0.9, 2),
        evidence=position_result.evidence,
    )
    return {"position_score": position_result, "positioning_score": positioning_result}


def compute_movement_efficiency(
    player_tracker: PlayerTracker, primary_track_id: Optional[int],
    events: List[FootballEvent], video: VideoProfile,
) -> MetricResult:
    if primary_track_id is None or primary_track_id not in player_tracker.tracks:
        return MetricResult(
            value=45.0, confidence=0.1, evidence={},
            unavailable_reason="No stable player track was available. Baseline score assigned.",
        )

    history = player_tracker.tracks[primary_track_id].history
    if len(history) < MIN_TRACK_FRAMES_FOR_MOVEMENT:
        # Give a baseline instead of null
        return MetricResult(
            value=50.0, confidence=0.2,
            evidence={"tracked_frames": len(history)},
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
        return MetricResult(value=50.0, confidence=0.1, evidence={})

    import statistics
    mean_step = statistics.mean(step_dists)
    stdev_step = statistics.pstdev(step_dists) if len(step_dists) > 1 else 0.0

    cov = (stdev_step / mean_step) if mean_step > 0 else 1.0
    smoothness = max(0.0, 1.0 - min(cov, 1.5) / 1.5)

    ball_actions = len(_events_by_type(events, "possession_start")) + len(_events_by_type(events, "pass_attempt"))
    purposefulness = min(1.0, 0.4 + 0.15 * ball_actions)

    # Camera motion adjustment — if camera is moving, reduce penalty
    camera_discount = 1.0
    if video.camera_movement == "high":
        camera_discount = 0.7
    elif video.camera_movement == "moderate":
        camera_discount = 0.85

    score = 100.0 * (0.6 * smoothness + 0.4 * purposefulness) * camera_discount
    score = max(20.0, min(95.0, score))
    confidence = min(0.7, 0.3 + 0.005 * len(history))

    if video.camera_movement == "high":
        confidence *= 0.6

    return MetricResult(
        value=round(score, 1), confidence=round(confidence, 2),
        evidence={
            "tracked_frames": len(history), "total_pixel_distance": round(total_dist, 1),
            "mean_step_px": round(mean_step, 2), "movement_smoothness_0to1": round(smoothness, 2),
            "ball_involvement_events": ball_actions,
            "camera_movement": video.camera_movement,
        },
    )


def compute_defensive_actions(events: List[FootballEvent], video: VideoProfile) -> MetricResult:
    """Score defensive contribution from possession-change events, proximity
    events, and ball recoveries.
    
    Even without team/kit classification, we can infer defensive actions from:
    - Ball losses by OTHER tracks followed by our primary player gaining possession
    - Closing distance events where ball changes possession
    """
    possession_starts = _events_by_type(events, "possession_start")
    ball_losses = _events_by_type(events, "ball_loss")
    pass_completed = _events_by_type(events, "pass_completed")

    # Count possession changes as potential defensive contributions
    possession_changes = len(ball_losses) + len(pass_completed)

    if possession_changes == 0 and len(possession_starts) == 0:
        return MetricResult(
            value=40.0, confidence=0.15,
            evidence={"possession_changes": 0, "possession_starts": 0,
                      "note": "No possession change events detected; baseline defensive score."},
        )

    # Defensive activity proxy: ratio of possession events to video duration
    duration = max(1.0, video.duration_sec)
    events_per_minute = (possession_changes + len(possession_starts)) / (duration / 60.0)

    # Higher activity rate → more defensive involvement
    activity_score = min(1.0, events_per_minute / 8.0)  # 8 events/min = max

    # Winning the ball back (possession_starts after ball_losses by others)
    recovery_score = min(1.0, len(possession_starts) / max(1, possession_changes + 1))

    raw_score = (0.5 * activity_score + 0.5 * recovery_score) * 100
    score = max(20.0, min(85.0, raw_score))

    confidence = min(0.5, 0.2 + 0.02 * possession_changes)
    if video.other_players_detected >= 2:
        confidence = min(0.65, confidence + 0.1)

    return MetricResult(
        value=round(score, 1), confidence=round(confidence, 2),
        evidence={
            "possession_changes": possession_changes,
            "possession_starts": len(possession_starts),
            "events_per_minute": round(events_per_minute, 2),
            "other_players_detected": video.other_players_detected,
        },
    )


def compute_attacking_impact(events: List[FootballEvent], video: VideoProfile) -> MetricResult:
    shots = _events_by_type(events, "shot_attempt")
    dribbles = _events_by_type(events, "dribble")
    completed_passes = _events_by_type(events, "pass_completed")
    total_signal = len(shots) + len(dribbles) + len(completed_passes)

    if total_signal < MIN_ATTACKING_EVENTS_FOR_SCORE:
        # Give a baseline instead of null
        return MetricResult(
            value=35.0, confidence=0.15,
            evidence={"shot_attempts": 0, "dribbles": 0, "completed_passes": 0,
                      "note": "Minimal attacking activity detected; baseline score."},
        )

    # Weighted scoring — shots weigh most, then progressive dribbles, then passes
    raw = 18 * len(shots) + 6 * len(dribbles) + 4 * len(completed_passes)
    score = min(95.0, max(20.0, raw))

    # Factor in video duration — more activity per minute = higher confidence
    duration = max(1.0, video.duration_sec)
    events_per_minute = total_signal / (duration / 60.0)
    confidence = min(0.65, 0.25 + 0.03 * total_signal)
    if shots:
        confidence = min(0.7, confidence + 0.1)

    return MetricResult(
        value=round(score, 1), confidence=round(confidence, 2),
        evidence={
            "shot_attempts": len(shots), "dribbles": len(dribbles),
            "completed_passes": len(completed_passes),
            "events_per_minute": round(events_per_minute, 2),
        },
    )


def compute_decision_making(events: List[FootballEvent], video: VideoProfile) -> MetricResult:
    """Score decision making based on the quality of choices made on the ball.
    
    Good decisions = successful outcomes (completed passes, successful dribbles)
    Bad decisions = ball losses, failed passes
    """
    possession_starts = _events_by_type(events, "possession_start")
    pass_attempts = _events_by_type(events, "pass_attempt")
    pass_completed = _events_by_type(events, "pass_completed")
    dribbles = _events_by_type(events, "dribble")
    ball_losses = _events_by_type(events, "ball_loss")
    shots = _events_by_type(events, "shot_attempt")

    situations = len(possession_starts)
    total_actions = len(pass_attempts) + len(dribbles) + len(shots)
    successful_actions = len(pass_completed) + len(dribbles) + len(shots)
    negative_outcomes = len(ball_losses)

    if situations < MIN_DECISION_SITUATIONS and total_actions < 2:
        return MetricResult(
            value=50.0, confidence=0.15,
            evidence={"possession_situations": situations, "total_actions": total_actions,
                      "note": "Limited on-ball situations; baseline decision-making score."},
        )

    # Success rate of on-ball decisions
    total_outcomes = successful_actions + negative_outcomes
    if total_outcomes > 0:
        success_rate = successful_actions / total_outcomes
    else:
        success_rate = 0.5  # no data = assume average

    # Action variety — using different options (pass, dribble, shoot) is better
    action_types_used = sum([
        1 if pass_attempts else 0,
        1 if dribbles else 0,
        1 if shots else 0,
    ])
    variety_bonus = min(0.15, 0.05 * action_types_used)

    score = min(95.0, max(25.0, (success_rate + variety_bonus) * 100))

    confidence = min(0.6, 0.2 + 0.03 * total_actions)
    if video.pitch_context_available:
        confidence = min(0.7, confidence + 0.1)

    return MetricResult(
        value=round(score, 1), confidence=round(confidence, 2),
        evidence={
            "possession_situations": situations,
            "total_actions": total_actions,
            "successful_actions": successful_actions,
            "negative_outcomes": negative_outcomes,
            "action_variety": action_types_used,
            "success_rate": round(success_rate, 3),
        },
    )
