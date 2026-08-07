from typing import Dict, List, Optional

from pydantic import BaseModel


class TarotCardCount(BaseModel):
    name: str
    count: int


class AnalyticsSummaryResponse(BaseModel):
    total_readings: int
    total_palm_analyses: int
    total_tarot_readings: int
    average_guidance_score: float

    spread_distribution: Dict[str, int]
    category_distribution: Dict[str, int]

    heart_line_distribution: Dict[str, int]
    head_line_distribution: Dict[str, int]
    life_line_distribution: Dict[str, int]

    orientation_distribution: Dict[str, int]

    most_common_tarot_cards: List[TarotCardCount]


class ReadingHistoryItem(BaseModel):
    id: int
    created_at: str

    category: Optional[str] = None
    spread: Optional[str] = None

    heart_line: Optional[str] = None
    head_line: Optional[str] = None
    life_line: Optional[str] = None

    tarot_cards: List[str]

    upright_count: int
    reversed_count: int

    overall_insight_score: Optional[float] = None