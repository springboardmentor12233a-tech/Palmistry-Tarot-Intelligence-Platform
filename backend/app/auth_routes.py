from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from app.database import users_collection
from app.auth import hash_password, verify_password, create_access_token
from app.models import UserSignup, UserLogin, TokenResponse
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
        "created_at": datetime.now(timezone.utc)
    }
    await users_collection.insert_one(user_doc)

    token = create_access_token({"sub": user.email})
    return TokenResponse(access_token=token, name=user.name, email=user.email)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user_doc = await users_collection.find_one({"email": credentials.email})
    if not user_doc or not verify_password(credentials.password, user_doc["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token({"sub": user_doc["email"]})
    return TokenResponse(access_token=token, name=user_doc["name"], email=user_doc["email"])