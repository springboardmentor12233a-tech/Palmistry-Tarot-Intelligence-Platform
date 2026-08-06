from fastapi import APIRouter, HTTPException

from app.models.scoring_schemas import (
    GuidanceScoreRequest,
    GuidanceScoreResponse,
)
from app.services.scoring_service import (
    calculate_guidance_scores,
)


router = APIRouter(
    prefix="/api/scores",
    tags=["Guidance Scoring"],
)


@router.post(
    "/calculate",
    response_model=GuidanceScoreResponse,
)
def create_guidance_scores(
    score_data: GuidanceScoreRequest,
):
    try:
        result = calculate_guidance_scores(
            score_data
        )

        return GuidanceScoreResponse(
            status="success",
            message=(
                "Guidance scores calculated successfully."
            ),
            scores=result,
        )

    except Exception as error:
        print(
            "Guidance scoring error:",
            type(error).__name__,
            error,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Guidance scores could not be calculated."
            ),
        ) from error