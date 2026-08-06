from fastapi import APIRouter, HTTPException
from google.genai import errors

from app.models.recommendation_schemas import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.services.recommendation_service import (
    generate_recommendations,
)


router = APIRouter(
    prefix="/api/recommendations",
    tags=["Recommendation Engine"],
)


@router.post(
    "/generate",
    response_model=RecommendationResponse,
)
def create_recommendations(
    reading_data: RecommendationRequest,
):
    try:
        result = generate_recommendations(reading_data)

        return RecommendationResponse(
            status="success",
            message="Recommendations generated successfully.",
            recommendations=result,
        )

    except errors.APIError as error:
        error_code = getattr(error, "code", None)

        print(
            "Gemini recommendation API error:",
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
            detail=(
                "The Gemini recommendation request failed."
            ),
        ) from error

    except Exception as error:
        print(
            "Recommendation generation error:",
            type(error).__name__,
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Recommendations could not be generated."
            ),
        ) from error