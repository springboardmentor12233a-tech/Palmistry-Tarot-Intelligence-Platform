from pydantic import BaseModel

from app.models.interpretation_schemas import (
    InterpretationRequest,
    InterpretationResult,
)
from app.models.personality_schemas import (
    PersonalityResult,
)
from app.models.recommendation_schemas import (
    RecommendationResult,
)
from app.models.scoring_schemas import (
    GuidanceScoreResult,
)
from app.models.trend_schemas import (
    TrendResult,
)


class CompleteReadingRequest(InterpretationRequest):
    pass


class CompleteAIResult(BaseModel):
    interpretation: InterpretationResult
    personality: PersonalityResult
    recommendations: RecommendationResult
    trends: TrendResult


class CompleteReadingResponse(BaseModel):
    status: str
    message: str
    reading: CompleteAIResult
    scores: GuidanceScoreResult