import io

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from fastapi.responses import (
    StreamingResponse,
)

from app.models.report_schemas import (
    ReadingPdfRequest,
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


@router.post(
    "/reading-pdf",
)
def download_reading_pdf(
    request: ReadingPdfRequest,
):
    try:
        pdf_buffer, filename = (
            build_reading_pdf(
                request
            )
        )

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
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


@router.get(
    "/analytics-summary.csv",
)
def download_analytics_summary_csv():
    try:
        csv_content = (
            build_analytics_summary_csv()
        )

        csv_buffer = io.BytesIO(
            csv_content.encode(
                "utf-8-sig"
            )
        )

        return StreamingResponse(
            csv_buffer,
            media_type="text/csv",
            headers={
                "Content-Disposition": (
                    "attachment; "
                    'filename="analytics_summary.csv"'
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


@router.get(
    "/reading-history.csv",
)
def download_reading_history_csv(
    limit: int = Query(
        default=100,
        ge=1,
        le=100,
    ),
):
    try:
        csv_content = (
            build_reading_history_csv(
                limit=limit
            )
        )

        csv_buffer = io.BytesIO(
            csv_content.encode(
                "utf-8-sig"
            )
        )

        return StreamingResponse(
            csv_buffer,
            media_type="text/csv",
            headers={
                "Content-Disposition": (
                    "attachment; "
                    'filename="reading_history.csv"'
                )
            },
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Reading history CSV export failed."
            ),
        ) from error