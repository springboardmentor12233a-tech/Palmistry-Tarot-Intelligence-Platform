from typing import List, Optional

from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    age_group: str

    interests: List[str]

    spiritual_goal: str

    reading_preference: str


class ReadingContext(BaseModel):
    question: str = Field(
        min_length=3,
        max_length=500,
    )

    category: str


class PalmAnalysis(BaseModel):
    heart_line: str

    head_line: str

    life_line: str


class TarotCard(BaseModel):
    position: str

    name: str

    orientation: str

    keywords: List[str]

    selected_meaning: str

    # Tarot image returned by the drawing engine.
    # Example:
    # /static/tarot_cards/m17.jpg
    image: Optional[str] = None


class TarotAnalysis(BaseModel):
    spread: str

    cards: List[TarotCard]


class InterpretationRequest(BaseModel):
    user_profile: UserProfile

    reading_context: ReadingContext

    palm_analysis: PalmAnalysis

    tarot_analysis: TarotAnalysis


class InterpretationResult(BaseModel):
    overall_summary: str

    palm_interpretation: str

    tarot_interpretation: str

    combined_interpretation: str

    key_strengths: List[str]

    growth_areas: List[str]

    current_focus: str

    key_message: str

    reflection_question: str

    disclaimer: str


class InterpretationResponse(BaseModel):
    status: str

    message: str

    interpretation: InterpretationResult