"""
Player context builder.

Converts a PlayerData object into a structured, human-readable text block
that is injected into the system prompt. This is the ONLY channel through
which player-specific facts reach the LLM -- Gemini never has direct
database access, per the architecture requirement.
"""
from app.models.player import PerformanceReport, PlayerData


def _format_metrics(metrics) -> str:
    return (
        f"Overall Score: {metrics.overall_score}\n"
        f"Position Score: {metrics.position_score}\n"
        f"Passing Accuracy: {metrics.passing_accuracy}\n"
        f"Ball Control: {metrics.ball_control}\n"
        f"Positioning Score: {metrics.positioning_score}\n"
        f"Movement Efficiency: {metrics.movement_efficiency}\n"
        f"Defensive Actions: {metrics.defensive_actions}\n"
        f"Attacking Impact: {metrics.attacking_impact}\n"
        f"Decision Making: {metrics.decision_making}"
    )


def _format_report(label: str, report: PerformanceReport) -> str:
    lines = [
        f"[{label} - {report.report_date.isoformat()}]",
        _format_metrics(report.metrics),
    ]
    if report.strengths:
        lines.append(f"Strengths: {', '.join(report.strengths)}")
    if report.weaknesses:
        lines.append(f"Weaknesses: {', '.join(report.weaknesses)}")
    if report.recommendations:
        lines.append(f"Existing recommendations: {'; '.join(report.recommendations)}")
    return "\n".join(lines)


def build_player_context(player_data: PlayerData) -> str:
    """Build the full text context block for a player, for injection into the system prompt."""
    profile = player_data.profile
    sections = [
        "## Player Profile",
        f"Name: {profile.name}",
        f"Age: {profile.age}",
        f"Position: {profile.position}",
        f"Location: {profile.location}",
        f"Current Team: {profile.current_team}",
        f"Football Experience: {profile.football_experience}",
        "",
        "## Current Performance Report",
        _format_report("CURRENT", player_data.current_report),
    ]

    if player_data.historical_reports:
        sections.append("")
        sections.append("## Historical Performance Reports (most recent first)")
        for i, report in enumerate(player_data.historical_reports, start=1):
            sections.append(_format_report(f"PREVIOUS #{i}", report))
    else:
        sections.append("")
        sections.append("## Historical Performance Reports")
        sections.append("No historical reports are available for this player yet.")

    return "\n".join(sections)
