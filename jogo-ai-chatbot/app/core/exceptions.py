class JogoChatbotError(Exception):
    """Base exception for all Jogo Chatbot application errors."""

class PlayerNotFoundError(JogoChatbotError):
    """Raised when the requested player_id does not exist in the data provider."""

    def __init__(self, player_id: str) -> None:
        self.player_id = player_id
        super().__init__(f"Player '{player_id}' was not found.")


class InvalidPlayerDataError(JogoChatbotError):
    """Raised when player data exists but is malformed or fails validation."""


class ConversationNotFoundError(JogoChatbotError):
    """Raised when a conversation_id is supplied but does not exist in the store."""

    def __init__(self, conversation_id: str) -> None:
        self.conversation_id = conversation_id
        super().__init__(f"Conversation '{conversation_id}' was not found.")


class EmptyMessageError(JogoChatbotError):
    """Raised when the player's message is empty or whitespace-only."""


class LLMConfigurationError(JogoChatbotError):
    """Raised when the LLM provider (e.g. Gemini) is not configured correctly."""


class LLMServiceError(JogoChatbotError):
    """Raised when the LLM provider fails to produce a response (API failure, etc.)."""
