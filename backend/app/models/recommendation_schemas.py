from typing import List

from pydantic import BaseModel

from app.models.interpretation_schemas import InterpretationRequest


class RecommendationRequest(InterpretationRequest):
    pass


class RecommendationResult(BaseModel):
    recommendation_summary: str
    personal_growth: List[str]
    career: List[str]
    relationships: List[str]
    goal_alignment: List[str]
    spiritual_development: List[str]
    immediate_actions: List[str]
    long_term_actions: List[str]


class RecommendationResponse(BaseModel):
    status: str
    message: str
    recommendations: RecommendationResult