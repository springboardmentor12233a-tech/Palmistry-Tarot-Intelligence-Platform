import hashlib
import hmac
import secrets

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.core.config import settings


# =========================================================
# PASSWORD HASHING
# =========================================================

def hash_password(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256.
    """

    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        120000,
    ).hex()

    return f"{salt}${password_hash}"


def verify_password(
    password: str,
    stored_hash: str
) -> bool:
    """
    Verify a password against the stored PBKDF2 hash.
    """

    try:
        salt, password_hash = stored_hash.split(
            "$",
            1
        )

        calculated_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            120000,
        ).hex()

        return hmac.compare_digest(
            calculated_hash,
            password_hash,
        )

    except ValueError:
        return False


# =========================================================
# ACCESS TOKEN
# =========================================================

def create_access_token(
    user_id: int,
    email: str
) -> str:
    """
    Create JWT access token.
    """

    expire_minutes = getattr(
        settings,
        "access_token_expire_minutes",
        60,
    )

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=expire_minutes
        )
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
        "type": "access",
    }

    return jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=getattr(
            settings,
            "jwt_algorithm",
            "HS256",
        ),
    )


# =========================================================
# PASSWORD RESET TOKEN
# =========================================================

def create_password_reset_token(
    user_id: int,
    email: str
) -> str:
    """
    Create a short-lived password reset token.

    Token lifetime:
    15 minutes.
    """

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=15
        )
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
        "type": "password_reset",
    }

    return jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=getattr(
            settings,
            "jwt_algorithm",
            "HS256",
        ),
    )


def decode_password_reset_token(
    token: str
):
    """
    Decode and validate a password reset token.
    """

    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[
            getattr(
                settings,
                "jwt_algorithm",
                "HS256",
            )
        ],
    )

    if payload.get("type") != "password_reset":
        raise JWTError(
            "Invalid password reset token."
        )

    return payload


# =========================================================
# ACCESS TOKEN DECODER
# =========================================================

def decode_access_token(
    token: str
):
    """
    Decode and validate JWT access token.
    """

    payload = jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[
            getattr(
                settings,
                "jwt_algorithm",
                "HS256",
            )
        ],
    )

    return payload