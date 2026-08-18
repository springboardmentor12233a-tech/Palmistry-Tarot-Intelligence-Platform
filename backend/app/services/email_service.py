import html
import logging

import httpx

from app.config import (
    settings,
)


logger = logging.getLogger(
    __name__
)


BREVO_EMAIL_ENDPOINT = (
    "https://api.brevo.com/v3/smtp/email"
)


# ============================================================
# EMAIL ERROR
# ============================================================

class EmailDeliveryError(
    Exception
):

    pass


# ============================================================
# GENERIC TRANSACTIONAL EMAIL
# ============================================================

def send_transactional_email(
    *,
    recipient_email: str,
    recipient_name: str,
    subject: str,
    html_content: str,
    text_content: str,
) -> None:

    api_key = (
        settings
        .BREVO_API_KEY
        .strip()
    )


    sender_email = (
        settings
        .EMAIL_FROM_ADDRESS
        .strip()
    )


    sender_name = (
        settings
        .EMAIL_FROM_NAME
        .strip()
    )


    if (
        not api_key
        or not sender_email
    ):

        raise EmailDeliveryError(
            (
                "Transactional email "
                "is not configured."
            )
        )


    payload = {
        "sender": {
            "name":
                sender_name,

            "email":
                sender_email,
        },

        "to": [
            {
                "email":
                    recipient_email,

                "name":
                    recipient_name,
            }
        ],

        "subject":
            subject,

        "htmlContent":
            html_content,

        "textContent":
            text_content,
    }


    headers = {
        "accept":
            "application/json",

        "content-type":
            "application/json",

        "api-key":
            api_key,
    }


    try:

        with httpx.Client(
            timeout=15.0
        ) as client:

            response = client.post(
                BREVO_EMAIL_ENDPOINT,
                headers=headers,
                json=payload,
            )


    except httpx.HTTPError as error:

        raise EmailDeliveryError(
            (
                "The transactional email "
                "service could not be reached."
            )
        ) from error


    if (
        response.status_code
        < 200
        or response.status_code
        >= 300
    ):

        logger.error(
            (
                "Brevo email delivery "
                "failed with status %s."
            ),
            response.status_code,
        )


        raise EmailDeliveryError(
            (
                "The transactional email "
                "provider rejected the message."
            )
        )


# ============================================================
# PASSWORD RESET EMAIL
# ============================================================

def send_password_reset_email(
    *,
    recipient_email: str,
    recipient_name: str,
    reset_url: str,
    expires_minutes: int,
) -> None:

    safe_name = html.escape(
        recipient_name
    )


    safe_url = html.escape(
        reset_url,
        quote=True,
    )


    subject = (
        "Reset your password"
    )


    text_content = (
        f"Hello {recipient_name},\n\n"
        "We received a request to reset "
        "your password.\n\n"
        f"Reset your password here:\n"
        f"{reset_url}\n\n"
        "This link expires in "
        f"{expires_minutes} minutes.\n\n"
        "If you did not request a password "
        "reset, you can ignore this email."
    )


    html_content = f"""
    <div
        style="
            max-width: 560px;
            margin: 0 auto;
            padding: 32px;
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
        "
    >
        <h2>
            Reset your password
        </h2>

        <p>
            Hello {safe_name},
        </p>

        <p>
            We received a request to reset
            your password for the Palmistry
            &amp; Tarot Intelligence Platform.
        </p>

        <p>
            <a
                href="{safe_url}"
                style="
                    display: inline-block;
                    padding: 12px 20px;
                    background: #4f46e5;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                "
            >
                Reset Password
            </a>
        </p>

        <p>
            This link expires in
            {expires_minutes} minutes.
        </p>

        <p>
            If you did not request this
            password reset, you can safely
            ignore this email.
        </p>
    </div>
    """


    send_transactional_email(
        recipient_email=(
            recipient_email
        ),

        recipient_name=(
            recipient_name
        ),

        subject=subject,

        html_content=(
            html_content
        ),

        text_content=(
            text_content
        ),
    )