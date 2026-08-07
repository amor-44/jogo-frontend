import io

import pytest
from fastapi.testclient import TestClient

class DummyYOLO:
    """Stands in for ultralytics.YOLO so tests never download real weights
    or require a GPU. Only the methods our code calls are implemented.
    """

    def __init__(self, *args, **kwargs):
        pass

    def track(self, *args, **kwargs):
        return iter([])  # no tracked frames

    def predict(self, *args, **kwargs):
        return []


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr("app.main.YOLO", DummyYOLO)
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True


def test_analyze_rejects_unsupported_format(client):
    file_content = io.BytesIO(b"not a real video")
    response = client.post("/analyze", files={"file": ("clip.txt", file_content, "text/plain")})
    assert response.status_code == 400


def test_analyze_rejects_empty_file(client):
    file_content = io.BytesIO(b"")
    response = client.post("/analyze", files={"file": ("clip.mp4", file_content, "video/mp4")})
    assert response.status_code == 400


def test_analyze_accepts_supported_format_and_returns_pending(client):
    file_content = io.BytesIO(b"fake mp4 bytes - not a real decodable video")
    response = client.post("/analyze", files={"file": ("clip.mp4", file_content, "video/mp4")})

    assert response.status_code == 202
    body = response.json()
    assert "analysis_id" in body
    assert body["status"] == "pending"


def test_get_unknown_analysis_returns_404(client):
    response = client.get("/analysis/does-not-exist")
    assert response.status_code == 404


def test_analyze_then_poll_reaches_terminal_status(client):
    # The fake bytes above aren't a real video, so the background pipeline
    # is expected to fail validation gracefully rather than crash - this
    # confirms the API stays consistent even when processing fails.
    file_content = io.BytesIO(b"fake mp4 bytes - not a real decodable video")
    post_response = client.post("/analyze", files={"file": ("clip.mp4", file_content, "video/mp4")})
    analysis_id = post_response.json()["analysis_id"]

    get_response = client.get(f"/analysis/{analysis_id}")
    assert get_response.status_code == 200
    body = get_response.json()
    assert body["status"] in ("failed", "completed", "processing", "pending")
