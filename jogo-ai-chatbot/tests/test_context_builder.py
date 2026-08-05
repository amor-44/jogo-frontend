from app.chatbot.context_builder import build_player_context


def test_context_includes_profile_and_current_metrics(player_provider):
    data = player_provider.get_player_data("player_001")
    context = build_player_context(data)

    assert "Karim Youssef" in context
    assert "Overall Score: 82" in context
    assert "Decision Making: 71" in context


def test_context_includes_historical_reports_for_comparison(player_provider):
    data = player_provider.get_player_data("player_001")
    context = build_player_context(data)

    assert "Historical Performance Reports" in context
    assert "PREVIOUS #1" in context
    assert "PREVIOUS #2" in context


def test_context_handles_missing_historical_data_gracefully():
    from datetime import date

    from app.models.player import PerformanceMetrics, PerformanceReport, PlayerData, PlayerProfile

    data = PlayerData(
        profile=PlayerProfile(
            player_id="p_new",
            name="New Player",
            age=17,
            position="Winger",
            location="Cairo, Egypt",
            current_team="Unattached",
            football_experience="2 years",
        ),
        current_report=PerformanceReport(
            report_date=date(2026, 1, 1),
            metrics=PerformanceMetrics(
                overall_score=60,
                position_score=60,
                passing_accuracy=60,
                ball_control=60,
                positioning_score=60,
                movement_efficiency=60,
                defensive_actions=60,
                attacking_impact=60,
                decision_making=60,
            ),
        ),
        historical_reports=[],
    )

    context = build_player_context(data)
    assert "No historical reports are available" in context
