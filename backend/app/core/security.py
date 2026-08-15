from datetime import (
    datetime,
    timedelta,
    timezone,
)

import jwt

from fastapi.security import (
    OAuth2PasswordBearer,
)

from jwt import InvalidTokenError

from pwdlib import PasswordHash

from app.config import settings


password_hasher = (
    PasswordHash.recommended()
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/token"
)


def hash_password(
    password: str,
) -> str:
    return password_hasher.hash(
        password
    )


def verify_password(
    plain_password: str,
    password_hash: str,
) -> bool:
    return password_hasher.verify(
        plain_password,
        password_hash,
    )


def create_access_token(
    user_id: int,
    role: str,
) -> str:
    if not settings.JWT_SECRET_KEY:
        raise RuntimeError(
            "JWT_SECRET_KEY is not configured."
        )

    now = datetime.now(
        timezone.utc
    )

    expires = now + timedelta(
        minutes=(
            settings
            .ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": expires,
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=(
            settings.JWT_ALGORITHM
        ),
    )


def decode_access_token(
    token: str,
) -> dict:
    if not settings.JWT_SECRET_KEY:
        raise RuntimeError(
            "JWT_SECRET_KEY is not configured."
        )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[
                settings.JWT_ALGORITHM
            ],
            options={
                "require": [
                    "sub",
                    "exp",
                ]
            },
        )

        return payload

    except InvalidTokenError as error:
        raise ValueError(
            "Invalid or expired access token."
        ) from error