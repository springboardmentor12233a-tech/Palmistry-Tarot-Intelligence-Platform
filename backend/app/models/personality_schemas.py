from typing import List

from pydantic import BaseModel

from app.models.interpretation_schemas import InterpretationRequest


class PersonalityRequest(InterpretationRequest):
    pass


class PersonalityResult(BaseModel):
    personality_summary: str
    dominant_traits: List[str]
    emotional_style: str
    thinking_style: str
    decision_style: str
    relationship_style: str
    strengths: List[str]
    development_areas: List[str]
    growth_advice: List[str]


class PersonalityResponse(BaseModel):
    status: str
    message: str
    personality: PersonalityResult