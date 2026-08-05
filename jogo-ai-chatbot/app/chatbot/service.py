"""
ChatbotService: orchestrates the full chat flow.

Responsibilities:
- Retrieve player data via PlayerDataProvider
- Build the controlled player context
- Manage conversation history via ConversationStore
- Call the LLMService with the assembled prompt
- Return the final response text

This is the only layer that "knows" the overall flow. It has no HTTP
concerns (that's the API layer) and no direct Gemini API calls (that's
the LLM layer).
"""
from app.chatbot.context_builder import build_player_context
from app.chatbot.system_prompt import build_system_prompt
from app.core.conversation_store import Conversation, ConversationStore
from app.core.exceptions import ConversationNotFoundError, EmptyMessageError, PlayerNotFoundError
from app.data.provider import PlayerDataProvider
from app.llm.base import LLMService


class ChatbotService:
    def __init__(
        self,
        player_data_provider: PlayerDataProvider,
        llm_service: LLMService,
        conversation_store: ConversationStore,
    ) -> None:
        self._player_data_provider = player_data_provider
        self._llm_service = llm_service
        self._conversation_store = conversation_store

    def _get_or_create_conversation(self, player_id: str, conversation_id: str | None) -> Conversation:
        if conversation_id is None:
            return self._conversation_store.create_conversation(player_id)

        conversation = self._conversation_store.get_conversation(conversation_id)
        if conversation is None:
            raise ConversationNotFoundError(conversation_id)
        return conversation

    def handle_message(self, player_id: str, message: str, conversation_id: str | None) -> tuple[str, str]:
        """
        Process a single player chat message end-to-end.

        Returns (conversation_id, response_text).
        """
        if not message or not message.strip():
            raise EmptyMessageError("Message must not be empty.")

        player_data = self._player_data_provider.get_player_data(player_id)
        if player_data is None:
            raise PlayerNotFoundError(player_id)

        conversation = self._get_or_create_conversation(player_id, conversation_id)

        player_context = build_player_context(player_data)
        system_prompt = build_system_prompt(player_context)

        history = [{"role": m.role, "content": m.content} for m in conversation.messages]

        response_text = self._llm_service.generate_response(
            system_prompt=system_prompt,
            conversation_history=history,
            user_message=message,
        )

        self._conversation_store.append_message(conversation.conversation_id, "user", message)
        self._conversation_store.append_message(conversation.conversation_id, "assistant", response_text)

        return conversation.conversation_id, response_text
