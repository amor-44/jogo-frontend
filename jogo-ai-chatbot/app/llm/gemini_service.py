import logging


from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.core.config import get_settings
from app.core.exceptions import LLMConfigurationError, LLMServiceError
from app.llm.base import LLMService

logger = logging.getLogger(__name__)


class GeminiService(LLMService):
    """Talks to Google's Gemini API to generate chatbot responses."""

    def __init__(self) -> None:
        settings = get_settings()
        if not settings.is_gemini_configured:
            raise LLMConfigurationError(
                "GEMINI_API_KEY is not set. Add it to your .env file (see .env.example)."
            )
        self._model_name = settings.gemini_model
        self._client = genai.Client(api_key=settings.gemini_api_key)

    def generate_response(
        self,
        system_prompt: str,
        conversation_history: list[dict],
        user_message: str,
    ) -> str:
        contents = []
        for turn in conversation_history:
            role = "user" if turn["role"] == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part(text=turn["content"])]))
        contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

        try:
            response = self._client.models.generate_content(
                model=self._model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.4,
                ),
            )
        except APIError as exc:
            logger.error("Gemini API call failed: %s", exc)
            raise LLMServiceError("The AI assistant is temporarily unavailable. Please try again shortly.") from exc
        except Exception as exc:  # defensive: never leak internal errors to the client
            logger.error("Unexpected error calling Gemini: %s", exc)
            raise LLMServiceError("The AI assistant is temporarily unavailable. Please try again shortly.") from exc

        text = getattr(response, "text", None)
        if not text:
            raise LLMServiceError("The AI assistant returned an empty response. Please try again.")
        return text
