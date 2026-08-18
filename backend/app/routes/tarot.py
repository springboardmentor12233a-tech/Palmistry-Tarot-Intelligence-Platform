from pydantic import BaseModel, Field
from fastapi import APIRouter

from app.services.pdf_generator import generate_tarot_pdf
from app.services.tarot_engine import (
    TarotRequest,
    answer_follow_up,
    create_tarot_reading,
    find_common_themes,
)

router = APIRouter(prefix="/api/tarot", tags=["tarot"])


class FollowUpRequest(BaseModel):
    conversation_context: str = Field(min_length=1)
    question: str = Field(min_length=1)

class CommonThemesRequest(BaseModel):
    palm_interpretation: str = Field(min_length=1)
    tarot_interpretation: str = Field(min_length=1)


@router.post("/reading")
def tarot_reading(request: TarotRequest) -> dict:
    reading = create_tarot_reading(request)
    pdf_path = generate_tarot_pdf(reading)
    reading["pdf_path"] = str(pdf_path)
    reading["pdf_url"] = f"/api/files/{pdf_path.name}"
    return reading


@router.post("/follow-up")
def tarot_follow_up(request: FollowUpRequest) -> dict:
    answer = answer_follow_up(request.conversation_context, request.question)
    return {"answer": answer}

@router.post("/common-themes")
def common_themes(request: CommonThemesRequest) -> dict:
    themes = find_common_themes(
        request.palm_interpretation,
        request.tarot_interpretation,
    )

    return {
        "common_themes": themes
    }