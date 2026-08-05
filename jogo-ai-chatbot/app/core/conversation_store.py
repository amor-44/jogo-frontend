import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone

@dataclass
class Message:
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Conversation:
    conversation_id: str
    player_id: str
    messages: list[Message] = field(default_factory=list)


class ConversationStore(ABC):
    """Abstract interface for storing and retrieving conversation history."""

    @abstractmethod
    def create_conversation(self, player_id: str) -> Conversation:
        ...

    @abstractmethod
    def get_conversation(self, conversation_id: str) -> Conversation | None:
        ...

    @abstractmethod
    def append_message(self, conversation_id: str, role: str, content: str) -> None:
        ...


class InMemoryConversationStore(ConversationStore):
    """Simple dict-backed conversation store. Fine for a single-process MVP."""

    def __init__(self) -> None:
        self._conversations: dict[str, Conversation] = {}

    def create_conversation(self, player_id: str) -> Conversation:
        conversation_id = str(uuid.uuid4())
        conversation = Conversation(conversation_id=conversation_id, player_id=player_id)
        self._conversations[conversation_id] = conversation
        return conversation

    def get_conversation(self, conversation_id: str) -> Conversation | None:
        return self._conversations.get(conversation_id)

    def append_message(self, conversation_id: str, role: str, content: str) -> None:
        conversation = self._conversations.get(conversation_id)
        if conversation is None:
            raise KeyError(f"Conversation '{conversation_id}' does not exist.")
        conversation.messages.append(Message(role=role, content=content))


# Module-level singleton store for the MVP (single process).
# In a future iteration this could be provided via FastAPI dependency injection
# backed by Redis/a database instead.
conversation_store = InMemoryConversationStore()
