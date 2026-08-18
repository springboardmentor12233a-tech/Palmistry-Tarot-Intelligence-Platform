from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app import models, schemas
from app.services import groq_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/{reading_id}", response_model=list[schemas.ChatMessageOut])
def get_history(
    reading_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.ChatMessage)
        .filter(
            models.ChatMessage.reading_id == reading_id,
            models.ChatMessage.user_id == current_user.id,
        )
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )


@router.post("/{reading_id}", response_model=schemas.ChatMessageOut)
def send_message(
    reading_id: int,
    payload: schemas.ChatIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reading = db.query(models.Reading).filter(models.Reading.id == reading_id).first()
    if not reading or reading.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Reading not found")

    history = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.reading_id == reading_id, models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )
    history_payload = [{"role": m.role, "content": m.content} for m in history]

    user_msg = models.ChatMessage(
        user_id=current_user.id, reading_id=reading_id, role="user", content=payload.message
    )
    db.add(user_msg)
    db.commit()

    try:
        reply = groq_service.chat_reply(reading.result_markdown, history_payload, payload.message)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI chat failed: {e}")

    assistant_msg = models.ChatMessage(
        user_id=current_user.id, reading_id=reading_id, role="assistant", content=reply
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg
