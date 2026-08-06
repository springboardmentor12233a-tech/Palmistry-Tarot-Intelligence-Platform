import json
import random
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

from app.models.tarot_schemas import (
    DrawnTarotCard,
    TarotDrawRequest,
)


TAROT_DATA_PATH = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "tarot-images.json"
)


SPREAD_POSITIONS = {
    "Single Card": [
        "Guidance",
    ],
    "Past-Present-Future": [
        "Past",
        "Present",
        "Future",
    ],
}


def convert_to_string_list(value: Any) -> List[str]:
    """
    Convert a JSON value into a cleaned list of strings.
    """

    if value is None:
        return []

    if isinstance(value, str):
        cleaned_value = value.strip()

        return [cleaned_value] if cleaned_value else []

    if isinstance(value, list):
        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

    return [str(value).strip()]


@lru_cache(maxsize=1)
def load_tarot_dataset() -> List[Dict[str, Any]]:
    """
    Load and validate the tarot dataset.

    The loader supports either:

    1. A JSON list containing cards directly
    2. A JSON object containing a 'cards' list
    """

    if not TAROT_DATA_PATH.exists():
        raise FileNotFoundError(
            "Tarot dataset was not found at: "
            f"{TAROT_DATA_PATH}"
        )

    try:
        with TAROT_DATA_PATH.open(
            "r",
            encoding="utf-8",
        ) as file:
            dataset = json.load(file)

    except json.JSONDecodeError as error:
        raise ValueError(
            "tarot-images.json contains invalid JSON."
        ) from error

    if isinstance(dataset, list):
        cards = dataset

    elif (
        isinstance(dataset, dict)
        and isinstance(dataset.get("cards"), list)
    ):
        cards = dataset["cards"]

    else:
        raise ValueError(
            "The tarot dataset must either be a list of "
            "cards or an object containing a 'cards' list."
        )

    valid_cards = []

    for card in cards:
        if not isinstance(card, dict):
            continue

        card_name = str(card.get("name", "")).strip()
        meanings = card.get("meanings", {})

        if not card_name:
            continue

        if not isinstance(meanings, dict):
            continue

        light_meanings = convert_to_string_list(
            meanings.get("light")
        )

        shadow_meanings = convert_to_string_list(
            meanings.get("shadow")
        )

        if not light_meanings or not shadow_meanings:
            continue

        valid_cards.append(card)

    if not valid_cards:
        raise ValueError(
            "No valid tarot cards were found in the dataset."
        )

    return valid_cards


def select_card_meaning(
    card: Dict[str, Any],
    orientation: str,
) -> str:
    """
    Upright cards use meanings.light.
    Reversed cards use meanings.shadow.
    """

    meanings = card.get("meanings", {})

    meaning_type = (
        "light"
        if orientation == "upright"
        else "shadow"
    )

    available_meanings = convert_to_string_list(
        meanings.get(meaning_type)
    )

    if not available_meanings:
        raise ValueError(
            f"No {meaning_type} meaning was found for "
            f"{card.get('name', 'Unknown card')}."
        )

    return random.choice(available_meanings)


def create_drawn_card(
    card: Dict[str, Any],
    position: str,
) -> DrawnTarotCard:
    """
    Convert one dataset card into the API response format.
    """

    orientation = random.choice(
        [
            "upright",
            "reversed",
        ]
    )

    selected_meaning = select_card_meaning(
        card,
        orientation,
    )

    keywords = convert_to_string_list(
        card.get("keywords")
    )

    number_value = card.get("number")
    arcana_value = card.get("arcana")
    suit_value = card.get("suit")
    image_value = card.get("img", card.get("image"))

    return DrawnTarotCard(
        position=position,
        name=str(card.get("name", "")).strip(),
        orientation=orientation,
        keywords=keywords,
        selected_meaning=selected_meaning,
        number=(
            str(number_value)
            if number_value is not None
            else None
        ),
        arcana=(
            str(arcana_value)
            if arcana_value is not None
            else None
        ),
        suit=(
            str(suit_value)
            if suit_value is not None
            else None
        ),
        image=(
            str(image_value)
            if image_value is not None
            else None
        ),
    )


def draw_tarot_cards(
    draw_request: TarotDrawRequest,
) -> List[DrawnTarotCard]:
    """
    Draw tarot cards without replacement.
    """

    positions = SPREAD_POSITIONS.get(
        draw_request.spread
    )

    if positions is None:
        raise ValueError(
            f"Unsupported tarot spread: "
            f"{draw_request.spread}"
        )

    tarot_cards = load_tarot_dataset()
    required_card_count = len(positions)

    if len(tarot_cards) < required_card_count:
        raise ValueError(
            "The tarot dataset does not contain enough "
            "valid cards for the selected spread."
        )

    selected_cards = random.sample(
        tarot_cards,
        required_card_count,
    )

    return [
        create_drawn_card(
            card=card,
            position=position,
        )
        for card, position in zip(
            selected_cards,
            positions,
        )
    ]


def get_tarot_dataset_count() -> int:
    """
    Return the number of usable cards in the dataset.
    """

    return len(load_tarot_dataset())