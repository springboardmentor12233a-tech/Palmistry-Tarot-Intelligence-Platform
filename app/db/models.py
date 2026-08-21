import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


def generate_uuid(prefix: str = "") -> str:
    unique_id = uuid.uuid4().hex[:12]
    return f"{prefix}{unique_id}" if prefix else unique_id


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: generate_uuid("usr_"), index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(64), default="user", nullable=False)  # user, tarot_reader, spiritual_consultant, administrator
    age_group = Column(String(32), nullable=True)
    interests = Column(JSON, default=list, nullable=False)
    spiritual_goals = Column(JSON, default=list, nullable=False)
    reading_preferences = Column(
        JSON,
        default=lambda: {
            "primary_focus": "General",
            "include_reversed_cards": True,
            "notification_frequency": "weekly",
        },
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    readings = relationship("Reading", back_populates="user", cascade="all, delete-orphan")


class Reading(Base):
    __tablename__ = "readings"

    id = Column(String(64), primary_key=True, default=lambda: generate_uuid("rdg_"), index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    spread_type = Column(String(64), default="three_card", nullable=False)
    spread_title = Column(String(255), default="Past, Present & Future Synthesis", nullable=False)

    # Unstructured / structured JSON payloads
    palm_result = Column(JSON, default=dict, nullable=False)
    tarot_spread = Column(JSON, default=dict, nullable=False)  # holds drawn cards and metadata
    user_context = Column(JSON, default=dict, nullable=True)
    interpretation = Column(JSON, default=dict, nullable=False)
    personality = Column(JSON, default=dict, nullable=False)
    life_trend = Column(JSON, default=dict, nullable=False)
    recommendations = Column(JSON, default=dict, nullable=False)
    insight_score = Column(JSON, default=dict, nullable=False)

    # Export URLs / paths
    pdf_url = Column(String(512), nullable=True)
    excel_url = Column(String(512), nullable=True)

    # Relationships
    user = relationship("User", back_populates="readings")
