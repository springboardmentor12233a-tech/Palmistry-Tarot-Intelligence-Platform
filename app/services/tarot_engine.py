import os
import json
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.core.config import settings
from app.schemas.tarot import DrawnCard, TarotCardData, TarotDrawResult

# Default Spread Configurations
SPREAD_CONFIGS: Dict[str, Dict[str, Any]] = {
    "single_card": {
        "title": "Single Card Oracle",
        "description": "Direct insight and daily energetic alignment.",
        "card_count": 1,
        "positions": [
            {"index": 0, "label": "The Core Essence", "meaning": "Primary focal energy and current lesson."}
        ],
    },
    "three_card": {
        "title": "Past, Present & Future Synthesis",
        "description": "Chronological archetypal arc tracking evolutionary progression.",
        "card_count": 3,
        "positions": [
            {"index": 0, "label": "Past", "meaning": "Foundational influences and karmic momentum."},
            {"index": 1, "label": "Present", "meaning": "Current crossroads, energetic vortex, and reality."},
            {"index": 2, "label": "Future", "meaning": "Emerging trajectory, potential outcome, and advice."},
        ],
    },
    "relationship": {
        "title": "Sacred Mirror Dynamic",
        "description": "Relational alchemy and energetic resonance between two souls.",
        "card_count": 4,
        "positions": [
            {"index": 0, "label": "Your Energy", "meaning": "Your subconscious posture and needs."},
            {"index": 1, "label": "Partner's Energy", "meaning": "Their perception, emotional weather, and posture."},
            {"index": 2, "label": "The Crucible", "meaning": "The central challenge or growth lesson between you."},
            {"index": 3, "label": "Higher Outcome", "meaning": "The evolutionary potential of the union."},
        ],
    },
    "career": {
        "title": "Vocation & Sovereign Purpose",
        "description": "Strategic guidance for career progression and financial mastery.",
        "card_count": 4,
        "positions": [
            {"index": 0, "label": "Current Grounding", "meaning": "Present professional reality and assets."},
            {"index": 1, "label": "Hidden Catalyst", "meaning": "Unseen opportunities or untapped genius."},
            {"index": 2, "label": "The Work Ahead", "meaning": "Action vector required to bridge the gap."},
            {"index": 3, "label": "Fruition", "meaning": "Material outcome and long-term standing."},
        ],
    },
    "celtic_cross": {
        "title": "Grand Celtic Cross Master Spread",
        "description": "Comprehensive 10-card multidimensional life matrix.",
        "card_count": 10,
        "positions": [
            {"index": 0, "label": "The Present Situation", "meaning": "Core query / soul focus."},
            {"index": 1, "label": "The Immediate Challenge", "meaning": "Intersecting friction or catalyst."},
            {"index": 2, "label": "The Foundation (Root)", "meaning": "Subconscious roots & distant origin."},
            {"index": 3, "label": "The Past Cycle", "meaning": "Recent events receding from view."},
            {"index": 4, "label": "The Crown (Aspirations)", "meaning": "Conscious ideal & highest potential."},
            {"index": 5, "label": "The Near Future", "meaning": "Immediate energetic horizon (30-60 days)."},
            {"index": 6, "label": "The Self (Internal Posture)", "meaning": "Your psychological stance."},
            {"index": 7, "label": "The Environment (External Forces)", "meaning": "People and atmospheric influences."},
            {"index": 8, "label": "Hopes & Fears", "meaning": "Inner psychological tensions."},
            {"index": 9, "label": "Final Synthesis", "meaning": "Ultimate culmination and advice."},
        ],
    },
    "life_path": {
        "title": "Soul Horizon & Life Path Map",
        "description": "Five-phase holistic destiny alignment.",
        "card_count": 5,
        "positions": [
            {"index": 0, "label": "Origin & Roots", "meaning": "Core gifts brought into this incarnation."},
            {"index": 1, "label": "The Soul Calling", "meaning": "Dharmic urge pushing you forward."},
            {"index": 2, "label": "Inner Shadow", "meaning": "The threshold resistance to integrate."},
            {"index": 3, "label": "Transmutation Key", "meaning": "The practice or perspective that liberates."},
            {"index": 4, "label": "Highest Destiny", "meaning": "The ultimate contribution and self-mastery."},
        ],
    },
}

DEFAULT_FALLBACK_DECK: List[Dict[str, Any]] = [
    {
        "name": "The Fool",
        "number": 0,
        "arcana": "major",
        "suit": "trump",
        "img": "m00.jpg",
        "element": "Air",
        "keywords": ["beginnings", "innocence", "spontaneity", "faith", "adventure"],
        "fortune_telling": ["Watch for new beginnings", "Take a leap of faith", "Embark on an unexpected journey"],
        "meanings": {
            "light": ["Freeing yourself from limitation", "Embracing new opportunities", "Taking courageous leaps"],
            "shadow": ["Recklessness", "Naivety", "Ignoring sensible counsel"]
        },
        "upright_meaning": "Embrace new beginnings, trust your instincts, and take an inspired leap of faith into unexplored horizons.",
        "reversed_meaning": "Beware of reckless impulse, hesitation stemming from fear, or ignoring valuable guidance.",
        "symbolism": "Sun shining on high cliffs, white rose of pure intention, faithful companion.",
        "astrological_association": "Uranus"
    },
    {
        "name": "The Magician",
        "number": 1,
        "arcana": "major",
        "suit": "trump",
        "img": "m01.jpg",
        "element": "Air",
        "keywords": ["manifestation", "resourcefulness", "power", "skill", "alchemy"],
        "fortune_telling": ["You have all tools required", "Translate idea to reality", "Master your craft"],
        "meanings": {
            "light": ["Channeling universal energy", "Skillful execution", "Aligning willpower with action"],
            "shadow": ["Manipulation", "Untapped creative force", "Trickery"]
        },
        "upright_meaning": "You hold all four elemental tools to manifest your highest vision. Align intention with resolute action.",
        "reversed_meaning": "Misused influence, self-doubt blocking creative flow, or scattered concentration.",
        "symbolism": "Infinity symbol (lemniscate), wand pointing to heaven, table with four elemental suits.",
        "astrological_association": "Mercury"
    },
    {
        "name": "The High Priestess",
        "number": 2,
        "arcana": "major",
        "suit": "trump",
        "img": "m02.jpg",
        "element": "Water",
        "keywords": ["intuition", "sacred knowledge", "divine feminine", "subconscious", "mystery"],
        "fortune_telling": ["Trust your dreams", "A secret will be revealed", "Look beyond physical surface"],
        "meanings": {
            "light": ["Deep intuitive discernment", "Accessing hidden wisdom", "Patience and silence"],
            "shadow": ["Repression", "Superficiality", "Ignoring inner knowing"]
        },
        "upright_meaning": "Quiet the logical mind and listen to your deep subterranean intuition. Secrets and profound truths await.",
        "reversed_meaning": "Disconnected from inner guidance, gossip, or fear of hidden truths.",
        "symbolism": "Pillars of Boaz and Jachin, pomegranate veil, crescent moon crown.",
        "astrological_association": "Moon"
    },
    {
        "name": "The Empress",
        "number": 3,
        "arcana": "major",
        "suit": "trump",
        "img": "m03.jpg",
        "element": "Earth",
        "keywords": ["fertility", "sensuality", "creativity", "abundance", "nurturance"],
        "fortune_telling": ["A creative project thrives", "Abundance surrounds you", "Nurture your creations"],
        "meanings": {
            "light": ["Radiant creativity", "Abundance in all forms", "Connecting with nature"],
            "shadow": ["Smothering", "Overindulgence", "Creative block"]
        },
        "upright_meaning": "A period of bountiful growth, sensual embodiment, and flourishing artistic creation.",
        "reversed_meaning": "Creative stagnation, neglecting self-care, or dependency dynamics.",
        "symbolism": "Crown of twelve stars, lush forest stream, golden wheat fields.",
        "astrological_association": "Venus"
    },
    {
        "name": "The Emperor",
        "number": 4,
        "arcana": "major",
        "suit": "trump",
        "img": "m04.jpg",
        "element": "Fire",
        "keywords": ["authority", "structure", "sovereignty", "stability", "strategic mastery"],
        "fortune_telling": ["Step into leadership", "Establish clear rules", "Build enduring foundations"],
        "meanings": {
            "light": ["Visionary leadership", "Firm protection", "Disciplined execution"],
            "shadow": ["Tyranny", "Rigidity", "Control issues"]
        },
        "upright_meaning": "Establish orderly systems, step boldly into sovereign leadership, and protect your creations with structured clarity.",
        "reversed_meaning": "Micromanagement, chaotic lack of discipline, or friction with authority.",
        "symbolism": "Stone throne with ram carvings, orb and sceptre, red battle armor.",
        "astrological_association": "Aries"
    },
    {
        "name": "The Hierophant",
        "number": 5,
        "arcana": "major",
        "suit": "trump",
        "img": "m05.jpg",
        "element": "Earth",
        "keywords": ["spiritual wisdom", "lineage", "institutions", "mentorship", "tradition"],
        "fortune_telling": ["Seek wise counsel", "Study sacred lineages", "Learn timeless systems"],
        "meanings": {
            "light": ["Honoring lineage", "Higher mentorship", "Transmitting sacred truths"],
            "shadow": ["Blind dogma", "Dogmatic rigidity", "Rebellion for its own sake"]
        },
        "upright_meaning": "Seek spiritual counsel, study proven esoteric traditions, and ground your insights in reputable frameworks.",
        "reversed_meaning": "Dogmatic confinement, outmoded orthodoxy, or time to forge your own authentic spirituality.",
        "symbolism": "Triple crown, papal cross, crossed keys of gnosis.",
        "astrological_association": "Taurus"
    },
    {
        "name": "The Lovers",
        "number": 6,
        "arcana": "major",
        "suit": "trump",
        "img": "m06.jpg",
        "element": "Air",
        "keywords": ["union", "love", "harmony", "alignment", "sacred choice"],
        "fortune_telling": ["Deep romantic connection", "A soul-defining choice", "Harmonizing opposites"],
        "meanings": {
            "light": ["Soulmate reciprocity", "Ethical discernment", "Authentic communion"],
            "shadow": ["Conflict of values", "Indecision", "Co-dependency"]
        },
        "upright_meaning": "Harmonious union of opposites, passionate soul connection, and profound ethical alignment with your core values.",
        "reversed_meaning": "Misaligned values, fear of commitment, or friction between internal desire and duty.",
        "symbolism": "Archangel Raphael radiating grace, Adam and Eve beneath the Tree of Life.",
        "astrological_association": "Gemini"
    },
    {
        "name": "The Chariot",
        "number": 7,
        "arcana": "major",
        "suit": "trump",
        "img": "m07.jpg",
        "element": "Water",
        "keywords": ["willpower", "triumph", "focus", "determination", "momentum"],
        "fortune_telling": ["Overcoming obstacles", "Rapid forward momentum", "Decisive victory"],
        "meanings": {
            "light": ["Mastery of opposing impulses", "Undeterred drive", "Steering fate"],
            "shadow": ["Aggression", "Loss of direction", "Overpowering others"]
        },
        "upright_meaning": "Harness opposing forces through unwavering determination and focus. Victorious momentum is yours.",
        "reversed_meaning": "Loss of control, scattered direction, or forceful impatience.",
        "symbolism": "Black and white sphinxes, starry canopy, armor with alchemical emblems.",
        "astrological_association": "Cancer"
    },
    {
        "name": "Strength",
        "number": 8,
        "arcana": "major",
        "suit": "trump",
        "img": "m08.jpg",
        "element": "Fire",
        "keywords": ["courage", "gentle mastery", "patience", "compassion", "inner fortitude"],
        "fortune_telling": ["Calm inner beast", "Patience yields total victory", "Gentleness over brute force"],
        "meanings": {
            "light": ["Sovereign compassion", "Emotional resilience", "Mastery of animal instincts"],
            "shadow": ["Self-doubt", "Uncontrolled rage", "Feeling depleted"]
        },
        "upright_meaning": "True strength comes from quiet compassion, unshakeable patience, and gentle mastery over primal instinct.",
        "reversed_meaning": "Raw vulnerability turning into self-doubt, impulsive anger, or physical burnout.",
        "symbolism": "Maiden crowned with infinity symbol calmly closing a roaring lion's jaws.",
        "astrological_association": "Leo"
    },
    {
        "name": "The Hermit",
        "number": 9,
        "arcana": "major",
        "suit": "trump",
        "img": "m09.jpg",
        "element": "Earth",
        "keywords": ["introspection", "solitude", "inner guidance", "lantern of truth", "soul seeking"],
        "fortune_telling": ["Take quiet retreat", "Follow inner beacon", "Wisdom found in stillness"],
        "meanings": {
            "light": ["Deep contemplative wisdom", "Guiding beacon for seekers", "Inner self-reliance"],
            "shadow": ["Isolation", "Withdrawal from community", "Loneliness"]
        },
        "upright_meaning": "Step back from external noise into introspective solitude to receive profound spiritual illumination.",
        "reversed_meaning": "Excessive isolation, resistance to self-reflection, or feeling lost in darkness.",
        "symbolism": "Cloaked elder on mountain peak holding six-pointed star lantern and staff.",
        "astrological_association": "Virgo"
    },
    {
        "name": "Wheel of Fortune",
        "number": 10,
        "arcana": "major",
        "suit": "trump",
        "img": "m10.jpg",
        "element": "Fire",
        "keywords": ["cycles", "destiny", "turning point", "good fortune", "karma"],
        "fortune_telling": ["A major cycle turns in your favor", "Karmic breakthrough", "Seize unexpected momentum"],
        "meanings": {
            "light": ["Auspicious turning point", "Aligning with universal flow", "Karmic reward"],
            "shadow": ["Resistance to change", "Temporary downturn", "Bad timing"]
        },
        "upright_meaning": "A cosmic turning point is underway. Fortunate destiny and auspicious shifts favor your elevation.",
        "reversed_meaning": "Resisting inevitable cycles of change, feeling subjected to external forces.",
        "symbolism": "Four winged creatures of the zodiac, sphinx at apex, wheel inscribed with TARO / ROTA.",
        "astrological_association": "Jupiter"
    },
    {
        "name": "The Star",
        "number": 17,
        "arcana": "major",
        "suit": "trump",
        "img": "m17.jpg",
        "element": "Air",
        "keywords": ["hope", "inspiration", "renewal", "serenity", "divine blessing"],
        "fortune_telling": ["Wishes granted", "Healing after storm", "Bright inspiration flows"],
        "meanings": {
            "light": ["Spiritual rebirth", "Boundless optimism", "Unveiled authenticity"],
            "shadow": ["Despair", "Disconnection from faith", "Cynicism"]
        },
        "upright_meaning": "A beacon of hope, pure spiritual renewal, and celestial blessings after enduring turbulent storms.",
        "reversed_meaning": "Temporary loss of faith, self-doubt, or cynicism dimming your radiant potential.",
        "symbolism": "Naked maiden pouring water upon land and pool, eight-pointed luminous star above.",
        "astrological_association": "Aquarius"
    },
    {
        "name": "The Sun",
        "number": 19,
        "arcana": "major",
        "suit": "trump",
        "img": "m19.jpg",
        "element": "Fire",
        "keywords": ["joy", "vitality", "success", "radiance", "clarity"],
        "fortune_telling": ["Complete triumph", "Vibrant health and vitality", "Public recognition"],
        "meanings": {
            "light": ["Luminous self-expression", "Unadulterated joy", "Absolute success"],
            "shadow": ["Clouded optimism", "Arrogance", "Temporary delay"]
        },
        "upright_meaning": "Unbounded joy, radiant warmth, crystalline clarity, and guaranteed celebratory success in all ventures.",
        "reversed_meaning": "Dimmed enthusiasm, struggling to see the bright side, or minor delays in celebration.",
        "symbolism": "Blazing golden sun, child riding white horse with crimson banner, sunflowers.",
        "astrological_association": "Sun"
    },
    {
        "name": "The World",
        "number": 21,
        "arcana": "major",
        "suit": "trump",
        "img": "m21.jpg",
        "element": "Earth",
        "keywords": ["completion", "wholeness", "ascension", "fulfillment", "global consciousness"],
        "fortune_telling": ["A cycle completes triumphantly", "Global journeys", "Mastery attained"],
        "meanings": {
            "light": ["Holistic fulfillment", "Cosmic integration", "Stepping into next evolution"],
            "shadow": ["Incomplete closure", "Fear of final step", "Lack of finality"]
        },
        "upright_meaning": "Triumphant culmination of a major life cycle. Complete wholeness, global expansion, and joyous mastery.",
        "reversed_meaning": "Near completion needing final loose ends tied up, procrastination at the finish line.",
        "symbolism": "Dancing maiden encircled in laurel wreath, four cosmic tetramorphs in corners.",
        "astrological_association": "Saturn"
    },
]


class TarotEngine:
    """Manages Tarot card deck and spread draws."""

    def __init__(self, data_path: Optional[Path] = None):
        self.data_path = data_path or settings.TAROT_DATA_PATH
        self.deck: List[Dict[str, Any]] = []
        self._load_deck()

    def _load_deck(self) -> None:
        """Loads cards from tarot-images.json or falls back to internal default deck."""
        if self.data_path and os.path.exists(self.data_path):
            try:
                with open(self.data_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                raw_cards = data.get("cards", [])
                if raw_cards:
                    self.deck = []
                    for idx, c in enumerate(raw_cards):
                        card = self._normalize_card(c, idx)
                        self.deck.append(card)
                    print(f"[TarotEngine] Loaded {len(self.deck)} cards from {self.data_path}")
                    return
            except Exception as e:
                print(f"[TarotEngine] Warning: Could not load {self.data_path}: {e}")

        # Fallback deck
        print(f"[TarotEngine] Using fallback deck with {len(DEFAULT_FALLBACK_DECK)} curated archetypes")
        self.deck = [self._normalize_card(c, i) for i, c in enumerate(DEFAULT_FALLBACK_DECK)]

    def _normalize_card(self, c: Dict[str, Any], index: int) -> Dict[str, Any]:
        """Ensures all standard schema keys exist in card dictionary."""
        name = c.get("name", f"Card {index}")
        arcana_raw = str(c.get("arcana", "Major Arcana")).lower()
        arcana = "major" if "major" in arcana_raw else "minor"

        suit_raw = str(c.get("suit", "trump")).lower()
        if "wand" in suit_raw:
            suit = "wands"
            element = "Fire"
        elif "cup" in suit_raw:
            suit = "cups"
            element = "Water"
        elif "sword" in suit_raw:
            suit = "swords"
            element = "Air"
        elif "pentacle" in suit_raw or "coin" in suit_raw:
            suit = "pentacles"
            element = "Earth"
        else:
            suit = "trump"
            element = c.get("element") or c.get("Elemental") or "Fire"

        meanings = c.get("meanings", {})
        light_meanings = meanings.get("light", []) if isinstance(meanings, dict) else []
        shadow_meanings = meanings.get("shadow", []) if isinstance(meanings, dict) else []

        upright = c.get("upright_meaning")
        if not upright and light_meanings:
            upright = f"{', '.join(light_meanings[:2])}. Focus on radiant alignment and authentic expression."
        elif not upright:
            upright = "Spiritual activation, clarity of vision, and expansive alignment."

        reversed_m = c.get("reversed_meaning")
        if not reversed_m and shadow_meanings:
            reversed_m = f"{', '.join(shadow_meanings[:2])}. Be mindful of subconscious resistance."
        elif not reversed_m:
            reversed_m = "Introspective calibration, shadow integration, and overcoming resistance."

        img_filename = c.get("img", f"m{index:02d}.jpg")
        img_path = f"/assets/cards/{img_filename}"

        return {
            "id": f"card_{c.get('number', index)}_{name.lower().replace(' ', '_')}",
            "name": name,
            "number": int(c.get("number", index)) if str(c.get("number", "")).isdigit() else index,
            "arcana": arcana,
            "suit": suit,
            "element": element,
            "keywords": c.get("keywords", ["awakening", "destiny", "transformation"]),
            "upright_meaning": upright,
            "reversed_meaning": reversed_m,
            "symbolism": c.get("symbolism") or c.get("Mythical/Spiritual") or "Sacred archetypal portal of consciousness.",
            "astrological_association": c.get("astrological_association") or c.get("Astrology") or "Solar Resonance",
            "image_path": img_path,
            "img": img_filename,
            "fortune_telling": c.get("fortune_telling", []),
            "meanings": {"light": light_meanings, "shadow": shadow_meanings},
        }

    def draw_spread(self, spread_type: str = "three_card", seed: Optional[Any] = None) -> TarotDrawResult:
        """
        Draws cards according to spread configuration.
        Replicates the notebook draw_tarot_cards logic with structured schema.
        """
        config = SPREAD_CONFIGS.get(spread_type, SPREAD_CONFIGS["three_card"])
        card_count = config["card_count"]

        rng = random.Random()
        if seed is not None:
            rng.seed(str(seed))

        available_deck = list(self.deck)
        if len(available_deck) < card_count:
            # Duplicate to satisfy count if needed
            available_deck = available_deck * ((card_count // len(available_deck)) + 1)

        selected = rng.sample(available_deck, card_count)

        drawn_cards: List[DrawnCard] = []
        for idx, card_dict in enumerate(selected):
            pos_info = config["positions"][idx] if idx < len(config["positions"]) else {
                "index": idx,
                "label": f"Position {idx + 1}",
                "meaning": "Energetic vector",
            }

            is_reversed = rng.random() < 0.25  # 25% chance of reversal

            card_data = TarotCardData(
                id=card_dict["id"],
                name=card_dict["name"],
                arcana=card_dict["arcana"],
                suit=card_dict["suit"],
                number=card_dict["number"],
                element=card_dict["element"],
                keywords=card_dict["keywords"],
                upright_meaning=card_dict["upright_meaning"],
                reversed_meaning=card_dict["reversed_meaning"],
                symbolism=card_dict["symbolism"],
                astrological_association=card_dict["astrological_association"],
                image_path=card_dict["image_path"],
                fortune_telling=card_dict.get("fortune_telling", []),
                meanings=card_dict.get("meanings", {}),
            )

            drawn_cards.append(
                DrawnCard(
                    card=card_data,
                    position_index=idx,
                    position_label=pos_info["label"],
                    position_meaning=pos_info["meaning"],
                    is_reversed=is_reversed,
                )
            )

        return TarotDrawResult(
            spread_type=spread_type,
            spread_title=config["title"],
            cards=drawn_cards,
            drawn_at=datetime.now(timezone.utc).isoformat(),
        )


tarot_engine = TarotEngine()
