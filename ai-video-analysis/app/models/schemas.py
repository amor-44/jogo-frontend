from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class KeyFrame(BaseModel):
    label: str
    frame_index: int
    timestamp_seconds: float
    image_path: str


class VisualizationPaths(BaseModel):
    trajectory_image: Optional[str] = None
    annotated_video: Optional[str] = None
    heatmap_image: Optional[str] = None


class MetricsModel(BaseModel):
    # Video-level facts
    video_duration_seconds: float
    frames_processed: int
    fps: float
    resolution: str

    # Detection / tracking quality
    player_detected: bool
    detection_rate: float
    average_detection_confidence: float
    tracking_duration_seconds: float

    # Movement (pixel-space approximations - see Report.limitations)
    estimated_distance_pixels: float
    average_speed_pixels_per_second: float
    movement_consistency: float
    direction_changes: int
    activity_time_seconds: float

    confidence_level: str


class Report(BaseModel):
    analysis_id: str
    video_filename: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    metrics: MetricsModel
    key_frames: List[KeyFrame] = Field(default_factory=list)
    visualizations: VisualizationPaths = Field(default_factory=VisualizationPaths)

    observations: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


class AnalysisJob(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    video_filename: str
    player_id: Optional[str] = None
    report: Optional[Report] = None
    error: Optional[str] = None
