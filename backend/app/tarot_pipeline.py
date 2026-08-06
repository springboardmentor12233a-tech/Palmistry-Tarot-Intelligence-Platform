import os
import json
import random

# --------------------------------------------------
# Paths
# --------------------------------------------------

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "tarot")
JSON_PATH = os.path.join(DATA_DIR, "tarot-images.json")
IMAGES_DIR = os.path.join(DATA_DIR, "cards")

# --------------------------------------------------
# Load Tarot Cards
# --------------------------------------------------

with open(JSON_PATH, encoding="utf-8") as f:
    tarot_data = json.load(f)

CARDS = tarot_data["cards"]

# --------------------------------------------------
# Supported Spreads
# --------------------------------------------------

SPREADS = {
    "single_card": ["Focus"],
    "three_card": ["Past", "Present", "Future"],
}

# --------------------------------------------------
# Draw Cards
# --------------------------------------------------

def draw_spread(spread_type="three_card"):
    """
    Draw tarot cards based on the selected spread.

    Supported spreads:
    - single_card
    - three_card
    """

    # Backward compatibility
    if spread_type == "single":
        spread_type = "single_card"

    if spread_type not in SPREADS:
        raise ValueError(f"Unknown spread type: {spread_type}")

    positions = SPREADS[spread_type]

    drawn_cards = random.sample(CARDS, len(positions))

    spread = []

    for position, card in zip(positions, drawn_cards):

        reversed_card = random.choice([True, False])

        spread.append(
            {
                "position": position,
                "name": card["name"],
                "reversed": reversed_card,
                "image_filename": card["img"],
                "keywords": card["keywords"],
                "meaning": (
                    card["meanings"]["shadow"]
                    if reversed_card
                    else card["meanings"]["light"]
                ),
            }
        )

    return spread