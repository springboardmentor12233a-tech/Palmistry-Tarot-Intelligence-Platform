from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User

from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)

from app.core.security import (
    create_access_token,
    create_password_reset_token,
    decode_access_token,
    decode_password_reset_token,
    hash_password,
    verify_password,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)

security = HTTPBearer()


# =========================================================
# REGISTER
# =========================================================

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):

    email = data.email.strip().lower()

    existing_user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail=(
                "An account with this email "
                "already exists."
            ),
        )

    user = User(
        name=data.name.strip(),
        email=email,
        password_hash=hash_password(
            data.password
        ),
        is_active=True,
        role="user",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        user_id=user.id,
        email=user.email,
    )

    return AuthResponse(
        message="Registration successful.",
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
        ),
    )


# =========================================================
# LOGIN
# =========================================================

@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):

    email = data.email.strip().lower()

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="This account is inactive.",
        )

    token = create_access_token(
        user_id=user.id,
        email=user.email,
    )

    return AuthResponse(
        message="Login successful.",
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
        ),
    )


# =========================================================
# FORGOT PASSWORD
# =========================================================

@router.post(
    "/forgot-password"
)
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):

    email = data.email.strip().lower()

    user = db.scalar(
        select(User).where(
            User.email == email
        )
    )

    # -----------------------------------------------------
    # SECURITY:
    # Do not reveal whether email exists in production.
    # -----------------------------------------------------

    if not user:
        return {
            "message": (
                "If an account exists with this "
                "email, a password reset link "
                "has been generated."
            )
        }

    if not user.is_active:
        return {
            "message": (
                "If an account exists with this "
                "email, a password reset link "
                "has been generated."
            )
        }

    reset_token = create_password_reset_token(
        user_id=user.id,
        email=user.email,
    )

    # -----------------------------------------------------
    # DEVELOPMENT RESPONSE
    #
    # Later we will send this token through email.
    # -----------------------------------------------------

    return {
        "message": (
            "Password reset token generated."
        ),

        "reset_token": reset_token,

        "expires_in_minutes": 15,

        "development_only": True,
    }


# =========================================================
# RESET PASSWORD
# =========================================================

@router.post(
    "/reset-password"
)
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # DECODE RESET TOKEN
    # -----------------------------------------------------

    try:

        payload = decode_password_reset_token(
            data.token
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=400,
                detail="Invalid reset token.",
            )

        user_id = int(user_id)

    except (
        JWTError,
        ValueError,
        TypeError,
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid or expired "
                "password reset token."
            ),
        )


    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = db.get(
        User,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )


    # -----------------------------------------------------
    # ACCOUNT STATUS
    # -----------------------------------------------------

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="This account is inactive.",
        )


    # -----------------------------------------------------
    # UPDATE PASSWORD
    # -----------------------------------------------------

    user.password_hash = hash_password(
        data.new_password
    )

    db.commit()

    db.refresh(user)


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "message": (
            "Password reset successfully."
        ),

        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
    }


# =========================================================
# CURRENT USER
# =========================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db),
):

    token = credentials.credentials

    try:

        payload = decode_access_token(
            token
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid authentication token."
                ),
            )

        # Don't allow reset tokens here
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid authentication token."
                ),
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid or expired "
                "authentication token."
            ),
        )

    try:

        user_id = int(user_id)

    except (
        TypeError,
        ValueError,
    ):

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid authentication token."
            ),
        )

    user = db.get(
        User,
        user_id
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
    )