from datetime import (
    datetime,
    timezone,
)

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.core.database import (
    Base,
)


# ============================================================
# DATETIME HELPER
# ============================================================

def utc_now() -> datetime:

    return datetime.now(
        timezone.utc
    )


# ============================================================
# PASSWORD RESET TOKEN
# ============================================================

class PasswordResetToken(
    Base
):

    __tablename__ = (
        "password_reset_tokens"
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


    # Only the SHA-256 hash is stored.
    # The raw reset token is sent by email
    # and never stored in the database.
    token_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        index=True,
    )


    expires_at: Mapped[
        datetime
    ] = mapped_column(
        DateTime(
            timezone=True
        ),
        nullable=False,
        index=True,
    )


    used_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(
            timezone=True
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