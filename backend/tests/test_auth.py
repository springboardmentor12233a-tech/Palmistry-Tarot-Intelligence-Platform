from app.core.database import (
    SessionLocal,
)

from app.models.database_models import (
    User,
)


# ============================================================
# REGISTRATION
# ============================================================

def test_register_user(
    client,
):

    response = client.post(
        "/api/auth/register",
        json={
            "full_name":
                "Authentication Test",

            "email":
                "auth@test.com",

            "password":
                "AuthTest123!",

            "age_group":
                "18-25",
        },
    )

    assert (
        response.status_code
        == 201
    )

    data = response.json()

    assert (
        data["token_type"]
        == "bearer"
    )

    assert (
        data["access_token"]
    )

    assert (
        data["user"]["email"]
        == "auth@test.com"
    )

    assert (
        data["user"]["role"]
        == "user"
    )

    assert (
        data["user"]["is_active"]
        is True
    )


# ============================================================
# DUPLICATE EMAIL
# ============================================================

def test_duplicate_registration_rejected(
    client,
):

    payload = {
        "full_name":
            "Duplicate User",

        "email":
            "duplicate@test.com",

        "password":
            "Duplicate123!",

        "age_group":
            "18-25",
    }

    first_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert (
        first_response.status_code
        == 201
    )

    second_response = client.post(
        "/api/auth/register",
        json=payload,
    )

    assert (
        second_response.status_code
        == 409
    )


# ============================================================
# PUBLIC ROLE SELECTION BLOCKED
# ============================================================

def test_public_registration_cannot_set_role(
    client,
):

    response = client.post(
        "/api/auth/register",
        json={
            "full_name":
                "Fake Administrator",

            "email":
                "fakeadmin@test.com",

            "password":
                "FakeAdmin123!",

            "age_group":
                "18-25",

            "role":
                "administrator",
        },
    )

    assert (
        response.status_code
        == 422
    )


# ============================================================
# VALID LOGIN
# ============================================================

def test_login_user(
    client,
):

    register_response = (
        client.post(
            "/api/auth/register",
            json={
                "full_name":
                    "Login User",

                "email":
                    "login@test.com",

                "password":
                    "LoginTest123!",

                "age_group":
                    "18-25",
            },
        )
    )

    assert (
        register_response.status_code
        == 201
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email":
                "login@test.com",

            "password":
                "LoginTest123!",
        },
    )

    assert (
        login_response.status_code
        == 200
    )

    data = login_response.json()

    assert (
        data["access_token"]
    )

    assert (
        data["user"]["email"]
        == "login@test.com"
    )


# ============================================================
# INVALID PASSWORD
# ============================================================

def test_wrong_password_rejected(
    client,
    make_user,
):

    make_user(
        email="wrongpass@test.com",
        password="Correct123!",
    )

    response = client.post(
        "/api/auth/login",
        json={
            "email":
                "wrongpass@test.com",

            "password":
                "WrongPassword123!",
        },
    )

    assert (
        response.status_code
        == 401
    )


# ============================================================
# PROTECTED /ME WITHOUT TOKEN
# ============================================================

def test_me_requires_authentication(
    client,
):

    response = client.get(
        "/api/auth/me"
    )

    assert (
        response.status_code
        == 401
    )


# ============================================================
# CURRENT USER
# ============================================================

def test_get_current_user(
    client,
    authenticated_user,
):

    account = (
        authenticated_user(
            role="user",
            email="current@test.com",
        )
    )

    response = client.get(
        "/api/auth/me",
        headers=(
            account[
                "headers"
            ]
        ),
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data["email"]
        == "current@test.com"
    )

    assert (
        data["role"]
        == "user"
    )


# ============================================================
# PROFILE UPDATE
# ============================================================

def test_update_profile(
    client,
    authenticated_user,
):

    account = (
        authenticated_user(
            email="profile@test.com"
        )
    )

    response = client.patch(
        "/api/auth/profile",

        headers=(
            account[
                "headers"
            ]
        ),

        json={
            "full_name":
                "Updated Test User",

            "age_group":
                "18-25",

            "interests":
                "Career, Education",

            "spiritual_goal":
                "Improve focus",

            "reading_preference":
                "Detailed",
        },
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data["full_name"]
        == "Updated Test User"
    )

    assert (
        data["interests"]
        == "Career, Education"
    )

    assert (
        data["spiritual_goal"]
        == "Improve focus"
    )

    assert (
        data["reading_preference"]
        == "Detailed"
    )


# ============================================================
# DISABLED ACCOUNT
# ============================================================

def test_disabled_user_token_is_rejected(
    client,
    authenticated_user,
):

    account = (
        authenticated_user(
            email="disabled@test.com"
        )
    )

    with SessionLocal() as database:

        user = database.get(
            User,
            account["id"],
        )

        user.is_active = False

        database.commit()

    response = client.get(
        "/api/auth/me",

        headers=(
            account[
                "headers"
            ]
        ),
    )

    assert (
        response.status_code
        == 403
    )