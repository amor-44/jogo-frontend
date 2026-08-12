from __future__ import annotations
import os
import shutil
import tempfile
import uuid
import threading
from typing import Dict, Any

try:
    from fastapi import FastAPI, UploadFile, File, HTTPException
    from fastapi.responses import JSONResponse
    from fastapi.concurrency import run_in_threadpool
    from pydantic import BaseModel
except ImportError as e:  # pragma: no cover
    raise ImportError(
        "fastapi is not installed. Run: pip install fastapi uvicorn python-multipart"
    ) from e

try:
    import httpx
except ImportError as e:  # pragma: no cover
    raise ImportError("httpx is not installed. Run: pip install httpx") from e

try:
    from core.pipeline import analyze_video
except ImportError:
    def analyze_video(*args, **kwargs):
        raise RuntimeError("Computer vision dependencies (opencv/numpy/scipy) are not fully installed yet!")

app = FastAPI(title="Football Performance Analysis API")

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv"}

# ---------------------------------------------------------------------------
# In-memory result store — holds completed reports keyed by analysis_id.
# Good enough for single-process MVP; replace with Redis/DB for production.
# ---------------------------------------------------------------------------
_result_store: Dict[str, Dict[str, Any]] = {}
_store_lock = threading.Lock()


# ---------------------------------------------------------------------------
# Schema for /analyze-by-url (matches backend AiAnalysisService contract)
# ---------------------------------------------------------------------------
class AnalyzeByUrlRequest(BaseModel):
    video_url: str


# ---------------------------------------------------------------------------
# Existing file-upload endpoint (unchanged)
# ---------------------------------------------------------------------------
@app.post("/analyze/football-performance")
async def analyze_football_performance(video: UploadFile = File(...)):
    ext = os.path.splitext(video.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    tmp_dir = tempfile.mkdtemp(prefix="football_upload_")
    tmp_path = os.path.join(tmp_dir, f"{uuid.uuid4()}{ext}")
    try:
        with open(tmp_path, "wb") as f:
            shutil.copyfileobj(video.file, f)

        # analyze_video() is CPU-bound and can run for minutes on a real match
        # clip. Running it inline would block this single-worker event loop —
        # including /health — for the whole duration. Push it to a worker thread
        # so the loop stays responsive while analysis runs.
        report = await run_in_threadpool(analyze_video, tmp_path)
        return JSONResponse(content=report.to_dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


# ---------------------------------------------------------------------------
# NEW: POST /analyze-by-url
# Called by C# AiAnalysisService.TriggerAnalysisAsync().
# Accepts { "video_url": "http://..." }, downloads the video from the backend
# static file server, runs the pipeline, stores the result, returns analysis_id.
# ---------------------------------------------------------------------------
@app.post("/analyze-by-url")
async def analyze_by_url(request: AnalyzeByUrlRequest):
    url = request.video_url
    ext = os.path.splitext(url.split("?")[0])[1].lower() or ".mp4"
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported video extension in URL: {ext}")

    analysis_id = str(uuid.uuid4())
    tmp_dir = tempfile.mkdtemp(prefix="football_url_")
    tmp_path = os.path.join(tmp_dir, f"{analysis_id}{ext}")

    try:
        # Download video from the backend's static file server
        async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not download video (HTTP {response.status_code}): {url}",
                )
            with open(tmp_path, "wb") as f:
                f.write(response.content)

        # Same reasoning as /analyze/football-performance: keep the event loop
        # free (health checks, other requests) while the pipeline runs.
        report = await run_in_threadpool(analyze_video, tmp_path)
        result = report.to_dict()

        with _store_lock:
            _result_store[analysis_id] = result

        return JSONResponse(
            content={"analysis_id": analysis_id, "status": "completed"},
            status_code=200,
        )

    except HTTPException:
        raise
    except Exception as exc:
        import traceback
        traceback.print_exc()
        with _store_lock:
            _result_store[analysis_id] = {
                "analysis_id": analysis_id,
                "status": "failed",
                "error": str(exc),
            }
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


# ---------------------------------------------------------------------------
# NEW: GET /analysis/{analysis_id}
# Called by C# AiAnalysisService.GetAnalysisStatusAsync().
# ---------------------------------------------------------------------------
@app.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    with _store_lock:
        result = _result_store.get(analysis_id)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found.")
    return JSONResponse(content=result)


@app.get("/health")
async def health():
    return {"status": "ok"}
