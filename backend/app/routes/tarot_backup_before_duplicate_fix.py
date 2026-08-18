from random import sample

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.tarot import TarotReading
from app.models.user import User
from app.routes.palmistry import get_current_user


router = APIRouter(
    prefix="/api/tarot",
    tags=["Tarot"],
)


# =========================================================
# REQUEST MODEL
# =========================================================

class TarotReadingRequest(BaseModel):
    question: str
    topic: str


# =========================================================
# TAROT KNOWLEDGE BASE
# =========================================================

TAROT_CARDS = [
    {
        "name": "The Fool",
        "meaning": "New beginnings, curiosity, freedom and taking a leap of faith.",
    },
    {
        "name": "The Magician",
        "meaning": "Skill, confidence, action and the ability to turn ideas into reality.",
    },
    {
        "name": "The High Priestess",
        "meaning": "Intuition, inner wisdom, reflection and hidden knowledge.",
    },
    {
        "name": "The Empress",
        "meaning": "Growth, creativity, abundance and nurturing energy.",
    },
    {
        "name": "The Emperor",
        "meaning": "Structure, leadership, stability and responsibility.",
    },
    {
        "name": "The Hierophant",
        "meaning": "Tradition, learning, guidance and established values.",
    },
    {
        "name": "The Lovers",
        "meaning": "Connection, choices, harmony and meaningful relationships.",
    },
    {
        "name": "The Chariot",
        "meaning": "Determination, direction, discipline and forward movement.",
    },
    {
        "name": "Strength",
        "meaning": "Courage, patience, compassion and inner strength.",
    },
    {
        "name": "The Hermit",
        "meaning": "Introspection, solitude, wisdom and searching within.",
    },
    {
        "name": "Wheel of Fortune",
        "meaning": "Change, cycles, opportunity and shifting circumstances.",
    },
    {
        "name": "Justice",
        "meaning": "Balance, fairness, accountability and thoughtful decisions.",
    },
    {
        "name": "The Hanged Man",
        "meaning": "Pause, surrender, perspective and seeing a situation differently.",
    },
    {
        "name": "Death",
        "meaning": "Transformation, endings and the beginning of a new phase.",
    },
    {
        "name": "Temperance",
        "meaning": "Balance, patience, moderation and harmonious integration.",
    },
    {
        "name": "The Devil",
        "meaning": "Attachments, habits, temptation and recognizing limiting patterns.",
    },
    {
        "name": "The Tower",
        "meaning": "Sudden change, disruption and breaking down old structures.",
    },
    {
        "name": "The Star",
        "meaning": "Hope, inspiration, renewal and optimism.",
    },
    {
        "name": "The Moon",
        "meaning": "Intuition, uncertainty, dreams and looking beyond appearances.",
    },
    {
        "name": "The Sun",
        "meaning": "Joy, clarity, confidence, success and positive energy.",
    },
    {
        "name": "Judgement",
        "meaning": "Reflection, awakening, realization and a meaningful decision.",
    },
    {
        "name": "The World",
        "meaning": "Completion, achievement, integration and a new chapter.",
    },
]


# =========================================================
# CREATE TAROT READING
# =========================================================

@router.post("/reading")
def create_tarot_reading(
    data: TarotReadingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # -----------------------------------------------------
    # Select 3 different cards
    # -----------------------------------------------------

    selected_cards = sample(
        TAROT_CARDS,
        3
    )

    positions = [
        "Past",
        "Present",
        "Future",
    ]

    # -----------------------------------------------------
    # Save reading in database
    # -----------------------------------------------------

    reading = TarotReading(
        user_id=current_user.id,

        question=data.question,

        topic=data.topic,

        spread="Three Card Reading",

        past_card=selected_cards[0]["name"],
        past_meaning=selected_cards[0]["meaning"],

        present_card=selected_cards[1]["name"],
        present_meaning=selected_cards[1]["meaning"],

        future_card=selected_cards[2]["name"],
        future_meaning=selected_cards[2]["meaning"],
    )

    db.add(reading)

    db.commit()

    db.refresh(reading)

    # -----------------------------------------------------
    # Prepare response for frontend
    # -----------------------------------------------------

    cards = []

    for position, card in zip(
        positions,
        selected_cards,
    ):
        cards.append(
            {
                "position": position,
                "name": card["name"],
                "meaning": card["meaning"],
            }
        )

    return {
        "message": "Tarot reading created successfully.",

        "id": reading.id,

        "user_id": current_user.id,

        "question": reading.question,

        "topic": reading.topic,

        "spread": reading.spread,

        "cards": cards,

        "created_at": reading.created_at,
    }


# =========================================================
# GET CURRENT USER'S TAROT READINGS
# =========================================================

@router.get("/readings")
def get_my_tarot_readings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    readings = (
        db.query(TarotReading)
        .filter(
            TarotReading.user_id == current_user.id
        )
        .order_by(
            TarotReading.created_at.desc()
        )
        .all()
    )

    results = []

    for reading in readings:

        results.append(
            {
                "id": reading.id,

                "user_id": reading.user_id,

                "question": reading.question,

                "topic": reading.topic,

                "spread": reading.spread,

                "cards": [
                    {
                        "position": "Past",
                        "name": reading.past_card,
                        "meaning": reading.past_meaning,
                    },
                    {
                        "position": "Present",
                        "name": reading.present_card,
                        "meaning": reading.present_meaning,
                    },
                    {
                        "position": "Future",
                        "name": reading.future_card,
                        "meaning": reading.future_meaning,
                    },
                ],

                "created_at": reading.created_at,
            }
        )

    return {
        "count": len(results),
        "readings": results,
    }