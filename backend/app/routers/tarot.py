import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app import models, schemas
from app.services import tarot_service, groq_service

router = APIRouter(prefix="/tarot", tags=["tarot"])


@router.get("/deck")
def get_deck():
    return {"cards": tarot_service.load_deck()}


@router.get("/spreads")
def get_spreads():
    return tarot_service.get_spreads()


@router.post("/draw", response_model=schemas.ReadingOut)
def draw(
    payload: schemas.TarotDrawIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if payload.spread not in tarot_service.SPREADS:
        raise HTTPException(status_code=400, detail="Unknown spread type")

    drawn = tarot_service.draw_spread(payload.spread)

    try:
        report_md = groq_service.tarot_interpretation(drawn, payload.spread)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI interpretation failed: {e}")

    reading = models.Reading(
        user_id=current_user.id,
        type="tarot",
        title=f"Tarot Reading ({payload.spread.replace('_', ' ').title()})",
        input_data=json.dumps({"spread": payload.spread, "cards": drawn}),
        result_markdown=report_md,
        images=json.dumps({}),
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    reading.input_data = json.loads(reading.input_data)
    reading.images = json.loads(reading.images)
    return reading


@router.post("/draw-selected", response_model=schemas.ReadingOut)
def draw_selected(
    payload: schemas.TarotSelectIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        drawn = tarot_service.draw_selected(payload.spread, payload.card_names)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        report_md = groq_service.tarot_interpretation(drawn, payload.spread)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI interpretation failed: {e}")

    reading = models.Reading(
        user_id=current_user.id,
        type="tarot",
        title=f"Tarot Reading ({payload.spread.replace('_', ' ').title()})",
        input_data=json.dumps({"spread": payload.spread, "cards": drawn}),
        result_markdown=report_md,
        images=json.dumps({}),
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    reading.input_data = json.loads(reading.input_data)
    reading.images = json.loads(reading.images)
    return reading
