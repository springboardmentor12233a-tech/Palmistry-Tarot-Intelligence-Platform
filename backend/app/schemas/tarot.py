from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class TarotCardData(BaseModel):
    id: str
    name: str
    arcana: str  # major, minor
    suit: Optional[str] = None  # wands, cups, swords, pentacles, trump
    number: int
    element: Optional[str] = "Fire"
    keywords: List[str] = []
    upright_meaning: str
    reversed_meaning: str
    symbolism: Optional[str] = None
    astrological_association: Optional[str] = None
    image_path: Optional[str] = None
    fortune_telling: Optional[List[str]] = []
    meanings: Optional[Dict[str, List[str]]] = None


class DrawnCard(BaseModel):
    card: TarotCardData
    position_index: int
    position_label: str
    position_meaning: str
    is_reversed: bool = False


class TarotDrawRequest(BaseModel):
    spread_type: str = "three_card"  # single_card, three_card, relationship, career, celtic_cross, life_path
    seed: Optional[Any] = None


class TarotDrawResult(BaseModel):
    spread_type: str
    spread_title: str
    cards: List[DrawnCard]
    drawn_at: str
