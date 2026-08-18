import json
import os
import random
from pathlib import Path

from dotenv import load_dotenv
from google import genai


load_dotenv()


# ============================================================
# PATHS
# ============================================================

APP_DIR = Path(__file__).resolve().parent

TAROT_DATA_DIR = APP_DIR / "tarot_data"
TAROT_DATA_PATH = TAROT_DATA_DIR / "tarot.json"
TAROT_CARDS_DIR = TAROT_DATA_DIR / "tarot cards"


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY environment variable is not set."
    )

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ============================================================
# LOAD TAROT DATASET
# ============================================================

def load_tarot_cards():
    """
    Load the Tarot deck from tarot.json.

    Expected structure:

    {
        "description": "...",
        "cards": [...]
    }
    """

    if not TAROT_DATA_PATH.exists():
        raise FileNotFoundError(
            f"Tarot dataset not found at: {TAROT_DATA_PATH}"
        )

    with TAROT_DATA_PATH.open(
        "r",
        encoding="utf-8"
    ) as file:
        data = json.load(file)

    if not isinstance(data, dict):
        raise ValueError(
            "Tarot dataset must contain a JSON object."
        )

    cards = data.get("cards")

    if not isinstance(cards, list):
        raise ValueError(
            "Tarot dataset does not contain a valid 'cards' list."
        )

    if len(cards) < 3:
        raise ValueError(
            f"Tarot dataset contains only {len(cards)} cards. "
            "At least 3 cards are required."
        )

    return cards


# ============================================================
# DRAW THREE CARDS
# ============================================================

def draw_spread(cards, n=3):
    """
    Randomly draw cards without replacement.

    Each card receives a random orientation:
    Upright or Reversed.

    Returns:
        List of three Tarot cards.
    """

    if len(cards) < n:
        raise ValueError(
            f"Cannot draw {n} cards from a deck "
            f"containing only {len(cards)} cards."
        )

    drawn_cards = random.sample(cards, n)

    positions = [
        "Past",
        "Present",
        "Future",
    ]

    reading = []

    for index, card in enumerate(drawn_cards):

        is_reversed = random.choice(
            [True, False]
        )

        card_name = card.get(
            "name",
            "Unknown Card"
        )

        meanings = card.get(
            "meanings",
            {}
        )

        if is_reversed:
            meaning_list = meanings.get(
                "shadow",
                []
            )
        else:
            meaning_list = meanings.get(
                "light",
                []
            )

        if isinstance(meaning_list, list):
            meaning = "; ".join(
                str(item)
                for item in meaning_list[:3]
            )
        else:
            meaning = str(meaning_list)

        image_file = card.get("img")

        image_exists = False

        if image_file:
            image_path = (
                TAROT_CARDS_DIR
                / image_file
            )

            image_exists = image_path.exists()

        reading.append(
            {
                "position": positions[index],
                "card": card_name,
                "reversed": is_reversed,
                "orientation": (
                    "Reversed"
                    if is_reversed
                    else "Upright"
                ),
                "meaning": meaning,
                "image_file": image_file,
                "image_exists": image_exists,
            }
        )

    return reading


# ============================================================
# PUBLIC DRAW FUNCTION
# ============================================================

def draw_tarot_cards():
    """
    Draw a fresh three-card Tarot spread.

    This function DOES NOT call Gemini.
    """

    cards = load_tarot_cards()

    spread = draw_spread(
        cards,
        n=3
    )

    return {
        "success": True,
        "spread": spread,
    }


# ============================================================
# BUILD GEMINI PROMPT
# ============================================================

def build_tarot_prompt(
    question,
    spread,
    palm_reading=""
):
    """
    Build the prompt used for Gemini interpretation.
    """

    if not question or not question.strip():
        raise ValueError(
            "A question is required."
        )

    if not isinstance(spread, list):
        raise ValueError(
            "Tarot spread must be a list."
        )

    if len(spread) != 3:
        raise ValueError(
            "Tarot spread must contain exactly 3 cards."
        )

    cards_text = []

    for card in spread:

        cards_text.append(
            f"""
POSITION: {card.get("position", "Unknown")}
CARD: {card.get("card", "Unknown Card")}
ORIENTATION: {card.get("orientation", "Upright")}
DATASET MEANING: {card.get("meaning", "")}
""".strip()
        )

    tarot_information = "\n\n".join(
        cards_text
    )

    palm_information = (
        palm_reading.strip()
        if palm_reading
        else "No palm reading was provided."
    )

    prompt = f"""
You are the interpretation engine for Arcana AI,
an AI Palmistry and Tarot Intelligence platform.

The platform combines computer-vision palm analysis
with Tarot symbolism to provide reflective,
personalized insights.

USER QUESTION:
{question.strip()}

PALM READING:
{palm_information}

THREE CARD TAROT SPREAD:

{tarot_information}

Interpret the information above in a thoughtful,
concise and personalized way.

IMPORTANT RULES:

- Treat Tarot and palmistry as reflective entertainment,
  not factual prediction.
- Do not claim certainty about the user's future.
- Do not make medical, legal or financial claims.
- Do not invent Tarot meanings that contradict the
  supplied dataset meanings.
- Consider all three cards.
- Consider Past, Present and Future.
- Consider each card's orientation.
- If a palm reading is provided, connect it naturally
  with the Tarot reading.
- If no palm reading is provided, focus only on Tarot.
- Answer the user's question directly.
- Do not use Markdown.
- Do not use hashtags.
- Do not use tables.
- Do not add an extra disclaimer.

Return EXACTLY these sections:

OVERALL INSIGHT

A concise synthesis of the complete reading.

PALM INSIGHT

Explain the relevant palm-reading themes.
If no palm reading is provided, say:
"No palm reading was provided for this reading."

TAROT INSIGHT

Interpret the three cards together according to
their positions and orientations.

WHAT THIS MEANS FOR YOU

Give practical reflective meaning connected
to the user's question.

KEY GUIDANCE

Provide exactly 3 short actionable points.
""".strip()

    return prompt


# ============================================================
# GEMINI INTERPRETATION
# ============================================================

def generate_tarot_interpretation(
    question,
    spread,
    palm_reading=""
):
    """
    Generate the Tarot interpretation using Gemini.

    Uses Gemini 3.6 Flash first.
    If Gemini temporarily returns a 503/5xx error,
    retry with Gemini 2.5 Flash.
    """

    import time

    prompt = build_tarot_prompt(
        question=question,
        spread=spread,
        palm_reading=palm_reading,
    )

    models = [
        "gemini-3.6-flash",
        "gemini-2.5-flash",
    ]

    last_error = None

    for model_name in models:

        for attempt in range(3):

            try:

                print(
                    f"Gemini request: "
                    f"{model_name} "
                    f"(attempt {attempt + 1}/3)"
                )

                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )

                if not response.text:
                    raise RuntimeError(
                        "Gemini returned an empty response."
                    )

                print(
                    f"Gemini success: {model_name}"
                )

                return response.text.strip()

            except Exception as exc:

                last_error = exc

                error_text = str(exc)

                print(
                    f"Gemini error from "
                    f"{model_name}: {error_text}"
                )

                # Retry temporary server problems.
                if (
                    "503" in error_text
                    or "UNAVAILABLE" in error_text
                    or "500" in error_text
                    or "502" in error_text
                    or "504" in error_text
                ):

                    # Exponential backoff:
                    # 2 sec → 4 sec → 8 sec
                    wait_time = 2 ** (
                        attempt + 1
                    )

                    print(
                        f"Temporary Gemini error. "
                        f"Retrying in "
                        f"{wait_time} seconds..."
                    )

                    time.sleep(
                        wait_time
                    )

                    continue

                # Do not retry authentication,
                # invalid request, etc.
                raise RuntimeError(
                    f"Gemini API Error: {exc}"
                ) from exc

        print(
            f"{model_name} unavailable. "
            f"Trying next model..."
        )

    raise RuntimeError(
        "Gemini is temporarily unavailable. "
        "Both Gemini models failed after retries. "
        f"Last error: {last_error}"
    ) from last_error

# ============================================================
# INTERPRET EXISTING SPREAD
# ============================================================

def interpret_tarot_reading(
    question,
    spread,
    palm_reading=""
):
    """
    Interpret an already-drawn Tarot spread.

    This is what the frontend will call when the user
    clicks 'Generate My Reading'.
    """

    if not question or not question.strip():
        raise ValueError(
            "A question is required for a Tarot reading."
        )

    if not isinstance(spread, list):
        raise ValueError(
            "Tarot spread must be a list."
        )

    if len(spread) != 3:
        raise ValueError(
            "Tarot spread must contain exactly 3 cards."
        )

    interpretation = generate_tarot_interpretation(
        question=question.strip(),
        spread=spread,
        palm_reading=palm_reading,
    )

    return {
        "success": True,
        "question": question.strip(),
        "spread": spread,
        "interpretation": interpretation,
    }


# ============================================================
# COMPLETE TAROT READING
# ============================================================

def create_tarot_reading(
    question,
    palm_reading=""
):
    """
    Legacy complete Tarot pipeline.

    Kept for compatibility with the current endpoint.

    Draw cards → Gemini interpretation.
    """

    if not question or not question.strip():
        raise ValueError(
            "A question is required for a Tarot reading."
        )

    draw_result = draw_tarot_cards()

    spread = draw_result["spread"]

    interpretation = generate_tarot_interpretation(
        question=question.strip(),
        spread=spread,
        palm_reading=palm_reading,
    )

    return {
        "success": True,
        "question": question.strip(),
        "spread": spread,
        "interpretation": interpretation,
    }


# ============================================================
# DATASET HEALTH CHECK
# ============================================================

def validate_tarot_dataset():
    """
    Validate Tarot dataset and card images.
    """

    cards = load_tarot_cards()

    missing_images = []

    for card in cards:

        image_file = card.get("img")

        if not image_file:
            continue

        image_path = (
            TAROT_CARDS_DIR
            / image_file
        )

        if not image_path.exists():
            missing_images.append(
                image_file
            )

    return {
        "card_count": len(cards),

        "cards_directory": str(
            TAROT_CARDS_DIR
        ),

        "dataset_path": str(
            TAROT_DATA_PATH
        ),

        "missing_images": missing_images,

        "all_images_found": (
            len(missing_images) == 0
        ),
    }