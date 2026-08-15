from datetime import datetime

from typing import (
    Literal,
)

from pydantic import (
    BaseModel,
    Field,
)

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


# ============================================================
# COMPLETE READING REQUEST
# ============================================================

class CompleteReadingRequest(
    InterpretationRequest
):
    pass


# ============================================================
# COMPLETE AI RESULT
# ============================================================

class CompleteAIResult(BaseModel):

    interpretation: (
        InterpretationResult
    )

    personality: (
        PersonalityResult
    )

    recommendations: (
        RecommendationResult
    )

    trends: (
        TrendResult
    )


# ============================================================
# COMPLETE READING RESPONSE
# ============================================================

class CompleteReadingResponse(BaseModel):

    status: str

    message: str

    reading: CompleteAIResult

    scores: GuidanceScoreResult

    reading_session_id: (
        int | None
    ) = None


# ============================================================
# STORED CHAT MESSAGE
# ============================================================

class StoredChatMessage(
    BaseModel
):

    id: int

    role: Literal[
        "user",
        "assistant",
    ]

    content: str

    created_at: datetime


# ============================================================
# READING SESSION SUMMARY
# ============================================================

class ReadingSessionSummary(
    BaseModel
):

    id: int

    title: str

    original_question: str

    category: str | None = None

    spread: str | None = None

    created_at: datetime

    updated_at: datetime

    message_count: int = 0


# ============================================================
# READING SESSION DETAIL
# ============================================================

class ReadingSessionDetail(
    BaseModel
):

    id: int

    title: str

    original_question: str

    category: str | None = None

    spread: str | None = None

    user_profile: dict

    reading_context: dict

    palm_analysis: dict

    tarot_analysis: dict

    initial_reading: dict

    scores: dict

    is_archived: bool

    created_at: datetime

    updated_at: datetime

    messages: list[
        StoredChatMessage
    ] = Field(
        default_factory=list
    )