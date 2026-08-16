from typing import Any

from pydantic import BaseModel, Field, field_validator


class HealthCheckResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    environment: str = "development"



class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: float


class EngineeredFeatures(BaseModel):
    palm_width: float
    palm_height: float
    thumb_length: float
    index_length: float
    middle_length: float
    ring_length: float
    little_length: float
    aspect_ratio: float


class ClusterInfo(BaseModel):
    cluster_id: int
    pca_coords: list[float]


class PalmLineFeature(BaseModel):
    Line: str
    Length: float
    Area: float
    Angle: float
    Center_X: float
    Center_Y: float
    Interpretation: str


class PalmAnalysisResponse(BaseModel):
    landmarks: list[LandmarkPoint]
    engineered_features: EngineeredFeatures
    cluster: ClusterInfo
    rule_report: dict[str, Any]
    palm_lines: list[PalmLineFeature]


class TarotCardDraw(BaseModel):
    position: str
    name: str
    arcana: str
    suit: str
    orientation: str
    img: str | None = None
    img_path: str | None = None
    img_url: str | None = None
    keywords: str
    meaning: str
    fortune: str
    affirmation: str
    questions: str


class TarotDrawRequest(BaseModel):
    num_cards: int = Field(default=3, ge=1, le=78, description="Number of tarot cards to draw (1 to 78)")
    seed: int | None = Field(default=None, description="Optional random seed for deterministic draw")
    session_id: str | None = Field(default=None, description="Session ID for tracking history")


class TarotDrawResponse(BaseModel):
    num_cards: int
    cards: list[TarotCardDraw]


class FullReadingResponse(BaseModel):
    user_question: str
    palm_features: EngineeredFeatures
    palm_report: dict[str, Any]
    palm_lines: list[PalmLineFeature]
    cluster: ClusterInfo
    tarot_reading: TarotDrawResponse
    interpretation: dict[str, Any]
    pdf_url: str
    session_id: str | None = None


class UserRegisterRequest(BaseModel):
    name: str | None = Field(default=None, description="User full name")
    username: str | None = Field(default=None, description="Username, default derived from email")
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=4, description="Password")
    confirm_password: str | None = Field(default=None, description="Password confirmation")
    role: str = Field(default="user", description="One of: user, admin")
    full_name: str | None = None

    @field_validator('email')
    @classmethod
    def validate_gmail_domain(cls, v: str) -> str:
        if not v or not v.lower().strip().endswith("@gmail.com"):
            raise ValueError("Please use a valid @gmail.com email address.")
        return v.lower().strip()


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="User email address or username")
    password: str = Field(..., description="User password")
    username: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    email: str
    role: str
    full_name: str
    id: str


class UserStatusUpdateRequest(BaseModel):
    is_active: bool
    role: str | None = None


class UserProfileResponse(BaseModel):
    id: str
    username: str
    role: str
    full_name: str
    email: str
    is_active: bool = True
    created_at: str
    reading_history: list[dict[str, Any]] | None = Field(default_factory=list)


class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content text")


class ChatRequest(BaseModel):
    message: str = Field(..., description="Latest user message string")
    history: list[ChatMessage] = Field(default_factory=list, description="Previous conversation history")
    reading_context: dict[str, Any] | None = Field(default=None, description="Active palm/tarot reading context dictionary")
    session_id: str | None = Field(default=None, description="Session ID for persistent context")


class ChatResponse(BaseModel):
    reply: str = Field(..., description="AI Chatbot text response")
    suggested_followups: list[str] = Field(default_factory=list, description="List of suggested follow-up prompt strings")
    session_id: str | None = None




