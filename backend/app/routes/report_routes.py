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

from app.models.database_models import (
    User,
)

from app.models.report_schemas import (
    ReadingPdfRequest,
)

from app.services.auth_service import (
    get_current_user,
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
# READING PDF
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

    The report content is generated from the
    supplied complete reading request/response.
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