from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class PalmistryReading(Base):
    __tablename__ = "palmistry_readings"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    image_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    image_path: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    palm_shape: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    life_line: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    head_line: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    heart_line: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    fate_line: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    sun_line: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    overall_reading: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )