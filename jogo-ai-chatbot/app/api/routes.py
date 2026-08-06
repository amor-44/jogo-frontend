"""
API routes for the Jogo AI Chatbot.

Responsible only for HTTP concerns: request validation (via Pydantic),
calling the ChatbotService, and translating results/exceptions into HTTP
responses. No business logic lives here.

NOTE ON AUTH: For this MVP, player_id is accepted directly in the request
body. In the real Jogo integration, player_id MUST be derived from the
authenticated session/token provided by the Jogo backend -- it should
never be trusted as-is from the frontend. See README for details.
"""
import logging

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_chatbot_service
from app.chatbot.service import ChatbotService
from app.core.exceptions import (
    ConversationNotFoundError,
    EmptyMessageError,
    LLMConfigurationError,
    LLMServiceError,
    PlayerNotFoundError,
)
from app.models.chat import ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@router.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest, chatbot_service: ChatbotService = Depends(get_chatbot_service)) -> ChatResponse:
    try:
        conversation_id, response_text = chatbot_service.handle_message(
            player_id=request.player_id,
            message=request.message,
            conversation_id=request.conversation_id,
        )
        return ChatResponse(conversation_id=conversation_id, response=response_text)

    except PlayerNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ConversationNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except EmptyMessageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LLMConfigurationError as exc:
        logger.error("LLM configuration error: %s", exc)
        raise HTTPException(status_code=500, detail="The AI assistant is not configured correctly.") from exc
    except LLMServiceError as exc:
        logger.error("LLM service error: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # last-resort safety net: never leak internals
        logger.exception("Unexpected error handling chat request")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.") from exc
