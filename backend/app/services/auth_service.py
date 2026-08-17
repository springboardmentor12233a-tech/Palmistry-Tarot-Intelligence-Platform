import secrets

from collections.abc import (
    Callable,
)

from fastapi import (
    Depends,
    HTTPException,
    status,
)

from google.auth.exceptions import (
    GoogleAuthError,
)

from google.auth.transport.requests import (
    Request as GoogleRequest,
)

from google.oauth2 import (
    id_token as google_id_token,
)

from sqlalchemy import (
    select,
)

from sqlalchemy.exc import (
    IntegrityError,
)

from sqlalchemy.orm import (
    Session,
)

from app.config import (
    settings,
)

from app.core.database import (
    get_db,
)

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


GOOGLE_ISSUERS = {
    "accounts.google.com",
    "https://accounts.google.com",
}


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_email(
    email: str,
) -> str:

    return (
        email
        .strip()
        .lower()
    )


# ============================================================
# USER LOOKUPS
# ============================================================

def get_user_by_email(
    database: Session,
    email: str,
) -> User | None:

    normalized_email = (
        normalize_email(
            email
        )
    )

    statement = (
        select(
            User
        )
        .where(
            User.email
            == normalized_email
        )
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


def get_google_user_by_subject(
    database: Session,
    subject: str,
) -> User | None:

    statement = (
        select(
            User
        )
        .where(
            User.oauth_provider
            == "google"
        )
        .where(
            User.oauth_subject
            == subject
        )
    )

    return database.scalar(
        statement
    )


# ============================================================
# PASSWORD REGISTRATION
# ============================================================

def create_user(
    database: Session,
    request: UserRegister,
) -> User:

    existing_user = (
        get_user_by_email(
            database,
            str(
                request.email
            ),
        )
    )

    if existing_user:

        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this "
                "email already exists."
            ),
        )


    user = User(
        email=normalize_email(
            str(
                request.email
            )
        ),

        password_hash=(
            hash_password(
                request.password
            )
        ),

        full_name=(
            request
            .full_name
            .strip()
        ),

        role="user",

        age_group=(
            request.age_group
        ),

        interests=(
            request.interests
        ),

        spiritual_goal=(
            request.spiritual_goal
        ),

        reading_preference=(
            request
            .reading_preference
        ),
    )


    database.add(
        user
    )

    try:

        database.commit()

    except IntegrityError as error:

        database.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this "
                "email already exists."
            ),
        ) from error


    database.refresh(
        user
    )

    return user


# ============================================================
# PASSWORD AUTHENTICATION
# ============================================================

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


# ============================================================
# GOOGLE TOKEN VERIFICATION
# ============================================================

def verify_google_credential(
    credential: str,
) -> dict:

    """
    Verify a Google Identity Services
    ID-token credential.

    GOOGLE_CLIENT_ID is used as the
    expected audience.
    """

    if not (
        settings
        .GOOGLE_CLIENT_ID
        .strip()
    ):

        raise HTTPException(
            status_code=503,
            detail=(
                "Google sign-in is not "
                "configured on this server."
            ),
        )


    try:

        payload = (
            google_id_token
            .verify_oauth2_token(
                credential,

                GoogleRequest(),

                settings
                .GOOGLE_CLIENT_ID,
            )
        )

    except ValueError as error:

        raise HTTPException(
            status_code=401,
            detail=(
                "The Google sign-in "
                "credential is invalid "
                "or has expired."
            ),
            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        ) from error

    except GoogleAuthError as error:

        raise HTTPException(
            status_code=503,
            detail=(
                "Google authentication "
                "could not be verified "
                "at this time."
            ),
        ) from error


    issuer = str(
        payload.get(
            "iss",
            "",
        )
    )


    if issuer not in (
        GOOGLE_ISSUERS
    ):

        raise HTTPException(
            status_code=401,
            detail=(
                "The Google sign-in "
                "credential has an "
                "invalid issuer."
            ),
        )


    subject = str(
        payload.get(
            "sub",
            "",
        )
    ).strip()


    email = normalize_email(
        str(
            payload.get(
                "email",
                "",
            )
        )
    )


    email_verified = (
        payload.get(
            "email_verified"
        )
    )


    if not subject:

        raise HTTPException(
            status_code=401,
            detail=(
                "The Google account "
                "identifier is missing."
            ),
        )


    if not email:

        raise HTTPException(
            status_code=401,
            detail=(
                "The Google account "
                "email is missing."
            ),
        )


    if email_verified is not True:

        raise HTTPException(
            status_code=401,
            detail=(
                "The Google account "
                "email is not verified."
            ),
        )


    full_name = str(
        payload.get(
            "name",
            "",
        )
    ).strip()


    if len(
        full_name
    ) < 2:

        full_name = (
            "Google User"
        )


    return {
        "subject":
            subject,

        "email":
            email,

        "full_name":
            full_name,
    }


# ============================================================
# GOOGLE AUTHENTICATION
# ============================================================

def authenticate_google_user(
    database: Session,
    credential: str,
) -> User:

    google_account = (
        verify_google_credential(
            credential
        )
    )


    subject = (
        google_account[
            "subject"
        ]
    )


    email = (
        google_account[
            "email"
        ]
    )


    full_name = (
        google_account[
            "full_name"
        ]
    )


    # --------------------------------------------------------
    # RETURNING GOOGLE USER
    # --------------------------------------------------------

    linked_user = (
        get_google_user_by_subject(
            database,
            subject,
        )
    )


    if linked_user:

        if not (
            linked_user
            .is_active
        ):

            raise HTTPException(
                status_code=403,
                detail=(
                    "This account "
                    "is disabled."
                ),
            )

        return linked_user


    # --------------------------------------------------------
    # EXISTING LOCAL EMAIL
    # --------------------------------------------------------
    #
    # Do not automatically link an existing
    # password account solely because the
    # Google token contains the same email.
    # --------------------------------------------------------

    existing_email_user = (
        get_user_by_email(
            database,
            email,
        )
    )


    if existing_email_user:

        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this email "
                "already exists. Sign in with "
                "your email and password. "
                "Google account linking is not "
                "enabled for this account yet."
            ),
        )


    # --------------------------------------------------------
    # NEW GOOGLE USER
    # --------------------------------------------------------
    #
    # password_hash remains non-null because
    # the existing database schema requires it.
    #
    # The random internal password is never
    # returned to or known by the user.
    # --------------------------------------------------------

    internal_password = (
        secrets
        .token_urlsafe(
            48
        )
    )


    user = User(
        email=email,

        password_hash=(
            hash_password(
                internal_password
            )
        ),

        full_name=(
            full_name
        ),

        role="user",

        is_active=True,

        oauth_provider=(
            "google"
        ),

        oauth_subject=(
            subject
        ),
    )


    database.add(
        user
    )


    try:

        database.commit()

    except IntegrityError as error:

        database.rollback()

        raise HTTPException(
            status_code=409,
            detail=(
                "A platform account "
                "already exists for "
                "this Google identity."
            ),
        ) from error


    database.refresh(
        user
    )

    return user


# ============================================================
# PROFILE UPDATE
# ============================================================

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


    for (
        field_name,
        value,
    ) in (
        update_data
        .items()
    ):

        if (
            isinstance(
                value,
                str,
            )
            and field_name
            == "full_name"
        ):

            value = (
                value.strip()
            )


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


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(
    token: str = Depends(
        oauth2_scheme
    ),

    database: Session = Depends(
        get_db
    ),
) -> User:

    credentials_error = (
        HTTPException(
            status_code=(
                status
                .HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Could not validate "
                "credentials."
            ),
            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        )
    )


    try:

        payload = (
            decode_access_token(
                token
            )
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
                "This account is "
                "disabled."
            ),
        )


    return user


# ============================================================
# ROLE AUTHORIZATION
# ============================================================

def require_roles(
    *allowed_roles: str,
) -> Callable:

    invalid_roles = (
        set(
            allowed_roles
        )
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
                    "You do not have "
                    "permission to access "
                    "this resource."
                ),
            )


        return current_user


    return role_dependency