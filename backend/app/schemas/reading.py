from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from app.schemas.palm import PalmAnalysisResult
from app.schemas.tarot import TarotDrawResult


class UserContext(BaseModel):
    focus_topic: Optional[str] = None
    specific_question: Optional[str] = None


class GenerateReadingRequest(BaseModel):
    palm_result: Optional[PalmAnalysisResult] = None
    tarot_spread: Optional[TarotDrawResult] = None
    tarot_result: Optional[TarotDrawResult] = None  # alias support
    user_context: Optional[UserContext] = None


class InsightScore(BaseModel):
    palm_confidence: float
    tarot_relevance: float
    personality_alignment: float
    context_relevance: float
    consistency: float
    overall: float
    tier: str  # Celestial Alignment, Harmonic Resonance, Promising Insight, Emerging Synthesis


class CategoryInsight(BaseModel):
    title: str
    key: str  # personality, relationships, career, finance, health_wellness, personal_growth, life_opportunities
    score: int
    summary: str
    detailed_narrative: str
    key_takeaways: List[str] = []
    astrological_influence: Optional[str] = None
    palm_correlation: Optional[str] = None
    tarot_correlation: Optional[str] = None


class PersonalityIntelligence(BaseModel):
    primary_archetype: str
    secondary_archetype: str
    core_strengths: List[str] = []
    growth_edges: List[str] = []
    behavioral_insights: List[str] = []
    development_recommendations: List[str] = []
    temperament_balance: Dict[str, int] = {
        "intuition": 85,
        "logic": 80,
        "emotion": 78,
        "action": 88,
    }


class HorizonForecast(BaseModel):
    near_term: str
    mid_term: str
    long_term: str


class LifeTrendAnalysis(BaseModel):
    life_path_summary: str
    current_cycle: str
    upcoming_opportunities: List[str] = []
    potential_challenges: List[str] = []
    growth_potential_rating: int = 90
    horizon_forecast: HorizonForecast


class Recommendations(BaseModel):
    growth: List[str] = []
    relationships: List[str] = []
    career: List[str] = []
    goal_alignment: List[str] = []
    spiritual_development: List[str] = []
    daily_mantra: str
    recommended_crystals_or_symbols: List[str] = []


class Interpretation(BaseModel):
    overview_summary: str
    categories: List[CategoryInsight] = []


class FullReading(BaseModel):
    id: str
    user_id: Optional[str] = None
    date: str
    spread_type: str
    spread_title: str
    palm_result: PalmAnalysisResult
    tarot_result: TarotDrawResult
    user_context: Optional[UserContext] = None
    interpretation: Interpretation
    personality: PersonalityIntelligence
    life_trend: LifeTrendAnalysis
    insight_score: InsightScore
    recommendations: Recommendations
    created_at: str
    pdf_url: Optional[str] = None
    excel_url: Optional[str] = None
