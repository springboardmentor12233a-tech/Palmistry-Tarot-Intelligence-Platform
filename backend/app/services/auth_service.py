from collections.abc import Callable

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.core.security import (
    decode_access_token,
    hash_password,
    oauth2_scheme,
    verify_password,
)

from app.models.auth_schemas import (
    ProfileUpdate,
    UserRegister,
)

from app.models.database_models import (
    User,
)


VALID_ROLES = {
    "user",
    "tarot_reader",
    "spiritual_consultant",
    "administrator",
}



def normalize_email(
    email: str,
) -> str:
    return email.strip().lower()


def get_user_by_email(
    database: Session,
    email: str,
) -> User | None:
    normalized_email = (
        normalize_email(email)
    )

    statement = select(
        User
    ).where(
        User.email
        == normalized_email
    )

    return database.scalar(
        statement
    )


def get_user_by_id(
    database: Session,
    user_id: int,
) -> User | None:
    return database.get(
        User,
        user_id,
    )


def create_user(
    database: Session,
    request: UserRegister,
) -> User:
    existing_user = get_user_by_email(
        database,
        str(request.email),
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this "
                "email already exists."
            ),
        )


        raise HTTPException(
            status_code=403,
            detail=(
                "This role cannot be selected "
                "during public registration."
            ),
        )

    user = User(
        email=normalize_email(
            str(request.email)
        ),

        password_hash=hash_password(
            request.password
        ),

        full_name=(
            request.full_name.strip()
        ),

        role="user",

        age_group=request.age_group,

        interests=request.interests,

        spiritual_goal=(
            request.spiritual_goal
        ),

        reading_preference=(
            request.reading_preference
        ),
    )

    database.add(
        user
    )

    database.commit()

    database.refresh(
        user
    )

    return user


def authenticate_user(
    database: Session,
    email: str,
    password: str,
) -> User | None:
    user = get_user_by_email(
        database,
        email,
    )

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user


def update_user_profile(
    database: Session,
    user: User,
    update: ProfileUpdate,
) -> User:
    update_data = (
        update.model_dump(
            exclude_unset=True
        )
    )

    for field_name, value in (
        update_data.items()
    ):
        if (
            isinstance(
                value,
                str,
            )
            and field_name
            == "full_name"
        ):
            value = value.strip()

        setattr(
            user,
            field_name,
            value,
        )

    database.add(
        user
    )

    database.commit()

    database.refresh(
        user
    )

    return user


def get_current_user(
    token: str = Depends(
        oauth2_scheme
    ),

    database: Session = Depends(
        get_db
    ),
) -> User:
    credentials_error = HTTPException(
        status_code=(
            status.HTTP_401_UNAUTHORIZED
        ),
        detail=(
            "Could not validate credentials."
        ),
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    try:
        payload = decode_access_token(
            token
        )

        user_id = int(
            payload.get(
                "sub",
                "",
            )
        )

    except (
        ValueError,
        TypeError,
    ):
        raise credentials_error

    user = get_user_by_id(
        database,
        user_id,
    )

    if not user:
        raise credentials_error

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail=(
                "This account is disabled."
            ),
        )

    return user


def require_roles(
    *allowed_roles: str,
) -> Callable:
    invalid_roles = (
        set(allowed_roles)
        - VALID_ROLES
    )

    if invalid_roles:
        raise ValueError(
            (
                "Unknown role(s): "
                + ", ".join(
                    sorted(
                        invalid_roles
                    )
                )
            )
        )

    def role_dependency(
        current_user: User = Depends(
            get_current_user
        ),
    ) -> User:

        if (
            current_user.role
            not in allowed_roles
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    "You do not have permission "
                    "to access this resource."
                ),
            )

        return current_user

    return role_dependency