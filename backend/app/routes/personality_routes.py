from fastapi import APIRouter, HTTPException
from google.genai import errors

from app.models.personality_schemas import (
    PersonalityRequest,
    PersonalityResponse,
)
from app.services.personality_service import (
    generate_personality_profile,
)


router = APIRouter(
    prefix="/api/personality",
    tags=["Personality Intelligence"],
)


@router.post(
    "/generate",
    response_model=PersonalityResponse,
)
def create_personality_profile(
    reading_data: PersonalityRequest,
):
    try:
        result = generate_personality_profile(reading_data)

        return PersonalityResponse(
            status="success",
            message=(
                "Personality profile generated successfully."
            ),
            personality=result,
        )

    except errors.APIError as error:
        error_code = getattr(error, "code", None)

        print(
            "Gemini personality API error:",
            error_code,
            error,
        )

        if error_code == 429:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Gemini usage limits are temporarily reached. "
                    "Please wait and try again."
                ),
            ) from error

        if error_code in {500, 502, 503, 504}:
            raise HTTPException(
                status_code=503,
                detail=(
                    "Gemini is temporarily busy or unavailable. "
                    "Please try again after a few minutes."
                ),
            ) from error

        raise HTTPException(
            status_code=500,
            detail=(
                "The Gemini request could not be completed."
            ),
        ) from error

    except Exception as error:
        print(
            "Personality generation error:",
            type(error).__name__,
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "The personality profile could not be generated."
            ),
        ) from error