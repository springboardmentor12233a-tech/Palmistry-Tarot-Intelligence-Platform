import json
from pathlib import Path


# Location of the Tarot dataset
DATA_FILE = Path(__file__).parent / "tarot-images.json"


def load_tarot_cards():
    """Load the 78 Tarot cards from the JSON dataset."""

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data["cards"]


def get_card_by_name(card_name):
    """Find a Tarot card by its name."""

    cards = load_tarot_cards()

    for card in cards:
        if card["name"].lower() == card_name.lower():
            return card

    return None