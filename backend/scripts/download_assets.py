"""
Asset Downloader for Palmistry & Tarot Intelligence Platform.
Downloads:
1. UNet Palm line segmentation model checkpoint
2. MediaPipe Hand Landmarker model
3. Tarot dataset (tarot-images.json)
4. Tarot card images (78 cards)
"""
import os
import json
import urllib.request
import concurrent.futures
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR / "assets"
CARDS_DIR = ASSETS_DIR / "cards"

ASSETS = {
    "checkpoint_aug_epoch70.pth": "https://raw.githubusercontent.com/yeonsumia/palmistry/main/code/checkpoint/checkpoint_aug_epoch70.pth",
    "hand_landmarker.task": "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
    "tarot-images.json": "https://raw.githubusercontent.com/tztechno/streamlit-tarrot-reading/master/tarot-images.json",
}

CARD_BASE_URL = "https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/"


def download_file(url: str, dest_path: Path, min_size: int = 100):
    if dest_path.exists() and dest_path.stat().st_size >= min_size:
        print(f"[OK] {dest_path.name} already exists ({dest_path.stat().st_size} bytes)")
        return True
    print(f"[DOWNLOADING] {dest_path.name} from {url}...")
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            content = resp.read()
            with open(dest_path, "wb") as f:
                f.write(content)
        print(f"[SUCCESS] Downloaded {dest_path.name} ({len(content)} bytes)")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to download {dest_path.name}: {e}")
        return False


def download_card(card_img: str):
    card_path = CARDS_DIR / card_img
    card_url = f"{CARD_BASE_URL}{card_img}"
    return download_file(card_url, card_path, min_size=500)


def main():
    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    CARDS_DIR.mkdir(parents=True, exist_ok=True)

    print("=== Downloading Base Assets ===")
    for filename, url in ASSETS.items():
        min_sz = 1000 if filename.endswith(".json") else 1000000
        download_file(url, ASSETS_DIR / filename, min_size=min_sz)

    tarot_json_path = ASSETS_DIR / "tarot-images.json"
    if tarot_json_path.exists():
        with open(tarot_json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        cards = data.get("cards", [])
        print(f"\n=== Downloading {len(cards)} Tarot Card Images in parallel ===")
        img_names = [card["img"] for card in cards if "img" in card]
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(download_card, img_names))
        print(f"Downloaded/Verified {sum(1 for r in results if r)} of {len(img_names)} card images.")


if __name__ == "__main__":
    main()
