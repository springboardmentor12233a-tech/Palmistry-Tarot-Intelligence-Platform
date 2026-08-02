import os
import json
import random

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "tarot")
JSON_PATH = os.path.join(DATA_DIR, "tarot-images.json")
IMAGES_DIR = os.path.join(DATA_DIR, "cards")

with open(JSON_PATH, encoding="utf-8") as f:
    _tarot_data = json.load(f)

CARDS = _tarot_data["cards"]

SPREADS = {
    "single": ["Focus"],
    "three_card": ["Past", "Present", "Future"]
}


def draw_spread(spread_type="three_card"):
    if spread_type not in SPREADS:
        raise ValueError(f"Unknown spread type: {spread_type}")

    positions = SPREADS[spread_type]
    drawn_cards = random.sample(CARDS, len(positions))

    spread = []
    for position, card in zip(positions, drawn_cards):
        reversed_ = random.choice([True, False])
        spread.append({
            "position": position,
            "name": card["name"],
            "reversed": reversed_,
            "image_filename": card["img"],
            "keywords": card["keywords"],
            "meaning": card["meanings"]["shadow"] if reversed_ else card["meanings"]["light"]
        })

    return spread