import logging


from fastapi import FastAPI

from app.api.routes import router
from app.core.config import get_settings

settings = get_settings()
logging.basicConfig(level=settings.log_level)

app = FastAPI(
    title="Jogo AI Football Player Assistant Chatbot",
    description="MVP backend for a personalized AI chatbot for football players on the Jogo platform.",
    version="0.1.0",
)

app.include_router(router)
