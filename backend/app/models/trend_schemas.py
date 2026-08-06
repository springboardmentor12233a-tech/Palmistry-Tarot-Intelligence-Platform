from typing import List

from pydantic import BaseModel

from app.models.interpretation_schemas import InterpretationRequest


class TrendRequest(InterpretationRequest):
    pass


class TrendResult(BaseModel):
    trend_summary: str
    current_theme: str
    next_30_days: str
    next_3_months: str
    opportunities: List[str]
    challenges: List[str]
    recommended_focus: List[str]
    practical_actions: List[str]
    disclaimer: str


class TrendResponse(BaseModel):
    status: str
    message: str
    trends: TrendResult