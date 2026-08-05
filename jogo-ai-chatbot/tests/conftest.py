import pytest

from app.core.conversation_store import InMemoryConversationStore
from app.data.mock_provider import MockPlayerDataProvider
from app.llm.base import LLMService


class FakeLLMService(LLMService):
    """A fake LLM used in tests so no real Gemini API key/call is ever needed."""

    def __init__(self, canned_response: str = "This is a mocked assistant response.") -> None:
        self.canned_response = canned_response
        self.last_system_prompt: str | None = None
        self.last_history: list[dict] | None = None
        self.last_user_message: str | None = None

    def generate_response(self, system_prompt: str, conversation_history: list[dict], user_message: str) -> str:
        self.last_system_prompt = system_prompt
        self.last_history = conversation_history
        self.last_user_message = user_message
        return self.canned_response


@pytest.fixture
def player_provider() -> MockPlayerDataProvider:
    return MockPlayerDataProvider()


@pytest.fixture
def conversation_store() -> InMemoryConversationStore:
    return InMemoryConversationStore()


@pytest.fixture
def fake_llm() -> FakeLLMService:
    return FakeLLMService()
