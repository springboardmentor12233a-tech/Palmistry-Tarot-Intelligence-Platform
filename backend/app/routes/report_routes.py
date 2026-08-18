import io

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from fastapi.responses import (
    StreamingResponse,
)

from sqlalchemy.orm import (
    Session,
)

from app.core.database import (
    get_db,
)

from app.models.auth_schemas import (
    MessageResponse,
)

from app.models.database_models import (
    ReadingSession,
    User,
)

from app.models.report_schemas import (
    ReadingPdfRequest,
)

from app.services.auth_service import (
    get_current_user,
)

from app.services.email_service import (
    EmailDeliveryError,
    send_reading_pdf_email,
)

from app.services.reading_session_service import (
    get_user_reading_session,
)

from app.services.report_service import (
    build_analytics_summary_csv,
    build_reading_history_csv,
    build_reading_pdf,
)


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports & Exports"],
)


# ============================================================
# SAVED READING → PDF REQUEST
# ============================================================

def build_saved_reading_pdf_request(
    reading_session: ReadingSession,
) -> ReadingPdfRequest:

    reading_request = {

        "user_profile":
            (
                reading_session
                .user_profile
                or {}
            ),

        "reading_context":
            (
                reading_session
                .reading_context
                or {}
            ),

        "palm_analysis":
            (
                reading_session
                .palm_analysis
                or {}
            ),

        "tarot_analysis":
            (
                reading_session
                .tarot_analysis
                or {}
            ),
    }


    reading_response = {

        "status":
            "success",

        "message":
            "Saved reading report",

        "reading":
            (
                reading_session
                .initial_reading
                or {}
            ),

        "scores":
            (
                reading_session
                .scores
                or {}
            ),

        "reading_session_id":
            reading_session.id,
    }


    return ReadingPdfRequest(
        reading_request=(
            reading_request
        ),

        reading_response=(
            reading_response
        ),
    )


# ============================================================
# READING PDF DOWNLOAD
# ============================================================

@router.post(
    "/reading-pdf",
)
def download_reading_pdf(
    request: ReadingPdfRequest,

    current_user: User = Depends(
        get_current_user
    ),
):

    """
    Generate a PDF reading report for an
    authenticated platform user.
    """

    try:

        pdf_buffer, filename = (
            build_reading_pdf(
                request
            )
        )


        return StreamingResponse(
            pdf_buffer,

            media_type=(
                "application/pdf"
            ),

            headers={
                "Content-Disposition": (
                    f'attachment; filename="{filename}"'
                )
            },
        )


    except Exception as error:

        raise HTTPException(
            status_code=500,

            detail=(
                "The PDF reading report "
                "could not be generated."
            ),
        ) from error


# ============================================================
# EMAIL SAVED READING PDF
# ============================================================

@router.post(
    "/reading/{session_id}/email",
    response_model=MessageResponse,
)
def email_saved_reading_pdf(
    session_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    database: Session = Depends(
        get_db
    ),
):

    """
    Email a saved reading PDF only when the
    requested reading belongs to the
    authenticated user.
    """

    reading_session = (
        get_user_reading_session(
            db=database,

            user_id=(
                current_user.id
            ),

            session_id=(
                session_id
            ),
        )
    )


    # Returning 404 for both nonexistent
    # and another user's session prevents
    # disclosure of other users' readings.
    if reading_session is None:

        raise HTTPException(
            status_code=404,

            detail=(
                "Reading session "
                "not found."
            ),
        )


    try:

        pdf_request = (
            build_saved_reading_pdf_request(
                reading_session
            )
        )


        pdf_buffer, filename = (
            build_reading_pdf(
                pdf_request
            )
        )


        pdf_bytes = (
            pdf_buffer
            .getvalue()
        )


        if not pdf_bytes:

            raise RuntimeError(
                (
                    "Generated reading "
                    "PDF is empty."
                )
            )


        send_reading_pdf_email(
            recipient_email=(
                current_user.email
            ),

            recipient_name=(
                current_user.full_name
            ),

            reading_title=(
                reading_session.title
                or "Saved Reading"
            ),

            pdf_bytes=(
                pdf_bytes
            ),

            filename=(
                filename
            ),
        )


        return MessageResponse(
            status="success",

            message=(
                "Your reading PDF has "
                "been emailed successfully."
            ),
        )


    except EmailDeliveryError as error:

        raise HTTPException(
            status_code=502,

            detail=(
                "The reading PDF was "
                "generated, but the email "
                "could not be delivered."
            ),
        ) from error


    except Exception as error:

        raise HTTPException(
            status_code=500,

            detail=(
                "The reading PDF could "
                "not be prepared for email."
            ),
        ) from error


# ============================================================
# CURRENT USER ANALYTICS CSV
# ============================================================

@router.get(
    "/analytics-summary.csv",
)
def download_analytics_summary_csv(
    current_user: User = Depends(
        get_current_user
    ),
):

    """
    Export analytics belonging only
    to the authenticated user.
    """

    try:

        csv_content = (
            build_analytics_summary_csv(
                user_id=current_user.id
            )
        )


        csv_buffer = io.BytesIO(
            csv_content.encode(
                "utf-8-sig"
            )
        )


        return StreamingResponse(
            csv_buffer,

            media_type=(
                "text/csv"
            ),

            headers={
                "Content-Disposition": (
                    "attachment; "
                    'filename="my_analytics_summary.csv"'
                )
            },
        )


    except Exception as error:

        raise HTTPException(
            status_code=500,

            detail=(
                "Analytics CSV export failed."
            ),
        ) from error


# ============================================================
# CURRENT USER READING HISTORY CSV
# ============================================================

@router.get(
    "/reading-history.csv",
)
def download_reading_history_csv(
    limit: int = Query(
        default=100,
        ge=1,
        le=100,
    ),

    current_user: User = Depends(
        get_current_user
    ),
):

    """
    Export reading history belonging
    only to the authenticated user.
    """

    try:

        csv_content = (
            build_reading_history_csv(
                limit=limit,
                user_id=current_user.id,
            )
        )


        csv_buffer = io.BytesIO(
            csv_content.encode(
                "utf-8-sig"
            )
        )


        return StreamingResponse(
            csv_buffer,

            media_type=(
                "text/csv"
            ),

            headers={
                "Content-Disposition": (
                    "attachment; "
                    'filename="my_reading_history.csv"'
                )
            },
        )


    except Exception as error:

        raise HTTPException(
            status_code=500,

            detail=(
                "Reading history CSV "
                "export failed."
            ),
        ) from error