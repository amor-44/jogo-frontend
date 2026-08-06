import pytest
from fastapi.testclient import TestClient

from app.api.dependencies import get_chatbot_service
from app.chatbot.service import ChatbotService
from app.main import app
from tests.conftest import FakeLLMService


@pytest.fixture
def client(player_provider, conversation_store):
    fake_llm = FakeLLMService(canned_response="Mocked assistant response.")

    def _override_get_chatbot_service() -> ChatbotService:
        return ChatbotService(
            player_data_provider=player_provider,
            llm_service=fake_llm,
            conversation_store=conversation_store,
        )

    app.dependency_overrides[get_chatbot_service] = _override_get_chatbot_service
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_endpoint_success(client):
    response = client.post(
        "/api/chat",
        json={"player_id": "player_001", "message": "How is my performance?"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["response"] == "Mocked assistant response."
    assert "conversation_id" in body


def test_chat_endpoint_missing_player_returns_404(client):
    response = client.post(
        "/api/chat",
        json={"player_id": "no_such_player", "message": "Hello"},
    )
    assert response.status_code == 404


def test_chat_endpoint_empty_message_returns_400(client):
    response = client.post(
        "/api/chat",
        json={"player_id": "player_001", "message": "   "},
    )
    # Pydantic validation catches this before it reaches the service (422),
    # since the message field validator rejects blank messages.
    assert response.status_code == 422


def test_chat_endpoint_invalid_request_missing_fields(client):
    response = client.post("/api/chat", json={"message": "Hello"})
    assert response.status_code == 422
