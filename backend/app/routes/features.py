from pydantic import BaseModel, Field
from fastapi import APIRouter

from app.services.tarot_engine import (
    generate_daily_question,
    generate_daily_reflection,
    generate_ai_insights,
)


router = APIRouter(
    prefix="/api/features",
    tags=["features"]
)


class DailyReflectionRequest(BaseModel):
    question: str = Field(min_length=1)
    answer: str = Field(min_length=1)


class AIInsightsRequest(BaseModel):
    palm_interpretation: str = Field(min_length=1)
    tarot_interpretation: str = Field(min_length=1)


@router.get("/daily-question")
def daily_question() -> dict:
    question = generate_daily_question()

    return {
        "question": question
    }


@router.post("/daily-reflection")
def daily_reflection(request: DailyReflectionRequest) -> dict:
    reflection = generate_daily_reflection(
        request.question,
        request.answer
    )

    return {
        "reflection": reflection
    }


@router.post("/ai-insights")
def ai_insights(request: AIInsightsRequest) -> dict:
    insights = generate_ai_insights(
        request.palm_interpretation,
        request.tarot_interpretation
    )

    return insights