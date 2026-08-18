import io

from types import (
    SimpleNamespace,
)

from app.routes import (
    report_routes,
)

from app.services.email_service import (
    EmailDeliveryError,
)


# ============================================================
# FAKE SESSION
# ============================================================

def create_fake_session(
    user_id: int,
):

    return SimpleNamespace(

        id=77,

        user_id=user_id,

        title=(
            "Career: Test Reading"
        ),

        user_profile={},

        reading_context={},

        palm_analysis={},

        tarot_analysis={},

        initial_reading={},

        scores={},
    )


# ============================================================
# AUTHENTICATION REQUIRED
# ============================================================

def test_email_reading_requires_authentication(
    client,
):

    response = client.post(
        "/api/reports/reading/77/email"
    )


    assert (
        response.status_code
        == 401
    )


# ============================================================
# USER CANNOT ACCESS OTHER SESSION
# ============================================================

def test_email_reading_rejects_unowned_session(
    client,
    authenticated_user,
    monkeypatch,
):

    user = authenticated_user()


    def fake_get_session(
        *,
        db,
        user_id,
        session_id,
    ):

        return None


    monkeypatch.setattr(
        report_routes,
        "get_user_reading_session",
        fake_get_session,
    )


    response = client.post(
        "/api/reports/reading/999/email",

        headers=(
            user["headers"]
        ),
    )


    assert (
        response.status_code
        == 404
    )


# ============================================================
# SUCCESSFUL PDF EMAIL
# ============================================================

def test_email_reading_sends_pdf_to_current_user(
    client,
    authenticated_user,
    monkeypatch,
):

    user = authenticated_user(
        email=(
            "reading-email@test.com"
        ),
        full_name=(
            "Reading Email User"
        ),
    )


    fake_session = (
        create_fake_session(
            user_id=user["id"]
        )
    )


    def fake_get_session(
        *,
        db,
        user_id,
        session_id,
    ):

        assert (
            user_id
            == user["id"]
        )

        assert (
            session_id
            == 77
        )

        return fake_session


    monkeypatch.setattr(
        report_routes,
        "get_user_reading_session",
        fake_get_session,
    )


    monkeypatch.setattr(
        report_routes,
        "build_saved_reading_pdf_request",
        lambda session: (
            "fake-pdf-request"
        ),
    )


    monkeypatch.setattr(
        report_routes,
        "build_reading_pdf",
        lambda request: (
            io.BytesIO(
                b"%PDF-test-content"
            ),
            "test_reading.pdf",
        ),
    )


    sent = {}


    def fake_send_reading_pdf_email(
        *,
        recipient_email,
        recipient_name,
        reading_title,
        pdf_bytes,
        filename,
    ):

        sent[
            "recipient_email"
        ] = recipient_email

        sent[
            "recipient_name"
        ] = recipient_name

        sent[
            "reading_title"
        ] = reading_title

        sent[
            "pdf_bytes"
        ] = pdf_bytes

        sent[
            "filename"
        ] = filename


    monkeypatch.setattr(
        report_routes,
        "send_reading_pdf_email",
        fake_send_reading_pdf_email,
    )


    response = client.post(
        "/api/reports/reading/77/email",

        headers=(
            user["headers"]
        ),
    )


    assert (
        response.status_code
        == 200
    )


    data = response.json()


    assert (
        data["status"]
        == "success"
    )


    assert (
        sent[
            "recipient_email"
        ]
        == "reading-email@test.com"
    )


    assert (
        sent[
            "recipient_name"
        ]
        == "Reading Email User"
    )


    assert (
        sent[
            "reading_title"
        ]
        == "Career: Test Reading"
    )


    assert (
        sent[
            "filename"
        ]
        == "test_reading.pdf"
    )


    assert (
        sent[
            "pdf_bytes"
        ]
        == b"%PDF-test-content"
    )


# ============================================================
# EMAIL PROVIDER FAILURE
# ============================================================

def test_email_reading_handles_delivery_failure(
    client,
    authenticated_user,
    monkeypatch,
):

    user = authenticated_user(
        email=(
            "delivery-failure@test.com"
        ),
    )


    fake_session = (
        create_fake_session(
            user_id=user["id"]
        )
    )


    monkeypatch.setattr(
        report_routes,
        "get_user_reading_session",
        lambda **kwargs: (
            fake_session
        ),
    )


    monkeypatch.setattr(
        report_routes,
        "build_saved_reading_pdf_request",
        lambda session: (
            "fake-pdf-request"
        ),
    )


    monkeypatch.setattr(
        report_routes,
        "build_reading_pdf",
        lambda request: (
            io.BytesIO(
                b"%PDF-test-content"
            ),
            "test_reading.pdf",
        ),
    )


    def fail_email(
        **kwargs,
    ):

        raise EmailDeliveryError(
            "Delivery failed."
        )


    monkeypatch.setattr(
        report_routes,
        "send_reading_pdf_email",
        fail_email,
    )


    response = client.post(
        "/api/reports/reading/77/email",

        headers=(
            user["headers"]
        ),
    )


    assert (
        response.status_code
        == 502
    )


    response_data = (
        response.json()
    )


    error_message = (
        response_data.get(
            "message"
        )
        or response_data.get(
            "detail"
        )
        or ""
    )


    assert (
        "could not be delivered"
        in error_message
    )