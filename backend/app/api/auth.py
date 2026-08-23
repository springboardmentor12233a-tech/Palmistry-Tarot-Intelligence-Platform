from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.db.models import User
from app.db.session import get_db
from app.schemas.auth import (
    AuthResponse,
    AuthTokens,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
)
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _set_auth_cookies(response: Response, tokens: AuthTokens) -> None:
    """Sets secure httpOnly cookies for access and refresh tokens."""
    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=not settings.DEBUG,
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        samesite="lax",
        secure=not settings.DEBUG,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Registers a new user account and returns JWT tokens."""
    # Check if email exists
    query = select(User).where(User.email == payload.email)
    existing = (await db.execute(query)).scalars().first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # Hash password and create user
    hashed_pwd = get_password_hash(payload.password)
    new_user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hashed_pwd,
        role="user",
        age_group=payload.age_group,
        interests=payload.interests or [],
        spiritual_goals=payload.spiritual_goals or [],
        reading_preferences={
            "primary_focus": "General",
            "include_reversed_cards": True,
            "notification_frequency": "weekly",
        },
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Create tokens
    access_token = create_access_token(subject=new_user.id)
    refresh_token = create_refresh_token(subject=new_user.id)
    tokens = AuthTokens(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    _set_auth_cookies(response, tokens)

    return AuthResponse(
        user=UserResponse.model_validate(new_user),
        tokens=tokens,
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Authenticates user with email/password and returns JWT tokens."""
    query = select(User).where(User.email == payload.email)
    user = (await db.execute(query)).scalars().first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    tokens = AuthTokens(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    _set_auth_cookies(response, tokens)

    return AuthResponse(
        user=UserResponse.model_validate(user),
        tokens=tokens,
    )


@router.post("/refresh", response_model=dict)
async def refresh(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
    db: AsyncSession = Depends(get_db),
):
    """Refreshes the access token using a valid refresh token."""
    refresh_tok = None
    if body and body.refresh_token:
        refresh_tok = body.refresh_token
    else:
        refresh_tok = request.cookies.get("refresh_token")

    if not refresh_tok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing from request.",
        )

    payload = decode_token(refresh_tok)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    user_id = payload.get("sub")
    query = select(User).where(User.id == user_id)
    user = (await db.execute(query)).scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists.",
        )

    new_access_token = create_access_token(subject=user.id)
    new_refresh_token = create_refresh_token(subject=user.id)
    tokens = AuthTokens(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    _set_auth_cookies(response, tokens)

    return {"tokens": tokens.model_dump()}


@router.post("/logout", response_model=dict)
async def logout(response: Response):
    """Logs out the user and clears authentication cookies."""
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"success": True}
