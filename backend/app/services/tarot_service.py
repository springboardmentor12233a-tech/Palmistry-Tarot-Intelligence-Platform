import json
import os
import random

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "tarot_images.json")

SUIT_SYMBOL = {
    "Trump": "star",
    "Wands": "flame",
    "Cups": "chalice",
    "Swords": "blade",
    "Pentacles": "coin",
}

# Each spread carries its position labels plus a normalized (x%, y%, rotation deg)
# layout so the frontend can lay cards out spatially instead of a flat row -
# the Celtic Cross in particular uses its traditional cross-and-staff shape.
SPREADS = {
    "single": {
        "label": "Single Card",
        "positions": [
            {"name": "Guidance", "x": 50, "y": 50, "r": 0},
        ],
    },
    "three": {
        "label": "Past · Present · Future",
        "positions": [
            {"name": "Past", "x": 20, "y": 50, "r": 0},
            {"name": "Present", "x": 50, "y": 50, "r": 0},
            {"name": "Future", "x": 80, "y": 50, "r": 0},
        ],
    },
    "relationship": {
        "label": "Relationship",
        "positions": [
            {"name": "You", "x": 25, "y": 30, "r": 0},
            {"name": "Them", "x": 75, "y": 30, "r": 0},
            {"name": "The Connection", "x": 50, "y": 55, "r": 0},
            {"name": "Path Forward", "x": 50, "y": 85, "r": 0},
        ],
    },
    "career": {
        "label": "Career",
        "positions": [
            {"name": "Current Path", "x": 15, "y": 50, "r": 0},
            {"name": "Obstacle", "x": 40, "y": 50, "r": 0},
            {"name": "Strength", "x": 65, "y": 50, "r": 0},
            {"name": "Outcome", "x": 90, "y": 50, "r": 0},
        ],
    },
    "celtic_cross": {
        "label": "Celtic Cross",
        "positions": [
            {"name": "Present", "x": 38, "y": 50, "r": 0},
            {"name": "Challenge", "x": 38, "y": 50, "r": 90},
            {"name": "Foundation", "x": 38, "y": 78, "r": 0},
            {"name": "Recent Past", "x": 14, "y": 50, "r": 0},
            {"name": "Crown", "x": 38, "y": 22, "r": 0},
            {"name": "Near Future", "x": 62, "y": 50, "r": 0},
            {"name": "Attitude", "x": 88, "y": 84, "r": 0},
            {"name": "External Influence", "x": 88, "y": 60, "r": 0},
            {"name": "Hopes & Fears", "x": 88, "y": 36, "r": 0},
            {"name": "Outcome", "x": 88, "y": 12, "r": 0},
        ],
    },
    "life_path": {
        "label": "Life Path",
        "positions": [
            {"name": "Where You've Been", "x": 15, "y": 50, "r": 0},
            {"name": "Where You Are", "x": 40, "y": 40, "r": 0},
            {"name": "Lesson", "x": 65, "y": 40, "r": 0},
            {"name": "Where You're Going", "x": 90, "y": 50, "r": 0},
        ],
    },
}

_deck = None


def load_deck():
    global _deck
    if _deck is None:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            raw = json.load(f)["cards"]
        deck = []
        for c in raw:
            deck.append({
                "name": c["name"],
                "number": c["number"],
                "arcana": "Major" if c["arcana"] == "Major Arcana" else "Minor",
                "suit": c["suit"],
                "symbol": SUIT_SYMBOL.get(c["suit"], "star"),
                "img": f"/images/tarot-cards/{c['img']}" if c.get("img") else None,
                "keywords": c.get("keywords", []),
                "fortune_telling": c.get("fortune_telling", []),
                "archetype": c.get("Archetype"),
                "affirmation": c.get("Affirmation"),
                "meanings": {
                    "upright": c.get("meanings", {}).get("light", []),
                    "reversed": c.get("meanings", {}).get("shadow", []),
                },
            })
        _deck = deck
    return _deck


def get_spreads():
    return {
        key: {
            "label": v["label"],
            "positions": [p["name"] for p in v["positions"]],
            "layout": v["positions"],
        }
        for key, v in SPREADS.items()
    }


def _build_result(layout, cards):
    result = []
    for position, card in zip(layout["positions"], cards):
        reversed_ = random.random() < 0.25
        meanings = card["meanings"]["reversed"] if reversed_ else card["meanings"]["upright"]
        result.append({
            "position": position["name"],
            "x": position["x"],
            "y": position["y"],
            "r": position["r"],
            "name": card["name"],
            "number": card["number"],
            "arcana": card["arcana"],
            "suit": card["suit"],
            "symbol": card["symbol"],
            "img": card.get("img"),
            "keywords": card["keywords"],
            "archetype": card["archetype"],
            "reversed": reversed_,
            "meanings": meanings,
        })
    return result


def draw_spread(spread: str):
    """Fully random draw - kept for a 'surprise me' shortcut."""
    layout = SPREADS.get(spread, SPREADS["three"])
    deck = load_deck()
    drawn_cards = random.sample(deck, len(layout["positions"]))
    return _build_result(layout, drawn_cards)


def draw_selected(spread: str, card_names: list[str]):
    """
    Build a reading from cards the user themselves picked (by name) from a
    face-down spread in the UI. Raises ValueError on any mismatch so the
    router can turn it into a clean 400.
    """
    layout = SPREADS.get(spread)
    if layout is None:
        raise ValueError("Unknown spread type")

    expected = len(layout["positions"])
    if len(card_names) != expected:
        raise ValueError(f"This spread needs exactly {expected} cards, got {len(card_names)}")

    if len(set(card_names)) != len(card_names):
        raise ValueError("The same card was picked more than once")

    deck_by_name = {c["name"]: c for c in load_deck()}
    missing = [n for n in card_names if n not in deck_by_name]
    if missing:
        raise ValueError(f"Unknown card(s): {', '.join(missing)}")

    chosen_cards = [deck_by_name[n] for n in card_names]
    return _build_result(layout, chosen_cards)
