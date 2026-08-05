import pytest

from app.chatbot.service import ChatbotService
from app.core.exceptions import ConversationNotFoundError, EmptyMessageError, PlayerNotFoundError


@pytest.fixture
def chatbot_service(player_provider, fake_llm, conversation_store):
    return ChatbotService(
        player_data_provider=player_provider,
        llm_service=fake_llm,
        conversation_store=conversation_store,
    )


def test_successful_chat_returns_response_and_conversation_id(chatbot_service, fake_llm):
    fake_llm.canned_response = "Your passing accuracy is strong at 87."

    conversation_id, response = chatbot_service.handle_message(
        player_id="player_001", message="How is my performance?", conversation_id=None
    )

    assert conversation_id
    assert response == "Your passing accuracy is strong at 87."


def test_missing_player_raises_player_not_found(chatbot_service):
    with pytest.raises(PlayerNotFoundError):
        chatbot_service.handle_message(player_id="unknown_player", message="Hi", conversation_id=None)


def test_empty_message_raises_empty_message_error(chatbot_service):
    with pytest.raises(EmptyMessageError):
        chatbot_service.handle_message(player_id="player_001", message="   ", conversation_id=None)


def test_unknown_conversation_id_raises_not_found(chatbot_service):
    with pytest.raises(ConversationNotFoundError):
        chatbot_service.handle_message(
            player_id="player_001", message="Hello", conversation_id="does-not-exist"
        )


def test_conversation_history_is_passed_to_llm_on_second_turn(chatbot_service, fake_llm):
    conversation_id, _ = chatbot_service.handle_message(
        player_id="player_001", message="How is my performance?", conversation_id=None
    )
    chatbot_service.handle_message(
        player_id="player_001", message="What about last time?", conversation_id=conversation_id
    )

    # On the second call, history should contain the first user+assistant turn.
    assert fake_llm.last_history is not None
    assert len(fake_llm.last_history) == 2
    assert fake_llm.last_history[0]["role"] == "user"
    assert fake_llm.last_history[1]["role"] == "assistant"


def test_player_context_is_injected_into_system_prompt(chatbot_service, fake_llm):
    chatbot_service.handle_message(
        player_id="player_001", message="What's my overall score?", conversation_id=None
    )
    assert "Karim Youssef" in fake_llm.last_system_prompt
    assert "Overall Score: 82" in fake_llm.last_system_prompt
