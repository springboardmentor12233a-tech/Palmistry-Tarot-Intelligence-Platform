import pytest

from app.auth import (
    UserRole,
    authenticate_user,
    create_access_token,
    decode_access_token,
    hash_password,
    register_user,
    verify_password,
)


def test_bcrypt_password_hashing():
    raw_pass = "mystic_secret_123"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert hashed.startswith(("$2b$", "$2a$"))
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("wrong_password", hashed) is False


def test_authenticate_demo_users():
    user = authenticate_user("user@gmail.com", "user123") or authenticate_user("user", "user123")
    assert user is not None
    assert user["role"] == UserRole.USER.value

    admin = authenticate_user("admin@gmail.com", "admin123") or authenticate_user("admin", "admin123")
    assert admin is not None
    assert admin["role"] == UserRole.ADMIN.value


def test_authenticate_invalid_credentials():
    assert authenticate_user("user@gmail.com", "wrongpassword") is None
    assert authenticate_user("nonexistent_user@gmail.com", "user123") is None


import uuid


def test_register_new_user():
    uid = uuid.uuid4().hex[:6]
    uname = f"new_user_{uid}"
    email = f"new_user_{uid}@gmail.com"
    new_user = register_user(uname, "secret123", role="user", full_name="New User Test", email=email)
    assert new_user["username"] == uname
    assert new_user["role"] == "user"
    assert new_user["email"] == email

    auth_res = authenticate_user(email, "secret123")
    assert auth_res is not None
    assert auth_res["full_name"] == "New User Test"


def test_register_invalid_email_domain():
    with pytest.raises(ValueError, match="Please use a valid @gmail.com email address."):
        register_user("invalid_email", "secret123", email="user@yahoo.com")


def test_register_duplicate_username_or_email():
    with pytest.raises(ValueError, match="already exists|already taken"):
        register_user("admin", "pass123", email="admin@gmail.com")


def test_jwt_token_encode_decode():
    payload = {"sub": "admin@gmail.com", "role": UserRole.ADMIN.value}
    token = create_access_token(payload)
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "admin@gmail.com"
    assert decoded["role"] == UserRole.ADMIN.value
