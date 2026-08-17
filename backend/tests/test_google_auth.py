from app.config import (
    settings,
)

from app.core.database import (
    SessionLocal,
)

from app.models.database_models import (
    User,
)

from app.services import (
    auth_service,
)


TEST_GOOGLE_CLIENT_ID = (
    "pytest-google-client"
    ".apps.googleusercontent.com"
)


# ============================================================
# TEST HELPERS
# ============================================================

def configure_google_payload(
    monkeypatch,
    payload: dict,
) -> None:

    monkeypatch.setattr(
        settings,
        "GOOGLE_CLIENT_ID",
        TEST_GOOGLE_CLIENT_ID,
    )


    def fake_verify(
        credential,
        request,
        audience,
    ):

        assert credential

        assert (
            audience
            == TEST_GOOGLE_CLIENT_ID
        )

        return payload


    monkeypatch.setattr(
        auth_service
        .google_id_token,
        "verify_oauth2_token",
        fake_verify,
    )


def valid_google_payload(
    *,
    subject: str = (
        "google-subject-123"
    ),
    email: str = (
        "googleuser@test.com"
    ),
    name: str = (
        "Google Test User"
    ),
) -> dict:

    return {
        "iss":
            "https://accounts.google.com",

        "sub":
            subject,

        "email":
            email,

        "email_verified":
            True,

        "name":
            name,
    }


# ============================================================
# GOOGLE CONFIGURATION
# ============================================================

def test_google_login_requires_configuration(
    client,
    monkeypatch,
):

    monkeypatch.setattr(
        settings,
        "GOOGLE_CLIENT_ID",
        "",
    )


    response = client.post(
        "/api/auth/google",

        json={
            "credential":
                "x" * 40,
        },
    )


    assert (
        response.status_code
        == 503
    )


# ============================================================
# INVALID GOOGLE TOKEN
# ============================================================

def test_google_login_rejects_invalid_token(
    client,
    monkeypatch,
):

    monkeypatch.setattr(
        settings,
        "GOOGLE_CLIENT_ID",
        TEST_GOOGLE_CLIENT_ID,
    )


    def invalid_verify(
        credential,
        request,
        audience,
    ):

        raise ValueError(
            "Invalid token"
        )


    monkeypatch.setattr(
        auth_service
        .google_id_token,
        "verify_oauth2_token",
        invalid_verify,
    )


    response = client.post(
        "/api/auth/google",

        json={
            "credential":
                "x" * 40,
        },
    )


    assert (
        response.status_code
        == 401
    )


# ============================================================
# INVALID ISSUER
# ============================================================

def test_google_login_rejects_invalid_issuer(
    client,
    monkeypatch,
):

    payload = (
        valid_google_payload()
    )

    payload["iss"] = (
        "https://example.com"
    )


    configure_google_payload(
        monkeypatch,
        payload,
    )


    response = client.post(
        "/api/auth/google",

        json={
            "credential":
                "x" * 40,
        },
    )


    assert (
        response.status_code
        == 401
    )


# ============================================================
# UNVERIFIED EMAIL
# ============================================================

def test_google_login_requires_verified_email(
    client,
    monkeypatch,
):

    payload = (
        valid_google_payload()
    )

    payload[
        "email_verified"
    ] = False


    configure_google_payload(
        monkeypatch,
        payload,
    )


    response = client.post(
        "/api/auth/google",

        json={
            "credential":
                "x" * 40,
        },
    )


    assert (
        response.status_code
        == 401
    )


# ============================================================
# NEW GOOGLE USER
# ============================================================

def test_google_login_creates_user(
    client,
    monkeypatch,
):

    payload = (
        valid_google_payload()
    )


    configure_google_payload(
        monkeypatch,
        payload,
    )


    response = client.post(
        "/api/auth/google",

        json={
            "credential":
                "x" * 40,
        },
    )


    assert (
        response.status_code
        == 200
    )


    data = (
        response.json()
    )


    assert (
        data[
            "token_type"
        ]
        == "bearer"
    )


    assert (
        data[
            "user"
        ][
            "email"
        ]
        == "googleuser@test.com"
    )


    assert (
        data[
            "user"
        ][
            "role"
        ]
        == "user"
    )


    access_token = (
        data[
            "access_token"
        ]
    )


    me_response = client.get(
        "/api/auth/me",

        headers={
            "Authorization":
                (
                    "Bearer "
                    f"{access_token}"
                )
        },
    )


    assert (
        me_response.status_code
        == 200
    )


    with SessionLocal() as database:

        user = (
            auth_service
            .get_user_by_email(
                database,
                "googleuser@test.com",
            )
        )


        assert (
            user
            is not None
        )


        assert (
            user.oauth_provider
            == "google"
        )


        assert (
            user.oauth_subject
            == "google-subject-123"
        )


# ============================================================
# RETURNING GOOGLE USER
# ============================================================

def test_google_login_returns_existing_linked_user(
    client,
    monkeypatch,
):

    payload = (
        valid_google_payload()
    )


    configure_google_payload(
        monkeypatch,
        payload,
    )


    first_response = (
        client.post(
            "/api/auth/google",

            json={
                "credential":
                    "x" * 40,
            },
        )
    )


    assert (
        first_response.status_code
        == 200
    )


    first_user_id = (
        first_response
        .json()[
            "user"
        ][
            "id"
        ]
    )


    second_response = (
        client.post(
            "/api/auth/google",

            json={
                "credential":
                    "y" * 40,
            },
        )
    )


    assert (
        second_response.status_code
        == 200
    )


    second_user_id = (
        second_response
        .json()[
            "user"
        ][
            "id"
        ]
    )


    assert (
        second_user_id
        == first_user_id
    )


# ============================================================
# EXISTING PASSWORD ACCOUNT
# ============================================================

def test_google_login_does_not_auto_link_existing_email(
    client,
    monkeypatch,
    make_user,
):

    make_user(
        email=(
            "googleuser@test.com"
        ),
    )


    payload = (
        valid_google_payload()
    )


    configure_google_payload(
        monkeypatch,
        payload,
    )


    response = client.post(
        "/api/auth/google",

        json={
            "credential":
                "x" * 40,
        },
    )


    assert (
        response.status_code
        == 409
    )


# ============================================================
# DISABLED GOOGLE ACCOUNT
# ============================================================

def test_google_login_rejects_disabled_linked_user(
    client,
    monkeypatch,
    make_user,
):

    account = make_user(
        email=(
            "googleuser@test.com"
        ),
        is_active=False,
    )


    with SessionLocal() as database:

        user = database.get(
            User,
            account[
                "id"
            ],
        )

        user.oauth_provider = (
            "google"
        )

        user.oauth_subject = (
            "google-subject-123"
        )

        database.add(
            user
        )

        database.commit()


    payload = (
        valid_google_payload()
    )


    configure_google_payload(
        monkeypatch,
        payload,
    )


    response = client.post(
        "/api/auth/google",

        json={
            "credential":
                "x" * 40,
        },
    )


    assert (
        response.status_code
        == 403
    )