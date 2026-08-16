import uuid
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


class UserModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    username: str
    password_hash: str
    full_name: str = ""
    role: str = "user"  # "user" or "admin"
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())



class UserSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str | None = None
    username: str | None = "guest"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: dict[str, Any] = Field(default_factory=dict)


class PalmAnalysisRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str | None = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    palm_shape: str = "Unknown"
    aspect_ratio: float = 1.0
    cluster_id: int = 0
    landmarks: list[dict[str, float]] = Field(default_factory=list)
    engineered_features: dict[str, float] = Field(default_factory=dict)
    palm_lines: list[dict[str, Any]] = Field(default_factory=list)
    rule_report: dict[str, Any] = Field(default_factory=dict)


class TarotReadingRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str | None = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    num_cards: int = 3
    user_question: str | None = None
    cards: list[dict[str, Any]] = Field(default_factory=list)
    interpretation: dict[str, Any] = Field(default_factory=dict)


class ChatMessageRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str | None = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    user_message: str
    bot_reply: str
    reading_context_linked: dict[str, Any] | None = None
    suggested_followups: list[str] = Field(default_factory=list)
