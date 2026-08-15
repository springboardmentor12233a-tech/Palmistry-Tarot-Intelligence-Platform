from datetime import (
    datetime,
    timezone,
)

from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.core.database import Base


# ============================================================
# DATETIME HELPERS
# ============================================================

def utc_now() -> datetime:

    return datetime.now(
        timezone.utc
    )


# ============================================================
# USER
# ============================================================

class User(Base):

    __tablename__ = "users"


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )


    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )


    password_hash: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )


    full_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )


    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="user",
        index=True,
    )


    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )


    age_group: Mapped[
        str | None
    ] = mapped_column(
        String(50),
        nullable=True,
    )


    interests: Mapped[
        str | None
    ] = mapped_column(
        Text,
        nullable=True,
    )


    spiritual_goal: Mapped[
        str | None
    ] = mapped_column(
        Text,
        nullable=True,
    )


    reading_preference: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )


    oauth_provider: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
    )


    oauth_subject: Mapped[
        str | None
    ] = mapped_column(
        String(255),
        nullable=True,
    )


    created_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        default=utc_now,
    )


    updated_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )


# ============================================================
# READING SESSION
# ============================================================

class ReadingSession(Base):

    """
    One complete palmistry + tarot reading
    belonging to one authenticated user.

    Follow-up chat messages are attached
    to this reading session.
    """

    __tablename__ = (
        "reading_sessions"
    )


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )


    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )


    title: Mapped[str] = mapped_column(
        String(250),
        nullable=False,
    )


    original_question: Mapped[
        str
    ] = mapped_column(
        Text,
        nullable=False,
    )


    category: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )


    spread: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )


    # --------------------------------------------------------
    # ORIGINAL READING CONTEXT
    # --------------------------------------------------------

    user_profile: Mapped[
        dict[str, Any]
    ] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )


    reading_context: Mapped[
        dict[str, Any]
    ] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )


    palm_analysis: Mapped[
        dict[str, Any]
    ] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )


    tarot_analysis: Mapped[
        dict[str, Any]
    ] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )


    initial_reading: Mapped[
        dict[str, Any]
    ] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )


    scores: Mapped[
        dict[str, Any]
    ] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )


    is_archived: Mapped[
        bool
    ] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )


    created_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        default=utc_now,
        index=True,
    )


    updated_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )


# ============================================================
# CHAT MESSAGE
# ============================================================

class ReadingChatMessage(Base):

    """
    Persistent follow-up message attached
    to a reading session.
    """

    __tablename__ = (
        "reading_chat_messages"
    )


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )


    session_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "reading_sessions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )


    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )


    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )


    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


    created_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        default=utc_now,
        index=True,
    )


# ============================================================
# NOTIFICATION
# ============================================================

class Notification(Base):

    """
    In-app notification belonging to
    one authenticated user.
    """

    __tablename__ = (
        "notifications"
    )


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )


    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )


    notification_type: Mapped[
        str
    ] = mapped_column(
        String(50),
        nullable=False,
        default="general",
        index=True,
    )


    title: Mapped[str] = mapped_column(
        String(250),
        nullable=False,
    )


    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )


    related_reading_session_id: Mapped[
        int | None
    ] = mapped_column(
        Integer,
        ForeignKey(
            "reading_sessions.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )


    is_read: Mapped[
        bool
    ] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        index=True,
    )


    created_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        default=utc_now,
        index=True,
    )


    read_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=True,
    )


# ============================================================
# ANALYTICS READING
# ============================================================

class AnalyticsReading(Base):

    """
    Aggregated analytical representation
    of a completed reading.

    This replaces the old standalone
    analytics.db SQLite database.

    It uses the same SQLAlchemy database
    as the rest of the platform, allowing
    SQLite locally and PostgreSQL in
    production.
    """

    __tablename__ = (
        "analytics_readings"
    )


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )


    user_id: Mapped[
        int | None
    ] = mapped_column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )


    created_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        default=utc_now,
        index=True,
    )


    category: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )


    spread: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )


    heart_line: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )


    head_line: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )


    life_line: Mapped[
        str | None
    ] = mapped_column(
        String(100),
        nullable=True,
        index=True,
    )


    tarot_cards: Mapped[
        list[Any]
    ] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )


    upright_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )


    reversed_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )


    overall_insight_score: Mapped[
        float | None
    ] = mapped_column(
        Float,
        nullable=True,
    )