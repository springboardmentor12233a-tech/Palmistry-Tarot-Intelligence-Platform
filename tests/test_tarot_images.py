from pathlib import Path

from PIL import Image

from palmtarot.assets.card_loader import get_card_image_path, get_card_pil_image
from palmtarot.data.loader import load_tarot_json
from palmtarot.tarot_engine.deck import TarotDeck


def test_tarot_draw_includes_card_images():
    deck = TarotDeck()
    cards = deck.draw_cards(num_cards=3, seed=42)

    assert len(cards) == 3
    for card in cards:
        assert "img" in card
        assert "img_path" in card
        assert "img_url" in card
        assert card["img"].endswith(".jpg")
        assert Path(card["img_path"]).exists()


def test_get_card_pil_image_upright_and_reversed():
    img_filename = "m00.jpg"

    # Upright image
    img_upright = get_card_pil_image(img_filename, orientation="Upright")
    assert isinstance(img_upright, Image.Image)

    # Reversed image (rotated 180 deg)
    img_reversed = get_card_pil_image(img_filename, orientation="Reversed")
    assert isinstance(img_reversed, Image.Image)


def test_all_78_cards_map_to_unique_real_artwork_images():
    data = load_tarot_json()
    cards = data.get("cards", [])
    assert len(cards) == 78

    image_paths = set()
    for card in cards:
        img_name = card.get("img")
        assert img_name is not None
        img_path = get_card_image_path(img_name)
        assert img_path.exists(), f"Image path missing for card {card.get('name')}"
        # Ensure file size is > 10KB (real JPEG artwork, not placeholder)
        assert img_path.stat().st_size > 10000, f"Image file {img_name} is too small for real artwork"
        image_paths.add(img_path)

    # Ensure all 78 cards map to unique artwork image files
    assert len(image_paths) == 78
