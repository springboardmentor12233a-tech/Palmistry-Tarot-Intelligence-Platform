from fastapi import APIRouter, HTTPException

from app.models.interpretation_schemas import (
    InterpretationRequest,
    InterpretationResponse,
)
from app.services.gemini_service import generate_interpretation


router = APIRouter(
    prefix="/api/interpretation",
    tags=["AI Interpretation"],
)


@router.post(
    "/generate",
    response_model=InterpretationResponse,
)
def create_ai_interpretation(
    reading_data: InterpretationRequest,
):
    try:
        result = generate_interpretation(reading_data)

        return InterpretationResponse(
            status="success",
            message="AI interpretation generated successfully.",
            interpretation=result,
        )

    except Exception as error:
        print("Gemini interpretation error:", error)

        raise HTTPException(
            status_code=500,
            detail="AI interpretation could not be generated.",
        ) from error