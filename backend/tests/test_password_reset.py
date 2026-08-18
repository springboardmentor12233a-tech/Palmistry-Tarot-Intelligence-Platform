from datetime import (
    timedelta,
)

from urllib.parse import (
    parse_qs,
    urlparse,
)

from app.core.database import (
    SessionLocal,
)

from app.models.database_models import (
    User,
)

from app.models.password_reset_models import (
    PasswordResetToken,
)

from app.services import (
    password_reset_service,
)


# ============================================================
# EMAIL CAPTURE HELPER
# ============================================================

def install_email_capture(
    monkeypatch,
):

    sent = []


    def fake_send_password_reset_email(
        *,
        recipient_email,
        recipient_name,
        reset_url,
        expires_minutes,
    ):

        sent.append({
            "recipient_email":
                recipient_email,

            "recipient_name":
                recipient_name,

            "reset_url":
                reset_url,

            "expires_minutes":
                expires_minutes,
        })


    monkeypatch.setattr(
        password_reset_service,
        "send_password_reset_email",
        fake_send_password_reset_email,
    )


    return sent


def extract_token(
    reset_url: str,
) -> str:

    parsed = urlparse(
        reset_url
    )


    query = parse_qs(
        parsed.query
    )


    return query[
        "token"
    ][0]


# ============================================================
# UNKNOWN EMAIL
# ============================================================

def test_forgot_password_unknown_email_is_generic(
    client,
    monkeypatch,
):

    sent = install_email_capture(
        monkeypatch
    )


    response = client.post(
        "/api/auth/forgot-password",

        json={
            "email":
                "unknown@test.com",
        },
    )


    assert (
        response.status_code
        == 200
    )


    assert (
        len(sent)
        == 0
    )


# ============================================================
# VALID USER
# ============================================================

def test_forgot_password_sends_reset_email(
    client,
    monkeypatch,
    make_user,
):

    make_user(
        email=(
            "resetuser@test.com"
        ),
    )


    sent = install_email_capture(
        monkeypatch
    )


    response = client.post(
        "/api/auth/forgot-password",

        json={
            "email":
                "resetuser@test.com",
        },
    )


    assert (
        response.status_code
        == 200
    )


    assert (
        len(sent)
        == 1
    )


    assert (
        sent[0][
            "recipient_email"
        ]
        == "resetuser@test.com"
    )


# ============================================================
# GOOGLE ACCOUNT
# ============================================================

def test_google_account_does_not_receive_password_reset(
    client,
    monkeypatch,
    make_user,
):

    account = make_user(
        email=(
            "google-reset@test.com"
        ),
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
            "google-reset-subject"
        )


        database.add(
            user
        )

        database.commit()


    sent = install_email_capture(
        monkeypatch
    )


    response = client.post(
        "/api/auth/forgot-password",

        json={
            "email":
                "google-reset@test.com",
        },
    )


    assert (
        response.status_code
        == 200
    )


    assert (
        len(sent)
        == 0
    )


# ============================================================
# DISABLED ACCOUNT
# ============================================================

def test_disabled_account_does_not_receive_reset(
    client,
    monkeypatch,
    make_user,
):

    make_user(
        email=(
            "disabled-reset@test.com"
        ),
        is_active=False,
    )


    sent = install_email_capture(
        monkeypatch
    )


    response = client.post(
        "/api/auth/forgot-password",

        json={
            "email":
                "disabled-reset@test.com",
        },
    )


    assert (
        response.status_code
        == 200
    )


    assert (
        len(sent)
        == 0
    )


# ============================================================
# VALID PASSWORD RESET
# ============================================================

def test_valid_password_reset_changes_password(
    client,
    monkeypatch,
    make_user,
):

    make_user(
        email=(
            "change@test.com"
        ),
        password=(
            "OldPassword123!"
        ),
    )


    sent = install_email_capture(
        monkeypatch
    )


    forgot_response = client.post(
        "/api/auth/forgot-password",

        json={
            "email":
                "change@test.com",
        },
    )


    assert (
        forgot_response.status_code
        == 200
    )


    token = extract_token(
        sent[0][
            "reset_url"
        ]
    )


    reset_response = client.post(
        "/api/auth/reset-password",

        json={
            "token":
                token,

            "new_password":
                "NewPassword123!",
        },
    )


    assert (
        reset_response.status_code
        == 200
    )


    old_login = client.post(
        "/api/auth/login",

        json={
            "email":
                "change@test.com",

            "password":
                "OldPassword123!",
        },
    )


    assert (
        old_login.status_code
        == 401
    )


    new_login = client.post(
        "/api/auth/login",

        json={
            "email":
                "change@test.com",

            "password":
                "NewPassword123!",
        },
    )


    assert (
        new_login.status_code
        == 200
    )


# ============================================================
# ONE-TIME TOKEN
# ============================================================

def test_reset_token_can_only_be_used_once(
    client,
    monkeypatch,
    make_user,
):

    make_user(
        email=(
            "once@test.com"
        ),
    )


    sent = install_email_capture(
        monkeypatch
    )


    client.post(
        "/api/auth/forgot-password",

        json={
            "email":
                "once@test.com",
        },
    )


    token = extract_token(
        sent[0][
            "reset_url"
        ]
    )


    first_response = client.post(
        "/api/auth/reset-password",

        json={
            "token":
                token,

            "new_password":
                "FirstNew123!",
        },
    )


    assert (
        first_response.status_code
        == 200
    )


    second_response = client.post(
        "/api/auth/reset-password",

        json={
            "token":
                token,

            "new_password":
                "SecondNew123!",
        },
    )


    assert (
        second_response.status_code
        == 400
    )


# ============================================================
# INVALID TOKEN
# ============================================================

def test_invalid_reset_token_is_rejected(
    client,
):

    response = client.post(
        "/api/auth/reset-password",

        json={
            "token":
                (
                    "invalid-token-value-"
                    "that-is-long-enough"
                ),

            "new_password":
                "NewPassword123!",
        },
    )


    assert (
        response.status_code
        == 400
    )


# ============================================================
# EXPIRED TOKEN
# ============================================================

def test_expired_reset_token_is_rejected(
    client,
    monkeypatch,
    make_user,
):

    make_user(
        email=(
            "expired@test.com"
        ),
    )


    sent = install_email_capture(
        monkeypatch
    )


    client.post(
        "/api/auth/forgot-password",

        json={
            "email":
                "expired@test.com",
        },
    )


    token = extract_token(
        sent[0][
            "reset_url"
        ]
    )


    with SessionLocal() as database:

        reset_record = (
            database.query(
                PasswordResetToken
            )
            .first()
        )


        reset_record.expires_at = (
            password_reset_service
            .utc_now()
            - timedelta(
                minutes=1
            )
        )


        database.add(
            reset_record
        )

        database.commit()


    response = client.post(
        "/api/auth/reset-password",

        json={
            "token":
                token,

            "new_password":
                "NewPassword123!",
        },
    )


    assert (
        response.status_code
        == 400
    )


# ============================================================
# SAME PASSWORD
# ============================================================

def test_reset_rejects_current_password(
    client,
    monkeypatch,
    make_user,
):

    make_user(
        email=(
            "same@test.com"
        ),
        password=(
            "SamePassword123!"
        ),
    )


    sent = install_email_capture(
        monkeypatch
    )


    client.post(
        "/api/auth/forgot-password",

        json={
            "email":
                "same@test.com",
        },
    )


    token = extract_token(
        sent[0][
            "reset_url"
        ]
    )


    response = client.post(
        "/api/auth/reset-password",

        json={
            "token":
                token,

            "new_password":
                "SamePassword123!",
        },
    )


    assert (
        response.status_code
        == 400
    )