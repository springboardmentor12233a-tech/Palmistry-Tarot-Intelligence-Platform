from random import sample

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(
    prefix="/api/tarot",
    tags=["Tarot"],
)


class TarotReadingRequest(BaseModel):
    question: str
    topic: str


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


@router.post("/reading")
def create_tarot_reading(data: TarotReadingRequest):

    selected_cards = sample(TAROT_CARDS, 3)

    positions = ["Past", "Present", "Future"]

    cards = []

    for position, card in zip(positions, selected_cards):
        cards.append(
            {
                "position": position,
                "name": card["name"],
                "meaning": card["meaning"],
            }
        )

    return {
        "question": data.question,
        "topic": data.topic,
        "spread": "Three Card Reading",
        "cards": cards,
    }