from fastapi import APIRouter, HTTPException
from google.genai import errors

from app.models.reading_schemas import (
    CompleteReadingRequest,
    CompleteReadingResponse,
)
from app.services.reading_service import (
    generate_complete_reading,
)


router = APIRouter(
    prefix="/api/readings",
    tags=["Complete Reading Workflow"],
)


@router.post(
    "/generate-complete",
    response_model=CompleteReadingResponse,
)
def create_complete_reading(
    reading_data: CompleteReadingRequest,
):
    try:
        reading_result, scores = (
            generate_complete_reading(
                reading_data
            )
        )

        return CompleteReadingResponse(
            status="success",
            message=(
                "Complete personalized reading "
                "generated successfully."
            ),
            reading=reading_result,
            scores=scores,
        )

    except errors.APIError as error:
        error_code = getattr(
            error,
            "code",
            None,
        )

        print(
            "Gemini complete-reading API error:",
            error_code,
            error,
        )

        if error_code in {
            429,
            500,
            502,
            503,
            504,
        }:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Gemini is temporarily busy or "
                    "unavailable. Please wait and "
                    "try again."
                ),
            ) from error

        raise HTTPException(
            status_code=500,
            detail=(
                "The complete Gemini reading "
                "request failed."
            ),
        ) from error

    except Exception as error:
        print(
            "Complete reading generation error:",
            type(error).__name__,
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "The complete personalized reading "
                "could not be generated."
            ),
        ) from error