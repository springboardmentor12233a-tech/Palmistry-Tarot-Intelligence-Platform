import json
import logging
from pathlib import Path

import pandas as pd

from ..config import settings

logger = logging.getLogger(__name__)


def load_hand_info(csv_path: Path | None = None) -> pd.DataFrame:
    """Load hand info metadata CSV."""
    path = Path(csv_path) if csv_path else settings.HAND_INFO_CSV
    if not path.exists():
        logger.warning(f"Hand info CSV not found at {path}. Returning synthetic dataset.")
        return pd.DataFrame({
            "id": range(1, 101),
            "age": [20 + (i % 40) for i in range(100)],
            "gender": ["male" if i % 2 == 0 else "female" for i in range(100)],
            "skinColor": ["fair", "medium", "dark", "fair"][0:100],
            "aspectOfHand": ["dorsal right", "palmar right", "dorsal left", "palmar left"][0:100],
            "imageName": [f"Hand_{i:07d}.jpg" for i in range(1, 101)]
        })
    return pd.read_csv(path)


def load_tarot_json(json_path: Path | None = None) -> dict:
    """Load tarot cards JSON dataset."""
    path = Path(json_path) if json_path else settings.TAROT_JSON
    if not path.exists():
        logger.warning(f"Tarot JSON not found at {path}. Returning empty deck structure.")
        return {"cards": []}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_tarot_df(json_path: Path | None = None) -> pd.DataFrame:
    """Load tarot dataset as pandas DataFrame."""
    data = load_tarot_json(json_path)
    cards = data.get("cards", [])
    if not cards:
        return pd.DataFrame()
    return pd.DataFrame(cards)
