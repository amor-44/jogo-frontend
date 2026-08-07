from app.analysis.movement_analyzer import MovementAnalyzer
from app.tracking.tracker import TrackObservation


def make_obs(frame_index, timestamp, x, y):
    return TrackObservation(
        frame_index=frame_index,
        timestamp=timestamp,
        track_id=1,
        bbox=(x - 5, y - 5, x + 5, y + 5),
        confidence=0.9,
    )


def test_analyze_empty_observations_returns_no_detection():
    analyzer = MovementAnalyzer()
    metrics = analyzer.analyze([], total_frames=30)

    assert metrics.player_detected is False
    assert metrics.frames_processed == 30
    assert metrics.estimated_distance_pixels == 0.0


def test_analyze_computes_distance_and_speed_for_straight_line_motion():
    analyzer = MovementAnalyzer()
    observations = [
        make_obs(0, 0.0, 0, 0),
        make_obs(1, 1.0, 0, 100),
        make_obs(2, 2.0, 0, 200),
    ]
    metrics = analyzer.analyze(observations, total_frames=3)

    assert metrics.player_detected is True
    assert metrics.estimated_distance_pixels == 200.0
    assert metrics.average_speed_pixels_per_second == 100.0
    assert metrics.detection_rate == 1.0


def test_analyze_detects_direction_change():
    analyzer = MovementAnalyzer()
    observations = [
        make_obs(0, 0.0, 0, 0),
        make_obs(1, 1.0, 100, 0),
        make_obs(2, 2.0, 100, 100),
    ]
    metrics = analyzer.analyze(observations, total_frames=3)

    assert metrics.direction_changes == 1


def test_analyze_detection_rate_reflects_missed_frames():
    analyzer = MovementAnalyzer()
    observations = [
        make_obs(0, 0.0, 0, 0),
        make_obs(5, 1.0, 50, 0),
    ]
    metrics = analyzer.analyze(observations, total_frames=10)

    assert metrics.detection_rate == 0.2


def test_movement_consistency_is_high_for_constant_speed():
    analyzer = MovementAnalyzer()
    observations = [make_obs(i, float(i), i * 50, 0) for i in range(5)]
    metrics = analyzer.analyze(observations, total_frames=5)

    assert metrics.movement_consistency > 0.9
