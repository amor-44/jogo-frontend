"""
Dependency wiring for the API layer.

Centralizes how concrete implementations (MockPlayerDataProvider,
GeminiService, InMemoryConversationStore) are constructed and injected
into ChatbotService. To point at the real Jogo backend later, only
`get_player_data_provider` needs to change.
"""
from functools import lru_cache

from app.chatbot.service import ChatbotService
from app.core.conversation_store import conversation_store
from app.data.mock_provider import MockPlayerDataProvider
from app.data.provider import PlayerDataProvider
from app.llm.base import LLMService
from app.llm.gemini_service import GeminiService


def get_player_data_provider() -> PlayerDataProvider:
    # Swap this for JogoBackendPlayerDataProvider() when the real backend is ready.
    return MockPlayerDataProvider()


@lru_cache
def get_llm_service() -> LLMService:
    # Constructed lazily and cached so a missing GEMINI_API_KEY only raises
    # when the chatbot is actually used, not at import time (keeps /health working).
    return GeminiService()


def get_chatbot_service() -> ChatbotService:
    return ChatbotService(
        player_data_provider=get_player_data_provider(),
        llm_service=get_llm_service(),
        conversation_store=conversation_store,
    )
