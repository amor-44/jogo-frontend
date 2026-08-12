from typing import Optional
from pydantic import BaseModel

from app.models.schemas import AnalysisStatus, Report


class AnalysisAcceptedResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    message: str = "Video accepted for processing."


class AnalysisResultResponse(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    report: Optional[Report] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    model_loaded: bool
