"""API routes for the AI Video Analysis MVP.

Deliberately thin: request handling and orchestration hand-off only.
All real work happens in app.services.
"""
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, Request, UploadFile, status

from app.api.schemas import AnalysisAcceptedResponse, AnalysisResultResponse, HealthResponse
from app.models.schemas import AnalysisStatus
from app.services.video_service import VideoService, VideoValidationError
from app.storage.job_store import job_store
from app.utils.file_utils import new_analysis_id

router = APIRouter()
video_service = VideoService()


@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health(request: Request) -> HealthResponse:
    model_loaded = getattr(request.app.state, "model", None) is not None
    return HealthResponse(status="ok", model_loaded=model_loaded)


@router.post(
    "/analyze",
    response_model=AnalysisAcceptedResponse,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["Analysis"],
)
async def analyze_video(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Football video file (MVP: 20-60s, single main player)."),
    player_id: Optional[str] = Form(default=None, description="Optional client-side player identifier."),
) -> AnalysisAcceptedResponse:
    file_bytes = await file.read()

    try:
        video_service.validate_upload(file, size_bytes=len(file_bytes))
    except VideoValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    analysis_id = new_analysis_id()
    video_path = video_service.save_upload(file_bytes, analysis_id, file.filename or "video.mp4")
    job_store.create(analysis_id, video_filename=Path(video_path).name, player_id=player_id)

    analysis_service = request.app.state.analysis_service
    background_tasks.add_task(analysis_service.run, analysis_id, video_path)

    return AnalysisAcceptedResponse(analysis_id=analysis_id, status=AnalysisStatus.PENDING)


@router.get("/analysis/{analysis_id}", response_model=AnalysisResultResponse, tags=["Analysis"])
async def get_analysis(analysis_id: str) -> AnalysisResultResponse:
    job = job_store.get(analysis_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")
    return AnalysisResultResponse(
        analysis_id=job.analysis_id,
        status=job.status,
        report=job.report,
        error=job.error,
    )
