import hashlib
import logging
import secrets

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from urllib.parse import (
    quote,
)

from fastapi import (
    HTTPException,
)

from sqlalchemy import (
    select,
    update,
)

from sqlalchemy.orm import (
    Session,
)

from app.config import (
    settings,
)

from app.core.security import (
    hash_password,
    verify_password,
)

from app.models.database_models import (
    User,
)

from app.models.password_reset_models import (
    PasswordResetToken,
)

from app.services.auth_service import (
    get_user_by_email,
)

from app.services.email_service import (
    EmailDeliveryError,
    send_password_reset_email,
)


logger = logging.getLogger(
    __name__
)


GENERIC_FORGOT_PASSWORD_MESSAGE = (
    "If an eligible account exists for that "
    "email address, password reset "
    "instructions have been sent."
)


PASSWORD_RESET_SUCCESS_MESSAGE = (
    "Your password has been reset "
    "successfully. You can now sign in "
    "with your new password."
)


# ============================================================
# HELPERS
# ============================================================

def utc_now() -> datetime:

    return datetime.now(
        timezone.utc
    )


def hash_reset_token(
    token: str,
) -> str:

    return (
        hashlib
        .sha256(
            token.encode(
                "utf-8"
            )
        )
        .hexdigest()
    )


def build_reset_url(
    raw_token: str,
) -> str:

    encoded_token = quote(
        raw_token,
        safe="",
    )


    return (
        f"{settings.PUBLIC_FRONTEND_URL}"
        "/reset-password"
        f"?token={encoded_token}"
    )


# ============================================================
# REQUEST PASSWORD RESET
# ============================================================

def request_password_reset(
    database: Session,
    email: str,
) -> str:

    """
    Request a password-reset email.

    The public response is intentionally
    identical for:
    - unknown email
    - Google-only account
    - disabled account
    - valid password account
    """

    user = get_user_by_email(
        database,
        email,
    )


    if not user:

        return (
            GENERIC_FORGOT_PASSWORD_MESSAGE
        )


    if not user.is_active:

        return (
            GENERIC_FORGOT_PASSWORD_MESSAGE
        )


    if (
        user.oauth_provider
        == "google"
    ):

        return (
            GENERIC_FORGOT_PASSWORD_MESSAGE
        )


    now = utc_now()


    cooldown_start = (
        now
        - timedelta(
            seconds=(
                settings
                .PASSWORD_RESET_COOLDOWN_SECONDS
            )
        )
    )


    recent_statement = (
        select(
            PasswordResetToken
        )
        .where(
            PasswordResetToken.user_id
            == user.id
        )
        .where(
            PasswordResetToken.used_at
            .is_(None)
        )
        .where(
            PasswordResetToken.created_at
            >= cooldown_start
        )
        .limit(
            1
        )
    )


    recent_token = (
        database.scalar(
            recent_statement
        )
    )


    if recent_token:

        return (
            GENERIC_FORGOT_PASSWORD_MESSAGE
        )


    # --------------------------------------------------------
    # INVALIDATE PREVIOUS UNUSED RESET TOKENS
    # --------------------------------------------------------

    database.execute(
        update(
            PasswordResetToken
        )
        .where(
            PasswordResetToken.user_id
            == user.id
        )
        .where(
            PasswordResetToken.used_at
            .is_(None)
        )
        .values(
            used_at=now
        )
    )


    # --------------------------------------------------------
    # CREATE ONE-TIME TOKEN
    # --------------------------------------------------------

    raw_token = (
        secrets
        .token_urlsafe(
            48
        )
    )


    token_hash = (
        hash_reset_token(
            raw_token
        )
    )


    expires_at = (
        now
        + timedelta(
            minutes=(
                settings
                .PASSWORD_RESET_EXPIRE_MINUTES
            )
        )
    )


    reset_token = (
        PasswordResetToken(
            user_id=user.id,

            token_hash=(
                token_hash
            ),

            expires_at=(
                expires_at
            ),
        )
    )


    database.add(
        reset_token
    )

    database.commit()


    # --------------------------------------------------------
    # SEND EMAIL
    # --------------------------------------------------------

    reset_url = (
        build_reset_url(
            raw_token
        )
    )


    try:

        send_password_reset_email(
            recipient_email=(
                user.email
            ),

            recipient_name=(
                user.full_name
            ),

            reset_url=(
                reset_url
            ),

            expires_minutes=(
                settings
                .PASSWORD_RESET_EXPIRE_MINUTES
            ),
        )


    except EmailDeliveryError:

        # Do not expose account existence or
        # provider configuration through the
        # public forgot-password endpoint.
        logger.exception(
            (
                "Password reset email "
                "delivery failed."
            )
        )


    return (
        GENERIC_FORGOT_PASSWORD_MESSAGE
    )


# ============================================================
# RESET PASSWORD
# ============================================================

def reset_password(
    database: Session,
    raw_token: str,
    new_password: str,
) -> str:

    token_hash = (
        hash_reset_token(
            raw_token
        )
    )


    now = utc_now()


    statement = (
        select(
            PasswordResetToken
        )
        .where(
            PasswordResetToken.token_hash
            == token_hash
        )
        .where(
            PasswordResetToken.used_at
            .is_(None)
        )
        .where(
            PasswordResetToken.expires_at
            > now
        )
    )


    reset_token = (
        database.scalar(
            statement
        )
    )


    if not reset_token:

        raise HTTPException(
            status_code=400,
            detail=(
                "This password reset link "
                "is invalid or has expired."
            ),
        )


    user = database.get(
        User,
        reset_token.user_id,
    )


    if (
        not user
        or not user.is_active
        or user.oauth_provider
        == "google"
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "This password reset link "
                "is invalid or has expired."
            ),
        )


    if verify_password(
        new_password,
        user.password_hash,
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Your new password must "
                "be different from your "
                "current password."
            ),
        )


    # --------------------------------------------------------
    # UPDATE PASSWORD
    # --------------------------------------------------------

    user.password_hash = (
        hash_password(
            new_password
        )
    )


    database.add(
        user
    )


    # --------------------------------------------------------
    # INVALIDATE ALL RESET TOKENS FOR USER
    # --------------------------------------------------------

    database.execute(
        update(
            PasswordResetToken
        )
        .where(
            PasswordResetToken.user_id
            == user.id
        )
        .where(
            PasswordResetToken.used_at
            .is_(None)
        )
        .values(
            used_at=now
        )
    )


    database.commit()


    return (
        PASSWORD_RESET_SUCCESS_MESSAGE
    )