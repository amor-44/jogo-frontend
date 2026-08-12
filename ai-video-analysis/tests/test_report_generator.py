from app.analysis.movement_analyzer import MovementMetrics
from app.models.schemas import VisualizationPaths
from app.reports.report_generator import ReportGenerator
from app.services.video_service import VideoMetadata


def test_report_generator_builds_complete_report_for_detected_player():
    generator = ReportGenerator()
    video_metadata = VideoMetadata(fps=30.0, frame_count=900, width=1280, height=720)
    movement_metrics = MovementMetrics(
        frames_processed=900,
        player_detected=True,
        detection_rate=0.95,
        average_detection_confidence=0.87,
        tracking_duration_seconds=28.0,
        estimated_distance_pixels=5400.0,
        average_speed_pixels_per_second=192.8,
        movement_consistency=0.7,
        direction_changes=4,
        activity_time_seconds=15.0,
        path=[(0, 0), (10, 10)],
    )

    report = generator.build(
        analysis_id="abc123",
        video_filename="clip.mp4",
        video_metadata=video_metadata,
        movement_metrics=movement_metrics,
        key_frames=[],
        visualizations=VisualizationPaths(),
    )

    assert report.metrics.confidence_level == "High"
    assert report.metrics.resolution == "1280x720"
    assert report.observations
    assert report.recommendations
    assert len(report.limitations) == 3


def test_report_generator_handles_no_player_detected():
    generator = ReportGenerator()
    video_metadata = VideoMetadata(fps=30.0, frame_count=300, width=640, height=480)
    movement_metrics = MovementMetrics(
        frames_processed=300,
        player_detected=False,
        detection_rate=0.0,
        average_detection_confidence=0.0,
        tracking_duration_seconds=0.0,
        estimated_distance_pixels=0.0,
        average_speed_pixels_per_second=0.0,
        movement_consistency=0.0,
        direction_changes=0,
        activity_time_seconds=0.0,
        path=[],
    )

    report = generator.build(
        analysis_id="xyz789",
        video_filename="clip2.mp4",
        video_metadata=video_metadata,
        movement_metrics=movement_metrics,
        key_frames=[],
        visualizations=VisualizationPaths(),
    )

    assert report.metrics.confidence_level == "Low"
    assert "No player" in report.observations[0]
