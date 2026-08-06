from pydantic import BaseModel, Field


class GuidanceScoreRequest(BaseModel):
    palm_analysis_confidence: float = Field(
        ge=0,
        le=100,
    )
    tarot_interpretation_relevance: float = Field(
        ge=0,
        le=100,
    )
    personality_alignment: float = Field(
        ge=0,
        le=100,
    )
    user_context_relevance: float = Field(
        ge=0,
        le=100,
    )
    reading_consistency: float = Field(
        ge=0,
        le=100,
    )


class GuidanceScoreResult(BaseModel):
    palm_analysis_confidence: float
    tarot_interpretation_relevance: float
    personality_alignment: float
    user_context_relevance: float
    reading_consistency: float

    overall_insight_score: float
    score_label: str
    calculation_method: str
    disclaimer: str


class GuidanceScoreResponse(BaseModel):
    status: str
    message: str
    scores: GuidanceScoreResult