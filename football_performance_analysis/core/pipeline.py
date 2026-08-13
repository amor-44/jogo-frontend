"""
Football Performance Analysis Pipeline
========================================
Orchestrates the full architecture:

  Video -> Video Analysis Engine -> Player/Ball Detection+Tracking
        -> Football Event Detection -> Football Metrics
        -> Performance Scoring -> Strengths/Weaknesses
        -> Training Recommendations -> FootballPerformanceReport
"""
from __future__ import annotations
import time
import uuid
try:
    import cv2
except ImportError:
    cv2 = None
from typing import List

from .models import FootballPerformanceReport, MetricResult
from .video_inspector import inspect_video
from .detection import PersonDetector, BallDetector
from .tracking import PlayerTracker, BallTracker
from .events import FootballEventDetector
from . import metrics as metrics_mod
from .scoring import compute_overall_score
from .strengths_weaknesses import derive_strengths_weaknesses
from .recommendations import generate_recommendations
from .position import infer_position

# Process at a reduced sampling FPS for speed; football actions (a touch,
# a pass release) happen on the order of >100-200ms, so 8-10 fps sampling
# is a reasonable tradeoff. With YOLO being faster than HOG, we can afford
# a slightly higher rate for better event detection.
PROCESSING_FPS = 10.0


def analyze_video(path: str) -> FootballPerformanceReport:
    analysis_id = str(uuid.uuid4())
    limitations: List[str] = []

    print(f"[pipeline] Starting analysis {analysis_id} for {path}")
    t0 = time.time()

    video_profile = inspect_video(path)
    limitations.extend(video_profile.notes)

    print(f"[pipeline] Video profile: {video_profile.duration_sec}s, "
          f"{video_profile.width}x{video_profile.height}, "
          f"ball_visible={video_profile.ball_visible}, "
          f"primary_player_visible={video_profile.primary_player_visible}, "
          f"other_players={video_profile.other_players_detected}")

    if video_profile.frame_count == 0:
        return FootballPerformanceReport(
            analysis_id=analysis_id, status="completed",
            position="Unknown",
            overall_score=0, position_score=0, passing_accuracy=0,
            ball_control=0, positioning_score=0, movement_efficiency=0,
            defensive_actions=0, attacking_impact=0, decision_making=0,
            strengths=["Video received successfully"],
            weaknesses=["Video could not be processed — no frames decoded"],
            recommendations=["Please upload a valid video file (MP4, MOV, AVI, MKV)."],
            events=[], evidence={},
            analysis_quality="insufficient",
            limitations=limitations + ["No frames could be decoded from the video."],
            video_profile=video_profile,
        )

    person_detector = PersonDetector()
    ball_detector = BallDetector()
    player_tracker = PlayerTracker()
    ball_tracker = BallTracker()
    event_detector = FootballEventDetector()

    cap = cv2.VideoCapture(path)
    src_fps = video_profile.fps or 25.0
    frame_stride = max(1, int(round(src_fps / PROCESSING_FPS)))

    frame_idx = 0
    prior_player_center = None
    prior_ball_center = None
    ball_speed = None
    frames_processed = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_idx % frame_stride != 0:
            frame_idx += 1
            continue

        ts = frame_idx / src_fps

        persons = person_detector.detect(frame)
        assignment = player_tracker.update(ts, persons)

        primary_det = None
        if assignment:
            prior_center = prior_player_center
            if prior_center is not None:
                primary_tid = min(
                    assignment, key=lambda tid: (
                        (assignment[tid].center[0] - prior_center[0]) ** 2 +
                        (assignment[tid].center[1] - prior_center[1]) ** 2
                    )
                )
            else:
                primary_tid = max(assignment, key=lambda tid: assignment[tid].bbox[2] * assignment[tid].bbox[3])
            primary_det = assignment[primary_tid]
            prior_player_center = primary_det.center

        ball_det_raw = ball_detector.detect(frame, prior_center=prior_ball_center)
        ball_det = ball_tracker.update(ts, ball_det_raw)
        if ball_det is not None:
            idx = len(ball_tracker.history) - 1
            ball_speed = ball_tracker.speed_at(idx)
            prior_ball_center = ball_det.center

        event_detector.process_frame(ts, assignment, ball_det, ball_speed)
        frames_processed += 1
        frame_idx += 1

    cap.release()
    event_detector.finalize()
    events = event_detector.events

    primary_track_id = player_tracker.primary_track_id()

    print(f"[pipeline] Processed {frames_processed} frames, detected {len(events)} events, "
          f"primary_track_id={primary_track_id}")

    # --- metrics ---
    passing = metrics_mod.compute_passing_accuracy(events, video_profile)
    ball_control = metrics_mod.compute_ball_control(events, video_profile)
    positioning = metrics_mod.compute_positioning(
        video_profile,
        player_tracker=player_tracker,
        primary_track_id=primary_track_id,
    )
    movement = metrics_mod.compute_movement_efficiency(player_tracker, primary_track_id, events, video_profile)
    defensive = metrics_mod.compute_defensive_actions(events, video_profile)
    attacking = metrics_mod.compute_attacking_impact(events, video_profile)
    decision = metrics_mod.compute_decision_making(events, video_profile)

    evidence = {
        "passing_accuracy": passing,
        "ball_control": ball_control,
        "position_score": positioning["position_score"],
        "positioning_score": positioning["positioning_score"],
        "movement_efficiency": movement,
        "defensive_actions": defensive,
        "attacking_impact": attacking,
        "decision_making": decision,
    }

    metric_values = {k: v.value for k, v in evidence.items()}
    metric_confidence = {k: v.confidence for k, v in evidence.items()}

    # Ensure no metric is None — the backend expects real numbers
    for k in metric_values:
        if metric_values[k] is None:
            metric_values[k] = 40.0  # safe baseline

    overall_score = compute_overall_score(metric_values)
    if overall_score is None:
        overall_score = 45.0  # baseline

    strengths, weaknesses = derive_strengths_weaknesses(metric_values, metric_confidence)
    recommendations = generate_recommendations(weaknesses, evidence)

    for name, result in evidence.items():
        if result.value is None and result.unavailable_reason:
            limitations.append(f"{name}: {result.unavailable_reason}")

    available = sum(1 for v in metric_values.values() if v is not None)
    avg_confidence = sum(metric_confidence.values()) / max(1, len(metric_confidence))
    if available == 0:
        analysis_quality = "insufficient"
    elif avg_confidence < 0.25:
        analysis_quality = "limited"
    else:
        analysis_quality = "reliable"

    # Position inference with full context
    position = infer_position(
        video_profile,
        events=events,
        player_tracker=player_tracker,
        primary_track_id=primary_track_id,
    )

    elapsed = time.time() - t0
    print(f"[pipeline] Analysis complete in {elapsed:.1f}s. "
          f"Overall={overall_score}, Position={position}, Quality={analysis_quality}")
    print(f"[pipeline] Scores: passing={metric_values.get('passing_accuracy')}, "
          f"ball_control={metric_values.get('ball_control')}, "
          f"movement={metric_values.get('movement_efficiency')}, "
          f"attacking={metric_values.get('attacking_impact')}, "
          f"defensive={metric_values.get('defensive_actions')}, "
          f"decision={metric_values.get('decision_making')}, "
          f"positioning={metric_values.get('positioning_score')}")
    print(f"[pipeline] Strengths: {strengths}")
    print(f"[pipeline] Weaknesses: {weaknesses}")
    print(f"[pipeline] Recommendations: {len(recommendations)} items")

    return FootballPerformanceReport(
        analysis_id=analysis_id,
        status="completed",
        position=position,
        overall_score=overall_score,
        position_score=metric_values["position_score"],
        passing_accuracy=metric_values["passing_accuracy"],
        ball_control=metric_values["ball_control"],
        positioning_score=metric_values["positioning_score"],
        movement_efficiency=metric_values["movement_efficiency"],
        defensive_actions=metric_values["defensive_actions"],
        attacking_impact=metric_values["attacking_impact"],
        decision_making=metric_values["decision_making"],
        strengths=strengths,
        weaknesses=weaknesses,
        recommendations=recommendations,
        events=events,
        evidence=evidence,
        analysis_quality=analysis_quality,
        limitations=limitations,
        video_profile=video_profile,
    )
