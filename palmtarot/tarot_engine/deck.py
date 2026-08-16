import logging
import random
from pathlib import Path
from typing import Any

import pandas as pd

from ..assets.card_loader import get_card_image_path
from ..data.loader import load_tarot_df

logger = logging.getLogger(__name__)


def _get_general_card_meaning(card_name: str, orientation: str, suit: str, arcana: str) -> str:
    """Generate a short 1-2 sentence plain-language general meaning summary for a card and orientation."""
    is_up = str(orientation).lower() == "upright"
    name_clean = str(card_name).strip()

    summaries = {
        "The Fool": (
            "This card symbolizes new beginnings, innocent enthusiasm, and stepping boldly into the unknown with faith."
            if is_up else
            "This card warns against recklessness, taking unnecessary risks, or hesitating due to fear of the unknown."
        ),
        "The Magician": (
            "This card signifies resourcefulness, willpower, and possessing all the tools necessary to manifest your intentions."
            if is_up else
            "This card suggests untapped potential, trickery, or self-doubt delaying your creative power."
        ),
        "The High Priestess": (
            "This card points to intuition, mystery, and tapping into your subconscious wisdom and quiet inner truth."
            if is_up else
            "This card warns of ignoring your inner voice or keeping secrets that create inner disharmony."
        ),
        "The Empress": (
            "This card represents abundance, fertility, nurturing energy, and creative fulfillment."
            if is_up else
            "This card suggests creative blocks, dependence on others, or neglecting self-care."
        ),
        "The Emperor": (
            "This card embodies structure, authority, stability, and taking disciplined control of your path."
            if is_up else
            "This card warns against inflexibility, abuse of power, or chaotic lack of structure."
        ),
        "The Hierophant": (
            "This card symbolizes spiritual tradition, wisdom, mentorship, and aligning with shared values."
            if is_up else
            "This card encourages personal beliefs, breaking away from rigid dogma, and forging your own spiritual path."
        ),
        "The Lovers": (
            "This card highlights meaningful choices, deep alignment, harmony, and heartfelt partnerships."
            if is_up else
            "This card indicates inner disharmony, conflicting values, or friction in close relationships."
        ),
        "The Chariot": (
            "This card represents determination, overcoming obstacles through focus, and victory over challenges."
            if is_up else
            "This card warns of lack of direction, aggression, or feeling out of control."
        ),
        "Strength": (
            "This card signifies inner fortitude, compassion, patience, and mastering impulse with gentle courage."
            if is_up else
            "This card points to self-doubt, raw vulnerability, or feeling overwhelmed by emotional stress."
        ),
        "The Hermit": (
            "This card invites introspective solitude, seeking inner light, and quiet self-discovery."
            if is_up else
            "This card warns against isolation, loneliness, or ignoring wise guidance."
        ),
        "Wheel of Fortune": (
            "This card marks divine timing, karma, unexpected destiny shifts, and the ebb and flow of life cycles."
            if is_up else
            "This card indicates temporary setbacks, resistance to change, or bad luck running its course."
        ),
        "Justice": (
            "This card embodies truth, fairness, cause and effect, and making balanced, accountable decisions."
            if is_up else
            "This card warns against unfairness, bias, or avoiding accountability for past actions."
        ),
        "The Hanged Man": (
            "This card suggests surrendering control, gaining a fresh perspective, and finding wisdom in stillness."
            if is_up else
            "This card points to unnecessary stalling, martyrdom, or holding onto old patterns."
        ),
        "Death": (
            "This card marks profound transformation, closing old chapters, and welcoming new beginnings."
            if is_up else
            "This card suggests resistance to change, fear of letting go, or stagnant transitions."
        ),
        "Temperance": (
            "This card represents balance, moderation, patience, and synthesizing opposing forces into peace."
            if is_up else
            "This card warns of imbalance, excess, or hasty actions causing disharmony."
        ),
        "The Devil": (
            "This card highlights attachments, shadow aspects, illusion of entrapment, and physical temptation."
            if is_up else
            "This card heralds breaking free from negative habits, gaining freedom, and shedding limitations."
        ),
        "The Tower": (
            "This card brings sudden revelation, dismantling false structures, and breakthrough awakening."
            if is_up else
            "This card indicates avoiding necessary change, delaying the inevitable, or disaster avoided."
        ),
        "The Star": (
            "This card brings hope, inspiration, spiritual renewal, and serene faith in the future."
            if is_up else
            "This card points to temporary discouragement, lack of faith, or feeling disconnected from hope."
        ),
        "The Moon": (
            "This card illuminates subconscious dreams, intuition, navigating uncertainty, and hidden truths."
            if is_up else
            "This card brings clarity out of confusion, releasing fears, and uncovering deceptive illusions."
        ),
        "The Sun": (
            "This card radiates warmth, joy, success, vitality, and confident self-expression."
            if is_up else
            "This card indicates temporary clouds over your happiness, minor delays, or overly optimistic expectations."
        ),
        "Judgement": (
            "This card calls for self-evaluation, spiritual awakening, forgiveness, and stepping into your higher purpose."
            if is_up else
            "This card warns of self-doubt, harsh judgment of self or others, or ignoring a calling."
        ),
        "The World": (
            "This card signifies completion, wholeness, cosmic integration, and celebrating a major milestone."
            if is_up else
            "This card points to unfinished business, seeking closure, or feeling short of the final goal."
        ),
        "Four of Wands": (
            "This card represents harmony, celebration, and stable foundations — a time to enjoy the results of hard work with others."
            if is_up else
            "This card indicates minor delays in celebrations or feeling temporary friction in personal partnerships."
        )
    }

    if name_clean in summaries:
        return summaries[name_clean]

    suit_clean = str(suit).lower()
    if "wand" in suit_clean:
        return (
            f"This card represents creative energy, passion, and inspired action driving momentum in {name_clean}."
            if is_up else
            f"This card suggests temporary burnout, friction, or misdirected enthusiasm regarding {name_clean}."
        )
    elif "cup" in suit_clean:
        return (
            f"This card highlights emotional depth, intuition, and heartfelt connection surrounding {name_clean}."
            if is_up else
            f"This card points to emotional turbulence, moodiness, or unexpressed feelings in {name_clean}."
        )
    elif "sword" in suit_clean:
        return (
            f"This card signifies mental clarity, truth, and decisive communication around {name_clean}."
            if is_up else
            f"This card warns of overthinking, harsh conflict, or mental confusion in {name_clean}."
        )
    elif "pentacle" in suit_clean or "coin" in suit_clean:
        return (
            f"This card focuses on practical stability, material abundance, and tangible progress in {name_clean}."
            if is_up else
            f"This card suggests financial caution, resource insecurity, or unfulfilled practical plans in {name_clean}."
        )
    else:
        return (
            f"This card carries archetypal guidance of growth, self-realization, and alignment with {name_clean}."
            if is_up else
            f"This card calls for inner reflection, releasing resistance, and learning the shadow lessons of {name_clean}."
        )


class TarotDeck:
    """Tarot deck loader, shuffling, card drawing, and reading generator."""

    def __init__(self, json_path: Path | None = None):
        self.df = load_tarot_df(json_path)
        if self.df.empty:
            logger.warning("Loaded empty tarot deck. Creating fallback basic deck.")
            self.df = self._generate_fallback_deck()

    def _generate_fallback_deck(self) -> pd.DataFrame:
        """Fallback 78-card template if dataset JSON is unavailable."""
        cards = []
        suits = ["Wands", "Cups", "Swords", "Pentacles"]
        for i in range(1, 23):
            cards.append({
                "name": f"Major Arcana {i}",
                "number": str(i),
                "arcana": "Major",
                "suit": "Major",
                "keywords": ["wisdom", "guidance", "transformation"],
                "meanings": {"light": ["Positive transformation", "Inner strength"], "shadow": ["Doubt", "Delay"]},
                "fortune_telling": ["A major turning point is approaching."],
                "Affirmation": "I embrace my journey.",
                "Questions to Ask": ["What is my true goal?"]
            })
        for suit in suits:
            for num in range(1, 15):
                cards.append({
                    "name": f"{num} of {suit}",
                    "number": str(num),
                    "arcana": "Minor",
                    "suit": suit,
                    "keywords": ["energy", "focus", "manifestation"],
                    "meanings": {"light": ["Growth and progress"], "shadow": ["Misalignment", "Obstacle"]},
                    "fortune_telling": ["Focus your actions."],
                    "Affirmation": f"I harness the power of {suit}.",
                    "Questions to Ask": ["How can I best direct my energy?"]
                })
        return pd.DataFrame(cards)

    def draw_cards(self, num_cards: int = 3, seed: int | None = None) -> list[dict[str, Any]]:
        """Shuffle deck and draw N unique cards with randomized orientation and position mapping."""
        if num_cards < 1 or num_cards > len(self.df):
            raise ValueError(f"num_cards must be between 1 and {len(self.df)}")

        rng = random.Random(seed) if seed is not None else random.Random()
        indices = list(range(len(self.df)))
        rng.shuffle(indices)

        selected_indices = indices[:num_cards]
        draw_results = []

        if num_cards == 1:
            positions = ["General Reading"]
        elif num_cards == 3:
            positions = ["Past", "Present", "Future"]
        else:
            positions = [f"Position {i+1}" for i in range(num_cards)]

        for i, idx in enumerate(selected_indices):
            row = self.df.iloc[idx]
            orientation = rng.choice(["Upright", "Reversed"])
            meanings = row.get("meanings", {})

            if isinstance(meanings, dict):
                light_m = meanings.get("light", [])
                shadow_m = meanings.get("shadow", [])
                interpretation = ", ".join(light_m) if orientation == "Upright" else ", ".join(shadow_m)
            else:
                interpretation = str(meanings)

            card_name = str(row.get("name", f"Card {idx}"))
            arcana_val = str(row.get("arcana", "Unknown"))
            suit_val = str(row.get("suit", "Unknown"))
            general_meaning = _get_general_card_meaning(card_name, orientation, suit_val, arcana_val)

            fortune = row.get("fortune_telling", [])
            fortune_str = ", ".join(fortune) if isinstance(fortune, list) else str(fortune)

            keywords = row.get("keywords", [])
            keywords_str = ", ".join(keywords) if isinstance(keywords, list) else str(keywords)

            questions = row.get("Questions to Ask", [])
            questions_str = ", ".join(questions) if isinstance(questions, list) else str(questions)

            affirmation = str(row.get("Affirmation", "No affirmation available"))

            img_filename = str(row.get("img", f"m{idx:02d}.jpg" if idx < 22 else "w01.jpg"))
            img_path = str(get_card_image_path(img_filename))

            draw_results.append({
                "position": positions[i],
                "name": card_name,
                "arcana": arcana_val,
                "suit": suit_val,
                "orientation": orientation,
                "img": img_filename,
                "img_path": img_path,
                "img_url": f"/static/cards/{img_filename}",
                "keywords": keywords_str,
                "interpretation": interpretation,
                "meaning": general_meaning,
                "fortune": fortune_str,
                "affirmation": affirmation,
                "questions": questions_str
            })

        return draw_results

