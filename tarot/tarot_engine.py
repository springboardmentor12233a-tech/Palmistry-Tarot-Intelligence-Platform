import random

from .tarot_data import load_tarot_cards


def draw_three_cards():
    """
    Draw three unique cards from the 78-card Tarot deck.

    Positions:
    1. Past
    2. Present
    3. Future
    """

    deck = load_tarot_cards()

    # Shuffle the deck
    shuffled_deck = deck.copy()
    random.shuffle(shuffled_deck)

    # Select three unique cards
    selected_cards = shuffled_deck[:3]

    positions = ["Past", "Present", "Future"]

    reading = []

    for position, card in zip(positions, selected_cards):

        # Randomly determine light/shadow interpretation
        orientation = random.choice(["light", "shadow"])

        reading.append({
            "position": position,
            "card": card,
            "orientation": orientation
        })

    return reading