"""
Data schemas describing a player's profile and performance.

These mirror the kind of data the real Jogo backend is expected to provide
eventually. Keeping them as Pydantic models gives us validation "for free"
and a single source of truth for the shape of player data.
"""
from datetime import date

from pydantic import BaseModel, Field


class PlayerProfile(BaseModel):
    player_id: str
    name: str
    age: int
    position: str
    location: str
    current_team: str
    football_experience: str  # e.g. "8 years, semi-professional"


class PerformanceMetrics(BaseModel):
    """Raw performance numbers for a single report."""

    overall_score: int = Field(ge=0, le=100)
    position_score: int = Field(ge=0, le=100)
    passing_accuracy: int = Field(ge=0, le=100)
    ball_control: int = Field(ge=0, le=100)
    positioning_score: int = Field(ge=0, le=100)
    movement_efficiency: int = Field(ge=0, le=100)
    defensive_actions: int = Field(ge=0, le=100)
    attacking_impact: int = Field(ge=0, le=100)
    decision_making: int = Field(ge=0, le=100)


class PerformanceReport(BaseModel):
    """A single dated performance report (current or historical)."""

    report_date: date
    metrics: PerformanceMetrics
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


class PlayerData(BaseModel):
    """Full aggregate of everything the chatbot may need about a player."""

    profile: PlayerProfile
    current_report: PerformanceReport
    historical_reports: list[PerformanceReport] = Field(default_factory=list)
