"""Video validation, persistence, and frame/metadata extraction.

Kept isolated from detection/tracking so video I/O concerns never leak
into analysis logic.
"""
from pathlib import Path
from typing import Iterator, Tuple

import cv2
import numpy as np
from fastapi import UploadFile

from app.config import get_settings
from app.utils.file_utils import build_upload_path, get_extension
from app.utils.logger import get_logger

logger = get_logger(__name__)


class VideoValidationError(Exception):
    """Raised for any invalid, unsupported, or unreadable video."""


class VideoMetadata:
    def __init__(self, fps: float, frame_count: int, width: int, height: int):
        self.fps = fps
        self.frame_count = frame_count
        self.width = width
        self.height = height

    @property
    def duration_seconds(self) -> float:
        return self.frame_count / self.fps if self.fps else 0.0

    @property
    def resolution(self) -> str:
        return f"{self.width}x{self.height}"


class VideoService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.settings.ensure_directories()

    def validate_upload(self, file: UploadFile, size_bytes: int) -> None:
        """Cheap, pre-decode checks: extension and size only.

        Deeper checks (can it actually be opened, is it too long) happen
        in read_metadata() once the file is on disk, since they require
        decoding.
        """
        ext = get_extension(file.filename or "")
        if ext not in self.settings.supported_video_formats_list:
            raise VideoValidationError(
                f"Unsupported video format '{ext or 'unknown'}'. "
                f"Supported formats: {', '.join(self.settings.supported_video_formats_list)}"
            )
        if size_bytes == 0:
            raise VideoValidationError("Uploaded video file is empty.")
        max_bytes = self.settings.max_video_size_mb * 1024 * 1024
        if size_bytes > max_bytes:
            raise VideoValidationError(f"Video exceeds the maximum size of {self.settings.max_video_size_mb}MB.")

    def save_upload(self, file_bytes: bytes, analysis_id: str, original_filename: str) -> Path:
        path = build_upload_path(self.settings.upload_dir, analysis_id, original_filename)
        with open(path, "wb") as f:
            f.write(file_bytes)
        logger.info("Saved upload for analysis %s to %s", analysis_id, path)
        return path

    def read_metadata(self, video_path: Path) -> VideoMetadata:
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            cap.release()
            raise VideoValidationError("Could not open video file. It may be corrupted or in an unsupported codec.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        cap.release()

        if frame_count <= 0:
            raise VideoValidationError("Video contains no readable frames.")

        metadata = VideoMetadata(fps=fps, frame_count=frame_count, width=width, height=height)
        if metadata.duration_seconds > self.settings.max_video_duration_seconds:
            raise VideoValidationError(
                f"Video duration ({metadata.duration_seconds:.1f}s) exceeds the "
                f"{self.settings.max_video_duration_seconds}s MVP limit. "
                "This service is scoped to short skill/training clips."
            )
        return metadata

    def iter_frames(self, video_path: Path) -> Iterator[Tuple[int, np.ndarray]]:
        """Yield (frame_index, frame) for every frame in the video."""
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise VideoValidationError("Could not open video file for frame extraction.")
        index = 0
        try:
            while True:
                ok, frame = cap.read()
                if not ok:
                    break
                yield index, frame
                index += 1
        finally:
            cap.release()
