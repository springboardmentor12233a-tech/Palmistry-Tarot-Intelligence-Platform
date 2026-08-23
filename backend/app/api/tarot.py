from fastapi import APIRouter
from app.schemas.tarot import TarotDrawRequest, TarotDrawResult
from app.services.tarot_engine import tarot_engine

router = APIRouter(prefix="/tarot", tags=["Tarot"])


@router.post("/draw", response_model=TarotDrawResult)
async def draw_tarot(payload: TarotDrawRequest):
    """
    Draws a spread of Tarot cards from the 78-card archetypal deck.
    Supports single_card, three_card, relationship, career, celtic_cross, and life_path spreads.
    """
    return tarot_engine.draw_spread(
        spread_type=payload.spread_type,
        seed=payload.seed,
    )
