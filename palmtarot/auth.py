import base64
import hashlib
import hmac
import json
import logging
import time
from enum import Enum
from typing import Any

import bcrypt

from palmtarot.db import UserModel, db_manager

logger = logging.getLogger(__name__)

# JWT Secret & Expiration
SECRET_KEY = "palmtarot-capstone-secret-key-super-secure"
TOKEN_EXPIRE_SECONDS = 3600 * 24  # 24 hours


class UserRole(str, Enum):
    USER = "user"
    TAROT_READER = "tarot_reader"
    SPIRITUAL_CONSULTANT = "spiritual_consultant"
    ADMIN = "admin"


ROLE_LABELS = {
    UserRole.USER: "Standard User / Client",
    UserRole.TAROT_READER: "Tarot Reader Practitioner",
    UserRole.SPIRITUAL_CONSULTANT: "Spiritual & Palmistry Consultant",
    UserRole.ADMIN: "System Administrator"
}


def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    pw_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Verify raw password against stored bcrypt hash (with sha256 fallback)."""
    if not hashed:
        return False
    try:
        # Check bcrypt hash format
        if hashed.startswith(("$2b$", "$2a$", "$2y$")):
            return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception as e:
        logger.warning(f"Bcrypt verification failed: {e}")

    # Fallback check for standard sha256 legacy hash
    salt = "palmtarot_salt_2026"
    legacy_hash = hashlib.sha256((password + salt).encode("utf-8")).hexdigest()
    return legacy_hash == hashed


# Pure Python Standard Library JWT Implementation
def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _b64_decode(data: str) -> bytes:
    padding = "=" * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(data: dict[str, Any], expires_delta: int | None = None) -> str:
    """Generate HS256 JWT access token."""
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _b64_encode(json.dumps(header).encode("utf-8"))

    payload = data.copy()
    expire = time.time() + (expires_delta or TOKEN_EXPIRE_SECONDS)
    payload.update({"exp": expire})
    payload_b64 = _b64_encode(json.dumps(payload).encode("utf-8"))

    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64_encode(signature)

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Decode and validate HS256 JWT access token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts

        signing_input = f"{header_b64}.{payload_b64}".encode()
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        if _b64_encode(expected_sig) != sig_b64:
            return None

        payload_json = _b64_decode(payload_b64).decode("utf-8")
        payload = json.loads(payload_json)
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception as e:
        logger.warning(f"Token decoding error: {e}")
        return None


# Pre-seed demo users in DB if not present
def _seed_default_users():
    default_accounts = [
        {"username": "user", "email": "user@gmail.com", "pass": "user123", "role": UserRole.USER.value, "name": "Alex Smith"},
        {"username": "reader", "email": "reader@gmail.com", "pass": "reader123", "role": UserRole.TAROT_READER.value, "name": "Seraphina Vance"},
        {"username": "consultant", "email": "consultant@gmail.com", "pass": "consultant123", "role": UserRole.SPIRITUAL_CONSULTANT.value, "name": "Dr. Orion Astra"},
        {"username": "admin", "email": "admin@gmail.com", "pass": "admin123", "role": UserRole.ADMIN.value, "name": "Admin Director"}
    ]
    for acc in default_accounts:
        existing = db_manager.get_user_by_username(acc["username"]) or db_manager.get_user_by_email(acc["email"])
        if not existing:
            u_model = UserModel(
                email=acc["email"],
                username=acc["username"],
                password_hash=hash_password(acc["pass"]),
                full_name=acc["name"],
                role=acc["role"],
                is_active=True
            )
            db_manager.save_user(u_model)
        else:
            if existing.email != acc["email"]:
                db_manager.update_user(existing.id, {"email": acc["email"]})


_seed_default_users()

USERS_DB: dict[str, dict[str, Any]] = {}
for user_obj in db_manager.get_all_users():
    USERS_DB[user_obj.username] = {
        "id": user_obj.id,
        "username": user_obj.username,
        "password_hash": user_obj.password_hash,
        "role": user_obj.role,
        "full_name": user_obj.full_name,
        "email": user_obj.email,
        "is_active": user_obj.is_active,
        "created_at": user_obj.created_at
    }


def authenticate_user(login_identifier: str, password: str) -> dict[str, Any] | None:
    """Authenticate email or username against database."""
    identifier_clean = login_identifier.lower().strip()
    user = db_manager.get_user_by_email(identifier_clean) or db_manager.get_user_by_username(identifier_clean)

    if not user:
        # Check USERS_DB dict fallback
        fallback = USERS_DB.get(identifier_clean)
        if fallback and verify_password(password, fallback["password_hash"]):
            return fallback
        return None

    if not user.is_active:
        logger.warning(f"User account '{user.email}' is inactive.")
        return None

    if not verify_password(password, user.password_hash):
        return None

    return {
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email,
        "created_at": user.created_at,
        "is_active": user.is_active
    }


def register_user(username: str, password: str, role: str = UserRole.USER.value, full_name: str = "", email: str = "") -> dict[str, Any]:
    """Register a new user with bcrypt password hashing and strictly @gmail.com email domain."""
    email_clean = (email or f"{username}@gmail.com").lower().strip()
    username_clean = (username or email_clean.split("@")[0]).lower().strip()

    if not email_clean.endswith("@gmail.com"):
        raise ValueError("Please use a valid @gmail.com email address.")

    if db_manager.get_user_by_email(email_clean):
        raise ValueError(f"An account with email '{email_clean}' already exists.")
    if db_manager.get_user_by_username(username_clean):
        raise ValueError(f"Username '{username_clean}' is already taken.")

    if role not in [r.value for r in UserRole]:
        role = UserRole.USER.value

    user_model = UserModel(
        email=email_clean,
        username=username_clean,
        password_hash=hash_password(password),
        full_name=full_name or username_clean.capitalize(),
        role=role,
        is_active=True
    )
    saved_user = db_manager.save_user(user_model)

    user_dict = {
        "id": saved_user.id,
        "username": saved_user.username,
        "role": saved_user.role,
        "full_name": saved_user.full_name,
        "email": saved_user.email,
        "created_at": saved_user.created_at,
        "is_active": saved_user.is_active
    }
    USERS_DB[username_clean] = user_dict
    return user_dict

