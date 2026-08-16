import os
from pathlib import Path

import pytest


# ============================================================
# TEST ENVIRONMENT
# ============================================================

TESTS_DIR = (
    Path(__file__)
    .resolve()
    .parent
)

TEST_DATABASE_PATH = (
    TESTS_DIR
    / "test_platform.db"
)


# Remove a leftover test database from an interrupted
# previous pytest run.
if TEST_DATABASE_PATH.exists():
    TEST_DATABASE_PATH.unlink()


# These variables MUST be configured before importing
# the application because app.config creates its settings
# object during import.
os.environ["DATABASE_URL"] = (
    "sqlite:///"
    + TEST_DATABASE_PATH.as_posix()
)

os.environ["JWT_SECRET_KEY"] = (
    "pytest-only-secret-key-"
    "palmistry-tarot-platform"
)

os.environ["APP_ENV"] = "testing"

os.environ["DEBUG"] = "false"

os.environ["ALLOWED_HOSTS"] = (
    "testserver,"
    "127.0.0.1,"
    "localhost"
)


# ============================================================
# APPLICATION IMPORTS
# ============================================================

from fastapi.testclient import TestClient  # noqa: E402

from app.core.database import (  # noqa: E402
    Base,
    SessionLocal,
    engine,
)

from app.core.security import (  # noqa: E402
    hash_password,
)

from app.main import app  # noqa: E402

from app.models.database_models import (  # noqa: E402
    User,
)


# ============================================================
# DATABASE RESET
# ============================================================

@pytest.fixture(
    autouse=True
)
def reset_test_database():

    """
    Every test starts with an empty,
    isolated SQLite database.

    This database is used only by pytest.
    """

    Base.metadata.drop_all(
        bind=engine
    )

    Base.metadata.create_all(
        bind=engine
    )

    yield

    Base.metadata.drop_all(
        bind=engine
    )


# ============================================================
# FASTAPI CLIENT
# ============================================================

@pytest.fixture
def client():

    with TestClient(
        app
    ) as test_client:

        yield test_client


# ============================================================
# CREATE DATABASE USER
# ============================================================

@pytest.fixture
def make_user():

    def _make_user(
        email: str,
        password: str = "TestUser123!",
        full_name: str = "Test User",
        role: str = "user",
        is_active: bool = True,
        age_group: str = "18-25",
    ):

        with SessionLocal() as database:

            user = User(
                email=(
                    email
                    .strip()
                    .lower()
                ),
                password_hash=(
                    hash_password(
                        password
                    )
                ),
                full_name=full_name,
                role=role,
                is_active=is_active,
                age_group=age_group,
            )

            database.add(
                user
            )

            database.commit()

            database.refresh(
                user
            )

            result = {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_active": user.is_active,
                "password": password,
            }

        return result

    return _make_user


# ============================================================
# LOGIN HELPER
# ============================================================

@pytest.fixture
def login_token(
    client,
):

    def _login_token(
        email: str,
        password: str,
    ) -> str:

        response = client.post(
            "/api/auth/login",
            json={
                "email": email,
                "password": password,
            },
        )

        assert (
            response.status_code
            == 200
        ), response.text

        return (
            response
            .json()[
                "access_token"
            ]
        )

    return _login_token


# ============================================================
# AUTHENTICATED USER HELPER
# ============================================================

@pytest.fixture
def authenticated_user(
    make_user,
    login_token,
):

    counter = {
        "value": 0
    }

    def _authenticated_user(
        role: str = "user",
        email: str | None = None,
        password: str = "TestUser123!",
        full_name: str = "Test User",
    ):

        counter[
            "value"
        ] += 1

        if email is None:

            email = (
                f"{role}"
                f"{counter['value']}"
                "@test.com"
            )

        user = make_user(
            email=email,
            password=password,
            full_name=full_name,
            role=role,
        )

        token = login_token(
            email=user["email"],
            password=password,
        )

        return {
            **user,
            "token": token,
            "headers": {
                "Authorization":
                    f"Bearer {token}"
            },
        }

    return _authenticated_user