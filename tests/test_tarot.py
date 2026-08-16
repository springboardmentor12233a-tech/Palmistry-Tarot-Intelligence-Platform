import pytest

from palmtarot.tarot_engine.deck import TarotDeck


def test_tarot_deck_initialization():
    deck = TarotDeck()
    assert len(deck.df) > 0


def test_draw_cards_valid_count():
    deck = TarotDeck()
    cards_1 = deck.draw_cards(num_cards=1, seed=42)
    assert len(cards_1) == 1
    assert cards_1[0]["position"] == "General Reading"
    assert cards_1[0]["orientation"] in ["Upright", "Reversed"]

    cards_3 = deck.draw_cards(num_cards=3, seed=42)
    assert len(cards_3) == 3
    assert [c["position"] for c in cards_3] == ["Past", "Present", "Future"]


def test_draw_cards_no_duplicates():
    deck = TarotDeck()
    cards = deck.draw_cards(num_cards=5, seed=123)
    card_names = [c["name"] for c in cards]
    assert len(card_names) == len(set(card_names))


def test_draw_cards_invalid_count():
    deck = TarotDeck()
    with pytest.raises(ValueError):
        deck.draw_cards(num_cards=0)

    with pytest.raises(ValueError):
        deck.draw_cards(num_cards=1000)
