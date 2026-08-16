from typing import Any

from .loader import load_hand_info, load_tarot_df


def get_hand_demographics() -> dict[str, Any]:
    """Calculate hand dataset demographics for executive overview."""
    df = load_hand_info()
    total_records = len(df)
    age_dist = df["age"].dropna().tolist() if "age" in df.columns else []
    gender_counts = df["gender"].value_counts().to_dict() if "gender" in df.columns else {}
    skin_counts = df["skinColor"].value_counts().to_dict() if "skinColor" in df.columns else {}
    aspect_counts = df["aspectOfHand"].value_counts().to_dict() if "aspectOfHand" in df.columns else {}
    missing_count = int(df.isnull().sum().sum())

    return {
        "total_records": total_records,
        "age_distribution": age_dist,
        "gender_counts": gender_counts,
        "skin_color_counts": skin_counts,
        "aspect_counts": aspect_counts,
        "missing_count": missing_count,
    }


def get_tarot_stats() -> dict[str, Any]:
    """Calculate tarot card dataset metrics for executive overview."""
    df = load_tarot_df()
    if df.empty:
        return {"total_cards": 0, "arcana_counts": {}, "suit_counts": {}}

    total_cards = len(df)
    arcana_counts = df["arcana"].value_counts().to_dict() if "arcana" in df.columns else {}
    suit_counts = df["suit"].value_counts().to_dict() if "suit" in df.columns else {}

    return {
        "total_cards": total_cards,
        "arcana_counts": arcana_counts,
        "suit_counts": suit_counts,
    }
