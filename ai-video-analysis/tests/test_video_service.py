import io

import pytest
from fastapi import UploadFile
from starlette.datastructures import Headers

from app.services.video_service import VideoService, VideoValidationError


@pytest.fixture
def video_service(tmp_path, monkeypatch):
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path / "uploads"))
    monkeypatch.setenv("OUTPUT_DIR", str(tmp_path / "outputs"))
    from app.config import get_settings

    get_settings.cache_clear()
    yield VideoService()
    get_settings.cache_clear()


def _make_upload_file(filename: str) -> UploadFile:
    return UploadFile(filename=filename, file=io.BytesIO(b"data"), headers=Headers({"content-type": "video/mp4"}))


def test_validate_upload_rejects_unsupported_extension(video_service):
    file = _make_upload_file("clip.txt")
    with pytest.raises(VideoValidationError):
        video_service.validate_upload(file, size_bytes=10)


def test_validate_upload_rejects_empty_file(video_service):
    file = _make_upload_file("clip.mp4")
    with pytest.raises(VideoValidationError):
        video_service.validate_upload(file, size_bytes=0)


def test_validate_upload_rejects_oversized_file(video_service):
    file = _make_upload_file("clip.mp4")
    too_big = int(video_service.settings.max_video_size_mb * 1024 * 1024) + 1
    with pytest.raises(VideoValidationError):
        video_service.validate_upload(file, size_bytes=too_big)


def test_validate_upload_accepts_valid_video(video_service):
    file = _make_upload_file("clip.mp4")
    # Should not raise
    video_service.validate_upload(file, size_bytes=1024)


def test_read_metadata_rejects_unreadable_file(video_service, tmp_path):
    bad_file = tmp_path / "not_a_video.mp4"
    bad_file.write_bytes(b"this is not a real video")
    with pytest.raises(VideoValidationError):
        video_service.read_metadata(bad_file)
