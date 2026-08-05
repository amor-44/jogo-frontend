
from abc import ABC, abstractmethod


class LLMService(ABC):
    """Abstract interface for generating a chat completion from an LLM provider."""

    @abstractmethod
    def generate_response(self, system_prompt: str, conversation_history: list[dict], user_message: str) -> str:
        """
        Generate a response given a system prompt, prior conversation turns,
        and the new user message.

        conversation_history: list of {"role": "user"|"assistant", "content": str}
        """
        ...
