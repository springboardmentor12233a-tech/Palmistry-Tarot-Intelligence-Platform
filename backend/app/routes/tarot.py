from datetime import datetime, timedelta
from random import sample

from fastapi import APIRouter, Depends, HTTPException
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
# TAROT CARD IMAGE MAPPING
# =========================================================

TAROT_CARD_IMAGES = {

    # -----------------------------------------------------
    # MAJOR ARCANA
    # -----------------------------------------------------

    "The Fool": "m00.jpg",
    "The Magician": "m01.jpg",
    "The High Priestess": "m02.jpg",
    "The Empress": "m03.jpg",
    "The Emperor": "m04.jpg",
    "The Hierophant": "m05.jpg",
    "The Lovers": "m06.jpg",
    "The Chariot": "m07.jpg",
    "Strength": "m08.jpg",
    "The Hermit": "m09.jpg",
    "Wheel of Fortune": "m10.jpg",
    "Justice": "m11.jpg",
    "The Hanged Man": "m12.jpg",
    "Death": "m13.jpg",
    "Temperance": "m14.jpg",
    "The Devil": "m15.jpg",
    "The Tower": "m16.jpg",
    "The Star": "m17.jpg",
    "The Moon": "m18.jpg",
    "The Sun": "m19.jpg",
    "Judgement": "m20.jpg",
    "The World": "m21.jpg",

    # -----------------------------------------------------
    # CUPS
    # -----------------------------------------------------

    "Ace of Cups": "c01.jpg",
    "Two of Cups": "c02.jpg",
    "Three of Cups": "c03.jpg",
    "Four of Cups": "c04.jpg",
    "Five of Cups": "c05.jpg",
    "Six of Cups": "c06.jpg",
    "Seven of Cups": "c07.jpg",
    "Eight of Cups": "c08.jpg",
    "Nine of Cups": "c09.jpg",
    "Ten of Cups": "c10.jpg",
    "Page of Cups": "c11.jpg",
    "Knight of Cups": "c12.jpg",
    "Queen of Cups": "c13.jpg",
    "King of Cups": "c14.jpg",

    # -----------------------------------------------------
    # PENTACLES
    # -----------------------------------------------------

    "Ace of Pentacles": "p01.jpg",
    "Two of Pentacles": "p02.jpg",
    "Three of Pentacles": "p03.jpg",
    "Four of Pentacles": "p04.jpg",
    "Five of Pentacles": "p05.jpg",
    "Six of Pentacles": "p06.jpg",
    "Seven of Pentacles": "p07.jpg",
    "Eight of Pentacles": "p08.jpg",
    "Nine of Pentacles": "p09.jpg",
    "Ten of Pentacles": "p10.jpg",
    "Page of Pentacles": "p11.jpg",
    "Knight of Pentacles": "p12.jpg",
    "Queen of Pentacles": "p13.jpg",
    "King of Pentacles": "p14.jpg",

    # -----------------------------------------------------
    # SWORDS
    # -----------------------------------------------------

    "Ace of Swords": "s01.jpg",
    "Two of Swords": "s02.jpg",
    "Three of Swords": "s03.jpg",
    "Four of Swords": "s04.jpg",
    "Five of Swords": "s05.jpg",
    "Six of Swords": "s06.jpg",
    "Seven of Swords": "s07.jpg",
    "Eight of Swords": "s08.jpg",
    "Nine of Swords": "s09.jpg",
    "Ten of Swords": "s10.jpg",
    "Page of Swords": "s11.jpg",
    "Knight of Swords": "s12.jpg",
    "Queen of Swords": "s13.jpg",
    "King of Swords": "s14.jpg",

    # -----------------------------------------------------
    # WANDS
    # -----------------------------------------------------

    "Ace of Wands": "w01.jpg",
    "Two of Wands": "w02.jpg",
    "Three of Wands": "w03.jpg",
    "Four of Wands": "w04.jpg",
    "Five of Wands": "w05.jpg",
    "Six of Wands": "w06.jpg",
    "Seven of Wands": "w07.jpg",
    "Eight of Wands": "w08.jpg",
    "Nine of Wands": "w09.jpg",
    "Ten of Wands": "w10.jpg",
    "Page of Wands": "w11.jpg",
    "Knight of Wands": "w12.jpg",
    "Queen of Wands": "w13.jpg",
    "King of Wands": "w14.jpg",
}


# =========================================================
# TAROT KNOWLEDGE BASE
# =========================================================

TAROT_CARDS = [

    {
        "name": "The Fool",
        "meaning": (
            "New beginnings, curiosity, freedom and "
            "taking a leap of faith."
        ),
        "keywords": "New beginnings • Freedom • Curiosity • Adventure",
    },

    {
        "name": "The Magician",
        "meaning": (
            "Skill, confidence, action and the ability "
            "to turn ideas into reality."
        ),
        "keywords": "Skill • Confidence • Action • Manifestation",
    },

    {
        "name": "The High Priestess",
        "meaning": (
            "Intuition, inner wisdom, reflection and "
            "hidden knowledge."
        ),
        "keywords": "Intuition • Wisdom • Reflection • Mystery",
    },

    {
        "name": "The Empress",
        "meaning": (
            "Growth, creativity, abundance and "
            "nurturing energy."
        ),
        "keywords": "Growth • Creativity • Abundance • Nurturing",
    },

    {
        "name": "The Emperor",
        "meaning": (
            "Structure, leadership, stability and "
            "responsibility."
        ),
        "keywords": "Leadership • Structure • Stability • Authority",
    },

    {
        "name": "The Hierophant",
        "meaning": (
            "Tradition, learning, guidance and "
            "established values."
        ),
        "keywords": "Tradition • Learning • Guidance • Values",
    },

    {
        "name": "The Lovers",
        "meaning": (
            "Connection, choices, harmony and "
            "meaningful relationships."
        ),
        "keywords": "Connection • Choices • Harmony • Relationships",
    },

    {
        "name": "The Chariot",
        "meaning": (
            "Determination, direction, discipline and "
            "forward movement."
        ),
        "keywords": "Determination • Direction • Discipline • Progress",
    },

    {
        "name": "Strength",
        "meaning": (
            "Courage, patience, compassion and "
            "inner strength."
        ),
        "keywords": "Courage • Patience • Compassion • Inner Strength",
    },

    {
        "name": "The Hermit",
        "meaning": (
            "Introspection, solitude, wisdom and "
            "searching within."
        ),
        "keywords": "Introspection • Solitude • Wisdom • Reflection",
    },

    {
        "name": "Wheel of Fortune",
        "meaning": (
            "Change, cycles, opportunity and "
            "shifting circumstances."
        ),
        "keywords": "Change • Cycles • Opportunity • Destiny",
    },

    {
        "name": "Justice",
        "meaning": (
            "Balance, fairness, accountability and "
            "thoughtful decisions."
        ),
        "keywords": "Balance • Fairness • Accountability • Decisions",
    },

    {
        "name": "The Hanged Man",
        "meaning": (
            "Pause, surrender, perspective and "
            "seeing a situation differently."
        ),
        "keywords": "Pause • Perspective • Surrender • Reflection",
    },

    {
        "name": "Death",
        "meaning": (
            "Transformation, endings and the beginning "
            "of a new phase."
        ),
        "keywords": "Transformation • Endings • Renewal • Change",
    },

    {
        "name": "Temperance",
        "meaning": (
            "Balance, patience, moderation and "
            "harmonious integration."
        ),
        "keywords": "Balance • Patience • Moderation • Harmony",
    },

    {
        "name": "The Devil",
        "meaning": (
            "Attachments, habits, temptation and "
            "recognizing limiting patterns."
        ),
        "keywords": "Attachments • Habits • Temptation • Patterns",
    },

    {
        "name": "The Tower",
        "meaning": (
            "Sudden change, disruption and breaking "
            "down old structures."
        ),
        "keywords": "Change • Disruption • Release • Revelation",
    },

    {
        "name": "The Star",
        "meaning": (
            "Hope, inspiration, renewal and optimism."
        ),
        "keywords": "Hope • Inspiration • Renewal • Optimism",
    },

    {
        "name": "The Moon",
        "meaning": (
            "Intuition, uncertainty, dreams and "
            "looking beyond appearances."
        ),
        "keywords": "Intuition • Dreams • Uncertainty • Mystery",
    },

    {
        "name": "The Sun",
        "meaning": (
            "Joy, clarity, confidence, success and "
            "positive energy."
        ),
        "keywords": "Joy • Clarity • Confidence • Success",
    },

    {
        "name": "Judgement",
        "meaning": (
            "Reflection, awakening, realization and "
            "a meaningful decision."
        ),
        "keywords": "Awakening • Reflection • Realization • Decision",
    },

    {
        "name": "The World",
        "meaning": (
            "Completion, achievement, integration and "
            "a new chapter."
        ),
        "keywords": "Completion • Achievement • Integration • New Chapter",
    },
]


# =========================================================
# CARD HELPER
# =========================================================

def build_card_response(
    position,
    card_name,
    meaning,
    keywords,
    orientation,
):
    return {
        "position": position,
        "name": card_name,
        "orientation": orientation,
        "keywords": keywords,
        "meaning": meaning,
        "image_url": (
            f"/static/tarot/cards/"
            f"{TAROT_CARD_IMAGES.get(card_name, '')}"
        ),
    }


# =========================================================
# CREATE TAROT READING
# =========================================================

@router.post("/reading")
def create_tarot_reading(
    data: TarotReadingRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    question = data.question.strip()
    topic = data.topic.strip().lower()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question.",
        )

    if not topic:
        raise HTTPException(
            status_code=400,
            detail="Please select a topic.",
        )

    # -----------------------------------------------------
    # DUPLICATE PROTECTION
    # -----------------------------------------------------

    duplicate_window = (
        datetime.utcnow()
        - timedelta(seconds=30)
    )

    existing_reading = (
        db.query(TarotReading)
        .filter(
            TarotReading.user_id
            == current_user.id,
            TarotReading.question
            == question,
            TarotReading.topic
            == topic,
            TarotReading.created_at
            >= duplicate_window,
        )
        .order_by(
            TarotReading.created_at.desc()
        )
        .first()
    )

    if existing_reading:

        cards = [
            build_card_response(
                "Past",
                existing_reading.past_card,
                existing_reading.past_meaning,
                existing_reading.past_keywords,
                existing_reading.past_orientation,
            ),

            build_card_response(
                "Present",
                existing_reading.present_card,
                existing_reading.present_meaning,
                existing_reading.present_keywords,
                existing_reading.present_orientation,
            ),

            build_card_response(
                "Future",
                existing_reading.future_card,
                existing_reading.future_meaning,
                existing_reading.future_keywords,
                existing_reading.future_orientation,
            ),
        ]

        return {
            "message": (
                "Existing recent Tarot "
                "reading returned."
            ),

            "duplicate": True,

            "id": existing_reading.id,

            "user_id": existing_reading.user_id,

            "question": existing_reading.question,

            "topic": existing_reading.topic,

            "spread": existing_reading.spread,

            "cards": cards,

            "created_at": (
                existing_reading.created_at
            ),
        }

    # -----------------------------------------------------
    # SELECT THREE DIFFERENT CARDS
    # -----------------------------------------------------

    selected_cards = sample(
        TAROT_CARDS,
        3,
    )

    positions = [
        "Past",
        "Present",
        "Future",
    ]

    # -----------------------------------------------------
    # CURRENT VERSION
    # ALL CARDS ARE UPRIGHT
    # -----------------------------------------------------

    orientations = [
        "Upright",
        "Upright",
        "Upright",
    ]

    # -----------------------------------------------------
    # SAVE READING
    # -----------------------------------------------------

    reading = TarotReading(

        user_id=current_user.id,

        question=question,

        topic=topic,

        spread="Three Card Reading",

        past_card=selected_cards[0]["name"],

        past_orientation=orientations[0],

        past_keywords=selected_cards[0]["keywords"],

        past_meaning=selected_cards[0]["meaning"],

        present_card=selected_cards[1]["name"],

        present_orientation=orientations[1],

        present_keywords=selected_cards[1]["keywords"],

        present_meaning=selected_cards[1]["meaning"],

        future_card=selected_cards[2]["name"],

        future_orientation=orientations[2],

        future_keywords=selected_cards[2]["keywords"],

        future_meaning=selected_cards[2]["meaning"],
    )

    db.add(reading)

    db.commit()

    db.refresh(reading)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    cards = [

        build_card_response(
            "Past",
            reading.past_card,
            reading.past_meaning,
            reading.past_keywords,
            reading.past_orientation,
        ),

        build_card_response(
            "Present",
            reading.present_card,
            reading.present_meaning,
            reading.present_keywords,
            reading.present_orientation,
        ),

        build_card_response(
            "Future",
            reading.future_card,
            reading.future_meaning,
            reading.future_keywords,
            reading.future_orientation,
        ),
    ]

    return {

        "message": (
            "Tarot reading created successfully."
        ),

        "duplicate": False,

        "id": reading.id,

        "user_id": reading.user_id,

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
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    readings = (
        db.query(TarotReading)
        .filter(
            TarotReading.user_id
            == current_user.id
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

                    build_card_response(
                        "Past",
                        reading.past_card,
                        reading.past_meaning,
                        reading.past_keywords,
                        reading.past_orientation,
                    ),

                    build_card_response(
                        "Present",
                        reading.present_card,
                        reading.present_meaning,
                        reading.present_keywords,
                        reading.present_orientation,
                    ),

                    build_card_response(
                        "Future",
                        reading.future_card,
                        reading.future_meaning,
                        reading.future_keywords,
                        reading.future_orientation,
                    ),
                ],

                "created_at": (
                    reading.created_at
                ),
            }
        )

    return {
        "count": len(results),
        "readings": results,
    }


# =========================================================
# GET SINGLE TAROT READING
# =========================================================

@router.get("/readings/{reading_id}")
def get_tarot_reading(
    reading_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):

    reading = (
        db.query(TarotReading)
        .filter(
            TarotReading.id == reading_id,

            TarotReading.user_id
            == current_user.id,
        )
        .first()
    )

    if not reading:

        raise HTTPException(
            status_code=404,
            detail="Tarot reading not found.",
        )

    return {

        "id": reading.id,

        "user_id": reading.user_id,

        "question": reading.question,

        "topic": reading.topic,

        "spread": reading.spread,

        "cards": [

            build_card_response(
                "Past",
                reading.past_card,
                reading.past_meaning,
                reading.past_keywords,
                reading.past_orientation,
            ),

            build_card_response(
                "Present",
                reading.present_card,
                reading.present_meaning,
                reading.present_keywords,
                reading.present_orientation,
            ),

            build_card_response(
                "Future",
                reading.future_card,
                reading.future_meaning,
                reading.future_keywords,
                reading.future_orientation,
            ),
        ],

        "created_at": (
            reading.created_at
        ),

        "disclaimer": (
            "Tarot interpretations are provided "
            "for self-reflection and entertainment "
            "purposes only."
        ),
    }