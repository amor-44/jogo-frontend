"""Small filesystem helpers shared across services."""
import uuid
from pathlib import Path


def new_analysis_id() -> str:
    """Generate a short, URL-safe unique id for an analysis job."""
    return uuid.uuid4().hex[:12]


def get_extension(filename: str) -> str:
    return Path(filename).suffix.lower()


def build_upload_path(upload_dir: str, analysis_id: str, original_filename: str) -> Path:
    ext = get_extension(original_filename)
    return Path(upload_dir) / f"{analysis_id}{ext}"


def build_output_dir(output_dir: str, analysis_id: str) -> Path:
    path = Path(output_dir) / analysis_id
    path.mkdir(parents=True, exist_ok=True)
    return path
