from fastapi import APIRouter, HTTPException
from google.genai import errors

from app.models.trend_schemas import (
    TrendRequest,
    TrendResponse,
)
from app.services.trend_service import (
    generate_life_trends,
)


router = APIRouter(
    prefix="/api/trends",
    tags=["Life Trend Analysis"],
)


@router.post(
    "/generate",
    response_model=TrendResponse,
)
def create_life_trends(
    reading_data: TrendRequest,
):
    try:
        result = generate_life_trends(reading_data)

        return TrendResponse(
            status="success",
            message="Life trends generated successfully.",
            trends=result,
        )

    except errors.APIError as error:
        error_code = getattr(error, "code", None)

        print(
            "Gemini trend API error:",
            error_code,
            error,
        )

        if error_code in {429, 500, 502, 503, 504}:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Gemini is temporarily busy or unavailable. "
                    "Please wait and try again."
                ),
            ) from error

        raise HTTPException(
            status_code=500,
            detail="The Gemini trend request failed.",
        ) from error

    except Exception as error:
        print(
            "Life trend generation error:",
            type(error).__name__,
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Life trend analysis could not be generated."
            ),
        ) from error