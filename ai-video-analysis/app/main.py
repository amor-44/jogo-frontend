"""FastAPI application entrypoint.

Loads the YOLO model once at startup and wires it into the analysis
service via app.state, so individual requests never pay model-loading
cost.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from ultralytics import YOLO

from app.api.routes import router
from app.config import get_settings
from app.services.analysis_service import AnalysisService
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    settings.ensure_directories()

    logger.info("Loading YOLO model: %s", settings.yolo_model_path)
    model = YOLO(settings.yolo_model_path)

    app.state.model = model
    app.state.analysis_service = AnalysisService(model=model)

    logger.info("Jogo AI Video Analysis service ready")
    yield
    logger.info("Shutting down AI Video Analysis service")


app = FastAPI(
    title="Jogo AI Video Analysis Service",
    description=(
        "MVP backend that analyzes short football skill/training clips: "
        "detects and tracks the main player, computes movement metrics, "
        "and returns a structured performance report."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(router)
