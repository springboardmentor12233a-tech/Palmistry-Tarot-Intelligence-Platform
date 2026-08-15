from typing import Literal

from pydantic import (
    BaseModel,
    Field,
)


# ============================================================
# CHAT MESSAGE
# ============================================================

class ChatMessage(BaseModel):
    """
    One conversational message.
    """

    role: Literal[
        "user",
        "assistant",
    ]

    content: str = Field(
        min_length=1,
        max_length=30000,
    )


# ============================================================
# FOLLOW-UP REQUEST
# ============================================================

class FollowUpChatRequest(BaseModel):
    """
    The frontend only needs to send the
    saved reading-session ID and the user's
    newest question.

    Original reading context and previous
    conversation are loaded by the backend.
    """

    session_id: int = Field(
        gt=0
    )

    message: str = Field(
        min_length=2,
        max_length=1500,
    )


# ============================================================
# FOLLOW-UP RESPONSE
# ============================================================

class FollowUpChatResponse(BaseModel):
    status: str

    reading_session_id: int

    answer: str

    conversation: list[
        ChatMessage
    ]

    disclaimer: str = (
        "This AI-generated spiritual reading "
        "is intended for entertainment, "
        "reflection and personal-development "
        "purposes only."
    )