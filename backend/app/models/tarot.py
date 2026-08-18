from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class TarotReading(Base):
    __tablename__ = "tarot_readings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    question: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    topic: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    spread: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Three Card Reading"
    )

    past_card: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    past_meaning: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    present_card: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    present_meaning: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    future_card: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    future_meaning: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # =====================================================
    # TAROT CARD DETAILS
    # =====================================================

    past_orientation: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
        default="Upright"
    )

    past_keywords: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default=""
    )

    present_orientation: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
        default="Upright"
    )

    present_keywords: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default=""
    )

    future_orientation: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
        default="Upright"
    )

    future_keywords: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
        default=""
    )