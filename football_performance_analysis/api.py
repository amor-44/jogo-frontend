
from __future__ import annotations
import os
import shutil
import tempfile
import uuid

try:
    from fastapi import FastAPI, UploadFile, File, HTTPException
    from fastapi.responses import JSONResponse
except ImportError as e:  # pragma: no cover
    raise ImportError(
        "fastapi is not installed in this environment. "
        "Run: pip install fastapi uvicorn python-multipart"
    ) from e

from core.pipeline import analyze_video

app = FastAPI(title="Football Performance Analysis API")

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv"}


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

        report = analyze_video(tmp_path)
        return JSONResponse(content=report.to_dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


@app.get("/health")
async def health():
    return {"status": "ok"}
