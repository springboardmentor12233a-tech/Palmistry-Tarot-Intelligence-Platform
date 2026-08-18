from pydantic import BaseModel, Field


# =========================================================
# REGISTER
# =========================================================

class RegisterRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: str = Field(
        min_length=5,
        max_length=255
    )

    password: str = Field(
        min_length=6,
        max_length=100
    )


# =========================================================
# LOGIN
# =========================================================

class LoginRequest(BaseModel):
    email: str = Field(
        min_length=5,
        max_length=255
    )

    password: str = Field(
        min_length=6,
        max_length=100
    )


# =========================================================
# FORGOT PASSWORD
# =========================================================

class ForgotPasswordRequest(BaseModel):
    email: str = Field(
        min_length=5,
        max_length=255
    )


# =========================================================
# RESET PASSWORD
# =========================================================

class ResetPasswordRequest(BaseModel):
    token: str = Field(
        min_length=20
    )

    new_password: str = Field(
        min_length=6,
        max_length=100
    )


# =========================================================
# USER RESPONSE
# =========================================================

class UserResponse(BaseModel):
    id: int

    name: str

    email: str

    role: str

    is_active: bool


# =========================================================
# AUTH RESPONSE
# =========================================================

class AuthResponse(BaseModel):
    message: str

    access_token: str

    token_type: str

    user: UserResponse