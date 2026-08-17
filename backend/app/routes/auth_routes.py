from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from fastapi.security import (
    OAuth2PasswordRequestForm,
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
    create_access_token,
)

from app.models.auth_schemas import (
    GoogleLoginRequest,
    LoginRequest,
    ProfileUpdate,
    TokenResponse,
    UserRegister,
    UserResponse,
)

from app.models.database_models import (
    User,
)

from app.services.auth_service import (
    authenticate_google_user,
    authenticate_user,
    create_user,
    get_current_user,
    update_user_profile,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


# ============================================================
# TOKEN RESPONSE
# ============================================================

def build_token_response(
    user: User,
) -> TokenResponse:

    token = (
        create_access_token(
            user_id=user.id,
            role=user.role,
        )
    )


    return TokenResponse(
        access_token=token,

        token_type="bearer",

        expires_in=(
            settings
            .ACCESS_TOKEN_EXPIRE_MINUTES
            * 60
        ),

        user=(
            UserResponse
            .model_validate(
                user
            )
        ),
    )


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",

    response_model=(
        TokenResponse
    ),

    status_code=(
        status
        .HTTP_201_CREATED
    ),
)
def register(
    request: UserRegister,

    database: Session = Depends(
        get_db
    ),
):

    user = create_user(
        database,
        request,
    )

    return build_token_response(
        user
    )


# ============================================================
# PASSWORD LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    request: LoginRequest,

    database: Session = Depends(
        get_db
    ),
):

    user = authenticate_user(
        database,
        str(
            request.email
        ),
        request.password,
    )


    if not user:

        raise HTTPException(
            status_code=(
                status
                .HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Incorrect email "
                "or password."
            ),
            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        )


    return build_token_response(
        user
    )


# ============================================================
# GOOGLE LOGIN
# ============================================================

@router.post(
    "/google",
    response_model=TokenResponse,
)
def google_login(
    request: GoogleLoginRequest,

    database: Session = Depends(
        get_db
    ),
):

    user = (
        authenticate_google_user(
            database,
            request.credential,
        )
    )


    return build_token_response(
        user
    )


# ============================================================
# OAUTH2 PASSWORD TOKEN
# ============================================================

@router.post(
    "/token",
    response_model=TokenResponse,
)
def oauth2_token(
    form_data: (
        OAuth2PasswordRequestForm
    ) = Depends(),

    database: Session = Depends(
        get_db
    ),
):

    """
    OAuth2-compatible password-token
    endpoint.

    The OAuth2 username field is treated
    as the user's email address.
    """

    user = authenticate_user(
        database,
        form_data.username,
        form_data.password,
    )


    if not user:

        raise HTTPException(
            status_code=(
                status
                .HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Incorrect email "
                "or password."
            ),
            headers={
                "WWW-Authenticate":
                    "Bearer",
            },
        )


    return build_token_response(
        user
    )


# ============================================================
# CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def read_current_user(
    current_user: User = Depends(
        get_current_user
    ),
):

    return current_user


# ============================================================
# PROFILE UPDATE
# ============================================================

@router.patch(
    "/profile",
    response_model=UserResponse,
)
def update_profile(
    request: ProfileUpdate,

    current_user: User = Depends(
        get_current_user
    ),

    database: Session = Depends(
        get_db
    ),
):

    return update_user_profile(
        database,
        current_user,
        request,
    )