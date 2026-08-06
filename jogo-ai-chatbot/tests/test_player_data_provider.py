def test_get_existing_player_returns_data(player_provider):
    data = player_provider.get_player_data("player_001")
    assert data is not None
    assert data.profile.name == "Karim Youssef"
    assert data.current_report.metrics.overall_score == 82


def test_get_missing_player_returns_none(player_provider):
    data = player_provider.get_player_data("does_not_exist")
    assert data is None


def test_player_has_historical_reports(player_provider):
    data = player_provider.get_player_data("player_001")
    assert len(data.historical_reports) == 2
    # Most recent historical report should differ from current, demonstrating progression.
    assert data.historical_reports[0].metrics.overall_score != data.current_report.metrics.overall_score
