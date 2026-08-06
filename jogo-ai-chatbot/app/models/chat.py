"""
Request/response schemas for the chat API.
"""
from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    player_id: str = Field(..., min_length=1, description="ID of the player sending the message.")
    message: str = Field(..., min_length=1, description="The player's message to the assistant.")
    conversation_id: str | None = Field(
        default=None,
        description="Existing conversation to continue. Omit to start a new conversation.",
    )

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("message must not be empty or whitespace only")
        return value.strip()

    @field_validator("player_id")
    @classmethod
    def player_id_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("player_id must not be empty")
        return value.strip()


class ChatResponse(BaseModel):
    conversation_id: str
    response: str


class ErrorResponse(BaseModel):
    error: str
    detail: str
