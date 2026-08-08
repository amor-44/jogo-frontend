from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any



@dataclass
class VideoProfile:
    """Result of inspecting the raw video before any football-specific analysis."""
    path: str
    duration_sec: float
    width: int
    height: int
    fps: float
    frame_count: int
    camera_movement: str          # "static" | "moderate" | "high" | "unknown"
    camera_movement_score: Optional[float]   # mean optical-flow magnitude (px/frame)
    ball_visible: bool
    ball_visibility_ratio: float  # fraction of sampled frames where a ball candidate was found
    primary_player_visible: bool
    other_players_detected: int   # max simultaneous distinct persons seen across sampled frames
    pitch_context_available: bool  # heuristic: enough green/field area + multiple players visible
    notes: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class FootballEvent:
    timestamp: float
    type: str
    confidence: float
    details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class MetricResult:
    """A single scored metric, carrying its own confidence + supporting evidence."""
    value: Optional[float]        # 0-100, or None if not calculable
    confidence: float             # 0-1, how much evidence backs this value
    evidence: Dict[str, Any] = field(default_factory=dict)
    unavailable_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class FootballPerformanceReport:
    analysis_id: str
    status: str  # "completed" | "failed"

    position: str  # one of the allowed position codes, or "Unknown"

    overall_score: Optional[float]
    position_score: Optional[float]
    passing_accuracy: Optional[float]
    ball_control: Optional[float]
    positioning_score: Optional[float]
    movement_efficiency: Optional[float]
    defensive_actions: Optional[float]
    attacking_impact: Optional[float]
    decision_making: Optional[float]

    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]

    events: List[FootballEvent]
    evidence: Dict[str, MetricResult]  # metric_name -> MetricResult (full detail)

    analysis_quality: str  # "reliable" | "limited" | "insufficient"
    limitations: List[str]

    video_profile: Optional[VideoProfile] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "analysis_id": self.analysis_id,
            "status": self.status,
            "football_performance": {
                "player": {"position": self.position},
                "scores": {
                    "overall_score": self.overall_score,
                    "position_score": self.position_score,
                    "passing_accuracy": self.passing_accuracy,
                    "ball_control": self.ball_control,
                    "positioning_score": self.positioning_score,
                    "movement_efficiency": self.movement_efficiency,
                    "defensive_actions": self.defensive_actions,
                    "attacking_impact": self.attacking_impact,
                    "decision_making": self.decision_making,
                },
                "strengths": self.strengths,
                "weaknesses": self.weaknesses,
                "recommendations": self.recommendations,
                "events": [e.to_dict() for e in self.events],
                "evidence": {k: v.to_dict() for k, v in self.evidence.items()},
                "analysis_quality": self.analysis_quality,
                "limitations": self.limitations,
                "video_profile": self.video_profile.to_dict() if self.video_profile else None,
            },
        }
