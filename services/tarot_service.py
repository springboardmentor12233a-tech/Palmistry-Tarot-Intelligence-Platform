"""
Tarot service — adapted from Tarot_engine.ipynb / tarot_analysis.ipynb.

Loads the tarot deck JSON and produces card draws + readable interpretations.
Pure functions only (no I/O side effects besides the initial file load), so
they're easy to unit test.
"""

import json
import random
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=4)
def load_deck(tarot_deck_path: str) -> list[dict]:
    """Load and cache the tarot deck JSON. Cached so repeated API calls
    don't re-read the file from disk every request."""
    path = Path(tarot_deck_path)
    if not path.exists():
        raise FileNotFoundError(f"Tarot deck JSON not found at: {tarot_deck_path}")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    return data["cards"]


def get_card_interpretation(card: dict, upright: bool = True) -> dict:
    """Build readable interpretation text for a single card."""
    orientation = "Upright" if upright else "Reversed"
    meaning_list = card["meanings"]["light"] if upright else card["meanings"]["shadow"]
    meaning_text = "; ".join(meaning_list[:4])
    keyword_text = ", ".join(card["keywords"][:4])

    return {
       "card_name": card["name"],
       "orientation": orientation,
       "keywords": keyword_text,
       "meaning": meaning_text,
       "img": card["img"],
    }


def draw_cards(deck: list[dict], n: int, seed: int | None = None) -> list[tuple[dict, bool]]:
    """Randomly draw n unique cards, each randomly upright or reversed."""
    rng = random.Random(seed)
    chosen = rng.sample(deck, n)
    return [(card, rng.choice([True, False])) for card in chosen]


def generate_reading_text(drawn_cards: list[tuple[dict, bool]], positions: list[str] | None = None) -> str:
    """Generate the full formatted reading text (used for the LLM prompt and PDF)."""
    lines = []
    for i, (card, upright) in enumerate(drawn_cards):
        interp = get_card_interpretation(card, upright)
        position_label = positions[i] if positions else f"Card {i + 1}"
        lines.append(f"<{position_label}: {interp['card_name']} ({interp['orientation']})>")
        lines.append(f"Keywords: {interp['keywords']}")
        lines.append(f"Meaning: {interp['meaning']}")
        lines.append("")
    return "\n".join(lines)


def get_cards_drawn_list(drawn_cards: list[tuple[dict, bool]]) -> list[dict]:
    """Structured version of the draw, used by the dashboard PDF's 'Source Data' section."""
    return [get_card_interpretation(card, upright) for card, upright in drawn_cards]


def generate_tarot_reading(tarot_deck_path: str, spread_size: int = 3, seed: int | None = None) -> dict:
    """High-level entry point the reading_service calls."""
    deck = load_deck(tarot_deck_path)
    positions = ["Past", "Present", "Future"] if spread_size == 3 else None
    drawn = draw_cards(deck, spread_size, seed=seed)
    return {
        "tarot_text": generate_reading_text(drawn, positions=positions),
        "cards_drawn": get_cards_drawn_list(drawn),
        "tarot_source": "template",
    }
