import logging
from pathlib import Path

import requests
from PIL import Image

from ..config import settings
from ..data.loader import load_tarot_json

logger = logging.getLogger(__name__)

# Sacred-Texts Rider-Waite filename mapping helper
def _map_img_to_sacred_texts(img_filename: str) -> str:
    """Map datasets/tarot-images.json img filename to sacred-texts PKT filename."""
    if not img_filename or len(img_filename) < 3:
        return "ar00.jpg"

    prefix = img_filename[0].lower()
    num_str = img_filename[1:3]

    if prefix == "m":
        return f"ar{num_str}.jpg"

    st_suit_map = {"w": "wa", "c": "cu", "s": "sw", "p": "pe"}
    st_suit = st_suit_map.get(prefix, "wa")

    if num_str == "01":
        return f"{st_suit}ac.jpg"
    elif num_str == "11":
        return f"{st_suit}pa.jpg"
    elif num_str == "12":
        return f"{st_suit}kn.jpg"
    elif num_str == "13":
        return f"{st_suit}qu.jpg"
    elif num_str == "14":
        return f"{st_suit}ki.jpg"
    else:
        return f"{st_suit}{num_str}.jpg"


def download_real_tarot_artwork(img_filename: str, target_path: Path) -> bool:
    """Download authentic Rider-Waite-Smith artwork JPEG from public domain repository."""
    st_filename = _map_img_to_sacred_texts(img_filename)
    url = f"https://sacred-texts.com/tarot/pkt/img/{st_filename}"

    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200 and len(r.content) > 5000:
            target_path.parent.mkdir(parents=True, exist_ok=True)
            with open(target_path, "wb") as f:
                f.write(r.content)
            logger.info(f"Downloaded authentic Rider-Waite artwork for {img_filename} ({url}).")
            return True
        else:
            logger.warning(f"Failed to fetch tarot image from {url}: HTTP {r.status_code}")
    except Exception as e:
        logger.warning(f"Network error downloading tarot image {url}: {e}")

    return False


def ensure_all_tarot_assets_exist() -> int:
    """Ensure all 78 real Rider-Waite tarot card images exist in local asset folder."""
    data = load_tarot_json()
    cards = data.get("cards", [])
    downloaded_count = 0

    for card in cards:
        img_filename = card.get("img", "")
        if not img_filename:
            continue
        card_file_path = settings.TAROT_ASSETS_DIR / img_filename
        if not card_file_path.exists() or card_file_path.stat().st_size < 5000:
            if download_real_tarot_artwork(img_filename, card_file_path):
                downloaded_count += 1

    return downloaded_count


def get_card_image_path(img_filename: str) -> Path:
    """Get file path of real card image asset, downloading if missing."""
    target_path = settings.TAROT_ASSETS_DIR / img_filename
    if not target_path.exists() or target_path.stat().st_size < 5000:
        download_real_tarot_artwork(img_filename, target_path)
    return target_path


def get_card_pil_image(img_filename: str, orientation: str = "Upright") -> Image.Image:
    """Load authentic card artwork PIL image, rotated 180 deg if Reversed."""
    image_path = get_card_image_path(img_filename)
    img = Image.open(image_path)
    if orientation.lower() == "reversed":
        img = img.rotate(180)
    return img
