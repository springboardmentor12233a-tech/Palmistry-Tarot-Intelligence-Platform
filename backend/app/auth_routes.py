from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from pydantic import BaseModel

from app.database import users_collection
from app.auth import hash_password, verify_password, create_access_token, get_current_user,create_reset_token, verify_reset_token
from app.models import UserSignup, UserLogin, TokenResponse
from app.email_utils import send_reset_email
router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
async def signup(user: UserSignup):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user_doc = {
        "name": user.name,
        "email": user.email,
        "hashed_password": hash_password(user.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    }
    await users_collection.insert_one(user_doc)

    token = create_access_token({"sub": user.email, "role": "user"})
    return TokenResponse(access_token=token, name=user.name, email=user.email, role="user")


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await users_collection.find_one({
        "email": credentials.email
    })

    # Generic message either way, so a caller can't use this endpoint
    # to check whether a given email is registered.
    invalid_credentials = HTTPException(
        status_code=401,
        detail="Incorrect email or password. Please try again."
    )

    if not user_doc:
        raise invalid_credentials

    if not verify_password(
        credentials.password,
        user_doc["hashed_password"]
    ):
        raise invalid_credentials

    role = user_doc.get("role", "user")

    token = create_access_token({
        "sub": user_doc["email"],
        "role": role
    })

    return TokenResponse(
        access_token=token,
        name=user_doc["name"],
        email=user_doc["email"],
        role=role
    )

class UpdateProfileRequest(BaseModel):
    name: str


@router.put("/profile")
async def update_profile(update: UpdateProfileRequest, current_user_email: str = Depends(get_current_user)):
    await users_collection.update_one(
        {"email": current_user_email},
        {"$set": {"name": update.name}}
    )
    return {"success": True, "name": update.name, "email": current_user_email}
class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user_doc = await users_collection.find_one({"email": request.email})

    if user_doc:
        reset_token = create_reset_token(request.email)
        send_reset_email(request.email, reset_token)

    return {"success": True, "message": "If that email is registered, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    email = verify_reset_token(request.token)
    if email is None:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    await users_collection.update_one(
        {"email": email},
        {"$set": {"hashed_password": hash_password(request.new_password)}}
    )

    return {"success": True, "message": "Password has been reset successfully."}