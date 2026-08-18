import json
import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app import models, schemas
from app.config import RESULTS_DIR
from app.services import groq_service, pdf_service

router = APIRouter(prefix="/reports", tags=["reports"])


def _owned_reading(db: Session, reading_id: int, user: models.User) -> models.Reading:
    reading = db.query(models.Reading).filter(models.Reading.id == reading_id).first()
    if not reading or reading.user_id != user.id:
        raise HTTPException(status_code=404, detail="Reading not found")
    return reading


@router.get("/history", response_model=list[schemas.ReadingListItem])
def history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Reading)
        .filter(models.Reading.user_id == current_user.id)
        .order_by(models.Reading.created_at.desc())
        .all()
    )


@router.get("/{reading_id}", response_model=schemas.ReadingOut)
def get_reading(
    reading_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reading = _owned_reading(db, reading_id, current_user)
    reading.input_data = json.loads(reading.input_data or "{}")
    reading.images = json.loads(reading.images or "{}")
    return reading


@router.post("/combine", response_model=schemas.ReadingOut)
def combine(
    payload: schemas.CombineIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    palm = _owned_reading(db, payload.palm_reading_id, current_user)
    tarot = _owned_reading(db, payload.tarot_reading_id, current_user)
    if palm.type != "palm" or tarot.type != "tarot":
        raise HTTPException(status_code=400, detail="Provide one palm reading and one tarot reading")

    tarot_cards = json.loads(tarot.input_data or "{}").get("cards", [])

    try:
        report_md = groq_service.combined_report(palm.result_markdown, tarot_cards)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI interpretation failed: {e}")

    reading = models.Reading(
        user_id=current_user.id,
        type="combined",
        title="Combined Palm + Tarot Report",
        input_data=json.dumps({"palm_reading_id": palm.id, "tarot_reading_id": tarot.id}),
        result_markdown=report_md,
        images=palm.images,
        parent_palm_id=palm.id,
        parent_tarot_id=tarot.id,
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    reading.input_data = json.loads(reading.input_data)
    reading.images = json.loads(reading.images or "{}")
    return reading


@router.get("/{reading_id}/pdf")
def download_pdf(
    reading_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reading = _owned_reading(db, reading_id, current_user)

    if reading.pdf_path and os.path.exists(reading.pdf_path):
        return FileResponse(reading.pdf_path, filename=os.path.basename(reading.pdf_path))

    images_meta = json.loads(reading.images or "{}")
    image_paths = {}
    for label, url in images_meta.items():
        if url and url.startswith("/static/results/"):
            image_paths[label.title()] = os.path.join(RESULTS_DIR, os.path.basename(url))

    filename = f"reading_{reading.id}.pdf"

    if reading.type == "palm":
        input_data = json.loads(reading.input_data or "{}")
        path = pdf_service.build_report_pdf(
            filename, "PalmAI Report",
            images=image_paths, features=input_data.get("features"),
            palm_report=reading.result_markdown,
        )
    elif reading.type == "tarot":
        input_data = json.loads(reading.input_data or "{}")
        path = pdf_service.build_report_pdf(
            filename, "Tarot Reading Report",
            tarot_result=input_data.get("cards"), tarot_report=reading.result_markdown,
        )
    else:  # combined
        palm = db.query(models.Reading).filter(models.Reading.id == reading.parent_palm_id).first()
        tarot = db.query(models.Reading).filter(models.Reading.id == reading.parent_tarot_id).first()
        palm_features = json.loads(palm.input_data or "{}").get("features") if palm else None
        tarot_cards = json.loads(tarot.input_data or "{}").get("cards") if tarot else None
        path = pdf_service.build_report_pdf(
            filename, "PalmAI + Tarot Combined Report",
            images=image_paths, features=palm_features,
            palm_report=palm.result_markdown if palm else None,
            tarot_result=tarot_cards,
            combined_report=reading.result_markdown,
        )

    reading.pdf_path = path
    db.commit()

    return FileResponse(path, filename=filename)
