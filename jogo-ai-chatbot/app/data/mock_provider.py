from datetime import date

from app.data.provider import PlayerDataProvider
from app.models.player import PerformanceMetrics, PerformanceReport, PlayerData, PlayerProfile

_PLAYERS: dict[str, PlayerData] = {
    "player_001": PlayerData(
        profile=PlayerProfile(
            player_id="player_001",
            name="Karim Youssef",
            age=19,
            position="Central Midfielder",
            location="Mansoura, Egypt",
            current_team="Delta FC U21",
            football_experience="8 years, semi-professional",
        ),
        current_report=PerformanceReport(
            report_date=date(2026, 7, 20),
            metrics=PerformanceMetrics(
                overall_score=82,
                position_score=84,
                passing_accuracy=87,
                ball_control=79,
                positioning_score=84,
                movement_efficiency=76,
                defensive_actions=78,
                attacking_impact=73,
                decision_making=71,
            ),
            strengths=["Passing", "Positioning"],
            weaknesses=["Decision Making", "Movement Efficiency"],
            recommendations=[
                "Work on scanning the field before receiving the ball to speed up decisions.",
                "Add short interval sprints to training to build repeated movement efficiency.",
            ],
        ),
        historical_reports=[
            PerformanceReport(
                report_date=date(2026, 4, 10),
                metrics=PerformanceMetrics(
                    overall_score=76,
                    position_score=80,
                    passing_accuracy=83,
                    ball_control=75,
                    positioning_score=79,
                    movement_efficiency=74,
                    defensive_actions=76,
                    attacking_impact=70,
                    decision_making=65,
                ),
                strengths=["Passing"],
                weaknesses=["Decision Making", "Attacking Impact"],
                recommendations=[
                    "Focus on first-touch control under pressure.",
                ],
            ),
            PerformanceReport(
                report_date=date(2026, 1, 15),
                metrics=PerformanceMetrics(
                    overall_score=71,
                    position_score=75,
                    passing_accuracy=80,
                    ball_control=72,
                    positioning_score=74,
                    movement_efficiency=77,
                    defensive_actions=74,
                    attacking_impact=66,
                    decision_making=61,
                ),
                strengths=["Stamina"],
                weaknesses=["Decision Making", "Passing Accuracy"],
                recommendations=[
                    "Build passing accuracy through short possession drills.",
                ],
            ),
        ],
    ),
}


class MockPlayerDataProvider(PlayerDataProvider):
    """In-memory mock data provider for MVP development and testing."""

    def get_player_data(self, player_id: str) -> PlayerData | None:
        return _PLAYERS.get(player_id)
