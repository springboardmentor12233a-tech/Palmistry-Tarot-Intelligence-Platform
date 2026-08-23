from typing import List, Optional
from pydantic import BaseModel, EmailStr
from app.schemas.user import UserResponse


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    age_group: Optional[str] = None
    interests: Optional[List[str]] = []
    spiritual_goals: Optional[List[str]] = []


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = 3600


class AuthResponse(BaseModel):
    user: UserResponse
    tokens: AuthTokens
