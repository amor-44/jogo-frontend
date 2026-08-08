import sys
sys.path.insert(0, "/home/claude/football_performance")

from core.detection import Detection
from core.tracking import PlayerTracker, BallTracker
from core.events import FootballEventDetector
from core import metrics as metrics_mod
from core.models import VideoProfile
from core.scoring import compute_overall_score
from core.strengths_weaknesses import derive_strengths_weaknesses
from core.recommendations import generate_recommendations
import json


def player_det(x, y):
    return Detection(bbox=(x - 15, y - 55, 30, 110), confidence=0.9)


def ball_det(x, y):
    return Detection(bbox=(x - 6, y - 6, 12, 12), confidence=0.5)


def run_scenario():
    fps = 10.0
    player_tracker = PlayerTracker()
    ball_tracker = BallTracker()
    event_detector = FootballEventDetector()

    P1 = (150, 300)
    P2 = (450, 300)
    frame_i = 0

    def step(p1_pos, p2_pos, ball_pos, n=1):
        nonlocal frame_i
        for _ in range(n):
            ts = frame_i / fps
            p1 = player_det(*p1_pos)
            p2 = player_det(*p2_pos)
            assignment = player_tracker.update(ts, [p1, p2])
            # map back to consistent ids by nearest center
            ids = sorted(assignment, key=lambda tid: assignment[tid].center[0])
            id1, id2 = ids[0], ids[-1]

            bd = ball_det(*ball_pos) if ball_pos else None
            ball = ball_tracker.update(ts, bd)
            speed = ball_tracker.speed_at(len(ball_tracker.history) - 1) if ball else None
            event_detector.process_frame(ts, assignment, ball, speed)
            frame_i += 1
        return id1, id2

    # Rally of 5 pass attempts, 4 completed successfully, 1 goes out of play (lost)
    for rally in range(5):
        # ball with P1, held for a few frames (possession)
        for _ in range(4):
            step(P1, P2, (P1[0], P1[1] + 55))
        # release: ball flies fast toward P2 (pass)
        for k in range(1, 6):
            bx = P1[0] + (P2[0] - P1[0]) * k / 5
            step(P1, P2, (bx, P1[1] + 55))
        if rally < 4:
            # completed: ball settles at P2's feet, held briefly
            for _ in range(4):
                step(P1, P2, (P2[0], P2[1] + 55))
            # then P2 returns it to P1 to keep the rally going for the next loop
            for k in range(1, 6):
                bx = P2[0] + (P1[0] - P2[0]) * k / 5
                step(P1, P2, (bx, P2[1] + 55))
        else:
            # last one: pass is overhit and sails past P2 entirely (never
            # enters P2's possession radius) before going out of view, so
            # neither player ever gains possession of it again within the
            # pass_window -> pass_attempt should resolve to ball_loss, not completed.
            for k in range(1, 6):
                bx = P1[0] + (P2[0] + 120 - P1[0]) * k / 5  # overshoot past P2
                step(P1, P2, (bx, P1[1] + 55))
            for _ in range(30):
                step(P1, P2, None)

    event_detector.finalize()
    return event_detector.events, player_tracker


def main():
    events, player_tracker = run_scenario()
    print(f"Total events detected: {len(events)}")
    by_type = {}
    for e in events:
        by_type[e.type] = by_type.get(e.type, 0) + 1
    print("Event counts by type:", json.dumps(by_type, indent=2))

    video = VideoProfile(
        path="synthetic-scenario", duration_sec=20.0, width=960, height=540,
        fps=10.0, frame_count=200, camera_movement="static", camera_movement_score=0.1,
        ball_visible=True, ball_visibility_ratio=1.0, primary_player_visible=True,
        other_players_detected=2, pitch_context_available=True, notes=[],
    )

    passing = metrics_mod.compute_passing_accuracy(events, video)
    ball_control = metrics_mod.compute_ball_control(events, video)
    positioning = metrics_mod.compute_positioning(video)
    primary_tid = player_tracker.primary_track_id()
    movement = metrics_mod.compute_movement_efficiency(player_tracker, primary_tid, events, video)
    defensive = metrics_mod.compute_defensive_actions(events, video)
    attacking = metrics_mod.compute_attacking_impact(events, video)
    decision = metrics_mod.compute_decision_making(events, video)

    evidence = {
        "passing_accuracy": passing, "ball_control": ball_control,
        "position_score": positioning["position_score"],
        "positioning_score": positioning["positioning_score"],
        "movement_efficiency": movement, "defensive_actions": defensive,
        "attacking_impact": attacking, "decision_making": decision,
    }
    metric_values = {k: v.value for k, v in evidence.items()}
    metric_conf = {k: v.confidence for k, v in evidence.items()}

    print("\nMetric results:")
    for k, v in evidence.items():
        print(f"  {k}: value={v.value} confidence={v.confidence} evidence={v.evidence} "
              f"unavailable_reason={v.unavailable_reason}")

    overall = compute_overall_score(metric_values)
    strengths, weaknesses = derive_strengths_weaknesses(metric_values, metric_conf)
    recs = generate_recommendations(weaknesses, evidence)

    print(f"\noverall_score = {overall}")
    print(f"strengths = {strengths}")
    print(f"weaknesses = {weaknesses}")
    print("recommendations:")
    for r in recs:
        print(f"  - {r}")

    # --- sanity assertions ---
    assert passing.value is not None, "expected passing_accuracy to be computed given 2 players + multiple pass attempts"
    assert 60 <= passing.value <= 90, f"expected ~80% (4/5) pass accuracy, got {passing.value}"
    print("\nAll sanity assertions passed.")


if __name__ == "__main__":
    main()
