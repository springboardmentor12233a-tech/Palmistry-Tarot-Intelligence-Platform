from typing import List, Literal, Optional

from pydantic import BaseModel, Field


SupportedSpread = Literal[
    "Single Card",
    "Past-Present-Future",
]


class TarotDrawRequest(BaseModel):
    spread: SupportedSpread = Field(
        description=(
            "Supported spreads are Single Card and "
            "Past-Present-Future."
        )
    )


class DrawnTarotCard(BaseModel):
    position: str
    name: str
    orientation: Literal["upright", "reversed"]
    keywords: List[str]
    selected_meaning: str

    number: Optional[str] = None
    arcana: Optional[str] = None
    suit: Optional[str] = None
    image: Optional[str] = None


class TarotDrawResponse(BaseModel):
    status: str
    message: str
    spread: str
    card_count: int
    cards: List[DrawnTarotCard]