from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)


UserRole = Literal[
    "user",
    "tarot_reader",
    "spiritual_consultant",
    "administrator",
]


# ============================================================
# REGISTRATION
# ============================================================

class UserRegister(
    BaseModel
):

    model_config = ConfigDict(
        extra="forbid"
    )

    full_name: str = Field(
        min_length=2,
        max_length=120,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    age_group: str | None = Field(
        default=None,
        max_length=40,
    )

    interests: str | None = Field(
        default=None,
        max_length=1000,
    )

    spiritual_goal: str | None = Field(
        default=None,
        max_length=1500,
    )

    reading_preference: (
        str | None
    ) = Field(
        default=None,
        max_length=80,
    )


# ============================================================
# PASSWORD LOGIN
# ============================================================

class LoginRequest(
    BaseModel
):

    model_config = ConfigDict(
        extra="forbid"
    )

    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=128,
    )


# ============================================================
# GOOGLE LOGIN
# ============================================================

class GoogleLoginRequest(
    BaseModel
):

    model_config = ConfigDict(
        extra="forbid"
    )

    credential: str = Field(
        min_length=20,
        max_length=10000,
    )


# ============================================================
# PROFILE
# ============================================================

class ProfileUpdate(
    BaseModel
):

    model_config = ConfigDict(
        extra="forbid"
    )

    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=120,
    )

    age_group: str | None = Field(
        default=None,
        max_length=40,
    )

    interests: str | None = Field(
        default=None,
        max_length=1000,
    )

    spiritual_goal: str | None = Field(
        default=None,
        max_length=1500,
    )

    reading_preference: (
        str | None
    ) = Field(
        default=None,
        max_length=80,
    )


# ============================================================
# ACCOUNT DELETION
# ============================================================

class AccountDeleteRequest(
    BaseModel
):

    model_config = ConfigDict(
        extra="forbid"
    )

    confirmation: Literal[
        "DELETE"
    ]


# ============================================================
# ADMIN REQUESTS
# ============================================================

class RoleUpdateRequest(
    BaseModel
):

    model_config = ConfigDict(
        extra="forbid"
    )

    role: UserRole


class UserStatusUpdate(
    BaseModel
):

    model_config = ConfigDict(
        extra="forbid"
    )

    is_active: bool


# ============================================================
# USER RESPONSE
# ============================================================

class UserResponse(
    BaseModel
):

    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool

    age_group: str | None
    interests: str | None
    spiritual_goal: str | None
    reading_preference: str | None

    created_at: datetime
    updated_at: datetime


# ============================================================
# TOKEN RESPONSE
# ============================================================

class TokenResponse(
    BaseModel
):

    access_token: str

    token_type: str = (
        "bearer"
    )

    expires_in: int

    user: UserResponse


# ============================================================
# ADMIN RESPONSES
# ============================================================

class AdminOverviewResponse(
    BaseModel
):

    total_users: int
    active_users: int
    inactive_users: int
    roles: dict[str, int]


class MessageResponse(
    BaseModel
):

    status: str
    message: str