from __future__ import annotations
import os
import shutil
import tempfile
import uuid
import threading
from typing import Dict, Any

try:
    from fastapi import BackgroundTasks, FastAPI, UploadFile, File, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv"}

# ---------------------------------------------------------------------------
# In-memory result store — holds completed reports keyed by analysis_id.
# Good enough for single-process MVP; replace with Redis/DB for production.
# ---------------------------------------------------------------------------
_result_store: Dict[str, Dict[str, Any]] = {}
_store_lock = threading.Lock()

# Hard timeout (seconds) for the CV pipeline per video.
# Prevents a job from staying "processing" forever if the worker hangs.
_ANALYSIS_TIMEOUT_SECONDS = 600  # 10 minutes


# ---------------------------------------------------------------------------
# Schema for /analyze-by-url (matches backend AiAnalysisService contract)
# ---------------------------------------------------------------------------
class AnalyzeByUrlRequest(BaseModel):
    video_url: str


# ---------------------------------------------------------------------------
# Existing file-upload endpoint
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

        report = await run_in_threadpool(analyze_video, tmp_path)
        return JSONResponse(content=report.to_dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def _run_analysis_in_background(analysis_id: str, tmp_path: str, tmp_dir: str) -> None:
    """Runs the actual CV pipeline in a daemon thread with a hard timeout.

    Uses a nested thread + join(timeout) so that even if the CV pipeline
    hangs or the process is about to be killed, the outer thread can mark
    the job as failed after _ANALYSIS_TIMEOUT_SECONDS.
    """

    result_holder: Dict[str, Any] = {}

    def _worker():
        try:
            report = analyze_video(tmp_path)
            result_holder["result"] = report.to_dict()
        except Exception as exc:
            import traceback
            traceback.print_exc()
            result_holder["result"] = {
                "analysis_id": analysis_id,
                "status": "failed",
                "error": str(exc),
            }

    worker = threading.Thread(target=_worker, daemon=True)
    worker.start()
    worker.join(timeout=_ANALYSIS_TIMEOUT_SECONDS)

    if worker.is_alive():
        # Timed out — mark as failed so the backend stops polling.
        final = {
            "analysis_id": analysis_id,
            "status": "failed",
            "error": f"Analysis timed out after {_ANALYSIS_TIMEOUT_SECONDS}s",
        }
    else:
        final = result_holder.get("result", {
            "analysis_id": analysis_id,
            "status": "failed",
            "error": "Worker exited without producing a result",
        })

    with _store_lock:
        _result_store[analysis_id] = final

    shutil.rmtree(tmp_dir, ignore_errors=True)


# ---------------------------------------------------------------------------
# POST /analyze-by-url
# ---------------------------------------------------------------------------
@app.post("/analyze-by-url")
async def analyze_by_url(request: AnalyzeByUrlRequest, background_tasks: BackgroundTasks):
    url = request.video_url
    ext = os.path.splitext(url.split("?")[0])[1].lower() or ".mp4"
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported video extension in URL: {ext}")

    analysis_id = str(uuid.uuid4())
    tmp_dir = tempfile.mkdtemp(prefix="football_url_")
    tmp_path = os.path.join(tmp_dir, f"{analysis_id}{ext}")

    try:
        async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
            response = await client.get(url)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not download video (HTTP {response.status_code}): {url}",
                )
            with open(tmp_path, "wb") as f:
                f.write(response.content)
    except HTTPException:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise
    except Exception as exc:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise HTTPException(status_code=502, detail=f"Failed to download video: {exc}") from exc

    with _store_lock:
        _result_store[analysis_id] = {"analysis_id": analysis_id, "status": "processing"}

    # Use a real daemon thread instead of FastAPI's background task pool so that
    # the timeout wrapper (_run_analysis_in_background) can join() the inner worker.
    t = threading.Thread(
        target=_run_analysis_in_background,
        args=(analysis_id, tmp_path, tmp_dir),
        daemon=True,
    )
    t.start()

    return JSONResponse(
        content={"analysis_id": analysis_id, "status": "processing"},
        status_code=200,
    )


# ---------------------------------------------------------------------------
# GET /analysis/{analysis_id}
# ---------------------------------------------------------------------------
@app.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    with _store_lock:
        result = _result_store.get(analysis_id)
    if result is None:
        # Return "failed" instead of 404 so the C# backend stops polling and
        # marks the video as failed immediately, rather than retrying forever.
        # (In-memory store is wiped on container restart; 404 would cause
        # infinite retries since the C# side only stops on failed/completed.)
        return JSONResponse(
            content={
                "analysis_id": analysis_id,
                "status": "failed",
                "error": "Analysis not found — the service may have restarted. Please re-submit.",
            },
            status_code=200,
        )
    return JSONResponse(content=result)


@app.get("/health")
async def health():
    return {"status": "ok"}