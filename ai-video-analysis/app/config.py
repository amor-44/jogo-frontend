from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Detection / tracking
    yolo_model_path: str = "yolov8n.pt"
    detection_confidence_threshold: float = 0.4
    tracker_config: str = "bytetrack.yaml"

    # Storage
    upload_dir: str = "data/uploads"
    output_dir: str = "data/outputs"

    # Video constraints (MVP scope: short, single-subject clips)
    max_video_duration_seconds: float = 60.0
    max_video_size_mb: float = 200.0
    supported_video_formats: str = ".mp4,.mov,.avi,.mkv"

    log_level: str = "INFO"

    @property
    def supported_video_formats_list(self) -> list[str]:
        return [ext.strip().lower() for ext in self.supported_video_formats.split(",") if ext.strip()]

    def ensure_directories(self) -> None:
        Path(self.upload_dir).mkdir(parents=True, exist_ok=True)
        Path(self.output_dir).mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
