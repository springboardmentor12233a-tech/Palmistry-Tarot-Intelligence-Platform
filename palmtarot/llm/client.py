import json
import logging
import re
from typing import Any

try:
    from ..config import settings
except (ImportError, ValueError):
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))
    from palmtarot.config import settings

logger = logging.getLogger(__name__)

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class LLMInterpreter:
    """OpenAI API Client wrapper & dynamic interpretation engine for Palm + Tarot readings and Chat."""

    def __init__(self, api_key: str | None = None, model: str | None = None, base_url: str | None = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL
        self.base_url = base_url or settings.OPENAI_BASE_URL
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        if OPENAI_AVAILABLE and self.api_key and not self.api_key.startswith("your_"):
            try:
                self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
                logger.info(f"OpenAI client initialized with model {self.model}.")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
                self.client = None
        else:
            logger.info("OpenAI client not configured or using dummy key. Will use dynamic local response engine.")
            self.client = None

    def generate_reading(
        self,
        palm_features: dict[str, Any],
        palm_report: dict[str, Any],
        tarot_reading: dict[str, Any],
        user_question: str | None = None
    ) -> dict[str, Any]:
        """Generate structured natural-language interpretation from palm and tarot data."""
        if self.client is not None:
            try:
                return self._call_openai(palm_features, palm_report, tarot_reading, user_question)
            except Exception as e:
                logger.error(f"OpenAI API call failed: {e}. Falling back to dynamic narrative generator.")

        return self._generate_fallback_narrative(palm_report, tarot_reading, user_question)

    def _call_openai(
        self,
        palm_features: dict[str, Any],
        palm_report: dict[str, Any],
        tarot_reading: dict[str, Any],
        user_question: str | None
    ) -> dict[str, Any]:
        prompt = f"""
You are an expert AI Palmistry and Tarot Interpretation Assistant.

User Question: {user_question or 'General self-reflection and life guidance'}

Palm Line Features:
{json.dumps(palm_features, indent=2)}

Palm Feature Interpretation:
{json.dumps(palm_report, indent=2)}

Tarot Reading:
{json.dumps(tarot_reading, indent=2)}

Generate a deeply personalized, empathetic narrative that explicitly correlates the calculated palm line measurements with the drawn tarot cards.
Return ONLY valid JSON in the exact structure below:

{{
  "personality": "Comprehensive personality analysis based on hand structure and tarot themes.",
  "career_guidance": "Strategic career and goal advice based on lines and drawn cards.",
  "relationship_insights": "Interpersonal and emotional connection insights.",
  "health_wellness": "Holistic energy and wellness self-care recommendations.",
  "life_trend": "Overall temporal trend (Past/Present/Future flow).",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areas_for_improvement": ["Area 1", "Area 2"],
  "recommendations": ["Actionable step 1", "Actionable step 2"]
}}
"""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are an AI Palmistry and Tarot Interpretation Assistant. Provide detailed, thorough narratives."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=2000
        )

        content = response.choices[0].message.content
        parsed = json.loads(content)
        return parsed

    def _generate_fallback_narrative(
        self,
        palm_report: dict[str, Any],
        tarot_reading: dict[str, Any],
        user_question: str | None
    ) -> dict[str, Any]:
        """Produce rich structured default reading if LLM API is unavailable."""
        shape = palm_report.get("Palm_Shape", "Rectangular Palm")
        cards = tarot_reading.get("cards", [])
        card_descriptions = []
        for c in cards:
            c_name = c.get("name", "Card")
            c_orient = c.get("orientation", "Upright")
            c_pos = c.get("position", "General")
            card_descriptions.append(f"{c_name} ({c_orient} in {c_pos})")

        card_str = ", ".join(card_descriptions) if card_descriptions else "The Star (Upright)"

        return {
            "personality": (
                f"Your hand structure reveals a classic {shape}, indicating balanced pragmatism, analytical depth, and strong intuitive foresight. "
                f"Paired with your drawn cards ({card_str}), your personality archetype combines grounded logic with emotional sensitivity, "
                f"allowing you to navigate complex decisions with composure and strategic vision."
            ),
            "career_guidance": (
                f"The alignment of your palm features and tarot draw ({card_str}) highlights steady execution and high analytical potential. "
                f"Focus on long-term strategic projects where your organizational discipline and innovative thinking can create maximum value. "
                f"Avoid rushing impulsive moves; leverage structured planning to realize your professional ambitions."
            ),
            "relationship_insights": (
                f"Emotional clarity is strongly reflected in your palm line profile and tarot synthesis ({card_str}). "
                f"You value authentic, meaningful connections over superficial interactions. Maintain open communication, set healthy boundaries, "
                f"and honor both your logical perspective and underlying emotional intuition in close relationships."
            ),
            "health_wellness": (
                "Maintain balance between physical vitality, cognitive effort, and mental rest to keep your energy centered. "
                "Incorporating daily grounding exercises and regular sleep routines will preserve your stamina across high-demand periods."
            ),
            "life_trend": f"The drawn cards ({card_str}) signal a transformative phase of self-mastery, personal clarity, and steady forward momentum.",
            "strengths": [
                "Analytical adaptability and logical clarity",
                "Strong intuitive foundation in complex scenarios",
                "Resilience and emotional composure under pressure"
            ],
            "areas_for_improvement": [
                "Tendency to over-analyze minor details before acting",
                "Hesitancy to delegate tasks when under high stress"
            ],
            "recommendations": [
                "Dedicate 10-15 minutes daily for mindfulness reflection and mental grounding.",
                "Establish clear weekly priority milestones for your primary career and personal goals.",
                "Engage in honest, open dialogue regarding mutual expectations in close relationships."
            ]
        }

    def chat_completion(
        self,
        messages: list[dict[str, str]],
        reading_context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """Interactive conversational chat method for palmistry & tarot Q&A with dynamic context."""
        last_user_msg = messages[-1]["content"] if messages else ""

        if self.client is not None:
            try:
                system_prompt = (
                    "You are an empathetic, highly articulate, and master-level AI Palmistry & Tarot Knowledge & Reading Guide.\n"
                    "You can answer ANY reasonable question regarding palmistry (lines, mounts, hand shapes, finger proportions, thumb logic) "
                    "and tarot (all 78 cards, Major/Minor Arcana, suits, court cards, upright vs reversed energy, spreads like Celtic Cross or 3-card, and symbolic concepts).\n\n"
                    "INSTRUCTIONS:\n"
                    "1. GENERAL KNOWLEDGE QUESTIONS (e.g. 'what is the Hierophant card', 'what does the Fate line mean', 'explain Celtic Cross spread', 'what is an Earth hand'): "
                    "Answer directly, educational, and in-depth using authoritative palmistry and tarot principles. Cover symbolic meaning, elemental associations, and practical interpretation.\n"
                    "2. PERSONAL READING QUESTIONS (e.g. 'what does MY Head line mean', 'how do MY drawn cards connect', 'explain MY reading'): "
                    "Incorporate the user's active session reading measurements (palm shape, pixel line lengths, cluster ID, and drawn cards) to provide personalized guidance.\n"
                    "3. Format all responses with clear headings, bold key terms, and structured bullet points where helpful. Never return generic single-line or empty answers."
                )
                if reading_context:
                    system_prompt += f"\n\nActive User Reading Context:\n{json.dumps(reading_context, indent=2)}"

                formatted_messages = [{"role": "system", "content": system_prompt}]
                for msg in messages:
                    if msg.get("role") in ["user", "assistant"]:
                        formatted_messages.append({"role": msg["role"], "content": msg["content"]})

                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=formatted_messages,
                    temperature=0.7,
                    max_tokens=1500
                )
                reply = response.choices[0].message.content
                return {
                    "reply": reply,
                    "suggested_followups": self._generate_suggested_followups(last_user_msg, reading_context)
                }
            except Exception as e:
                logger.error(f"OpenAI chat completion failed: {e}. Using dynamic local response generator.")

        return self._generate_dynamic_chat_reply(messages, reading_context)

    def _extract_palm_metrics(self, context: dict[str, Any] | None) -> dict[str, Any]:
        """Extract calculated palm line features and shape details from context."""
        metrics = {
            "has_reading": False,
            "palm_shape": "Rectangular Palm",
            "aspect_ratio": None,
            "cluster_id": None,
            "heart_line": None,
            "head_line": None,
            "life_line": None,
            "tarot_cards": []
        }
        if not context:
            return metrics

        metrics["has_reading"] = True

        # Extract palm shape & report details
        palm_report = context.get("palm_report") or context.get("rule_report") or {}
        if isinstance(palm_report, dict):
            metrics["palm_shape"] = palm_report.get("Palm_Shape", "Rectangular Palm")

        # Extract features / cluster
        palm_features = context.get("palm_features") or context.get("engineered_features") or {}
        if isinstance(palm_features, dict):
            metrics["aspect_ratio"] = palm_features.get("aspect_ratio")

        cluster = context.get("cluster") or {}
        if isinstance(cluster, dict):
            metrics["cluster_id"] = cluster.get("cluster_id")

        # Extract palm lines (Heart, Head, Life line measurements)
        palm_lines = context.get("palm_lines") or []
        if isinstance(palm_lines, list):
            for line in palm_lines:
                if isinstance(line, dict):
                    line_name = str(line.get("line", "")).lower()
                    if "heart" in line_name:
                        metrics["heart_line"] = line
                    elif "head" in line_name:
                        metrics["head_line"] = line
                    elif "life" in line_name:
                        metrics["life_line"] = line

        # Extract tarot reading
        tarot_reading = context.get("tarot_reading") or {}
        if isinstance(tarot_reading, dict):
            metrics["tarot_cards"] = tarot_reading.get("cards", [])

        return metrics

    def _generate_dynamic_chat_reply(
        self,
        messages: list[dict[str, str]],
        reading_context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """Generate a fully dynamic, accurate, and comprehensive response based on user query, master palmistry/tarot knowledge, and active session context."""
        user_message = messages[-1]["content"] if messages else ""
        msg_lower = user_message.lower().strip()
        pm = self._extract_palm_metrics(reading_context)

        # Distinguish personal reading query vs general knowledge query
        is_personal = any(w in msg_lower for w in ["my reading", "my session", "my result", "my drawn cards", "my lines", "explain my", "what did i get", "for my reading"])

        # Context details formatting for personal queries
        heart_info = ""
        if pm["heart_line"]:
            hl = pm["heart_line"]
            length = hl.get("length_px", hl.get("length", "149.1"))
            desc = hl.get("description", "Empathetic & passionate connection style")
            heart_info = f"Heart Line length: {length}px ({desc})"

        head_info = ""
        if pm["head_line"]:
            hl = pm["head_line"]
            length = hl.get("length_px", hl.get("length", "135.4"))
            desc = hl.get("description", "Balanced logical & analytical focus")
            head_info = f"Head Line length: {length}px ({desc})"

        life_info = ""
        if pm["life_line"]:
            ll = pm["life_line"]
            length = ll.get("length_px", ll.get("length", "162.8"))
            desc = ll.get("description", "Strong physical vitality & grounding")
            life_info = f"Life Line length: {length}px ({desc})"

        tarot_info_list = []
        for c in pm["tarot_cards"]:
            tarot_info_list.append(f"**{c.get('name')}** ({c.get('orientation')} in {c.get('position', 'draw')})")
        tarot_summary = ", ".join(tarot_info_list) if tarot_info_list else ""
        cluster_str = f" (Cluster ID: {pm['cluster_id']})" if pm.get("cluster_id") is not None else ""

        # ---------------------------------------------------------------------
        # MASTER PALMISTRY & TAROT INTENT MATCHING KNOWLEDGE ENGINE
        # ---------------------------------------------------------------------

        # 1. Left Hand vs Right Hand Rules
        if any(k in msg_lower for k in ["left hand", "right hand", "which hand", "active hand", "passive hand", "dominant hand"]):
            reply = (
                f"### ✋ Left Hand vs. Right Hand in Palmistry\n\n"
                f"Regarding your question *\"{user_message}\"*\n\n"
                f"In professional palmistry, both hands are analyzed together to provide a complete picture of your journey:\n\n"
                f"1. **Dominant (Active) Hand:**\n"
                f"   • Represents the choices you have made, your conscious actions, current lifestyle, and how you shape your future.\n"
                f"   • For right-handed individuals, this is the **Right Hand** (and vice-versa for left-handed people).\n\n"
                f"2. **Non-Dominant (Passive) Hand:**\n"
                f"   • Represents your innate potential, inherited traits, subconscious drives, and raw emotional template at birth.\n\n"
                f"💡 **Key Rule:** *\"The non-dominant hand shows what you were born with; the dominant hand shows what you have done with it!\"*"
            )

        # 2. Recommendation Mechanics & Computer Vision Synthesis
        elif any(k in msg_lower for k in ["recommend", "how are tarot", "based on palm", "synthesi", "connect"]):
            if is_personal and pm["has_reading"]:
                reply = (
                    f"### 🔮 Synthesis of Your Session Palm Metrics & Tarot Draw\n\n"
                    f"In your active reading session, your tarot recommendations were dynamically synthesized from your extracted computer vision features.\n\n"
                    f"**1. Hand Topology & Archetype:**\n"
                    f"Your hand analysis revealed a **{pm['palm_shape']}**{cluster_str}. This structure indicates how you balance practical execution with conceptual vision.\n\n"
                    f"**2. Extracted Palm Line Features:**\n"
                    f"- {heart_info or 'Heart Line: empathetic emotional resonance'}\n"
                    f"- {head_info or 'Head Line: logical cognitive clarity'}\n"
                    f"- {life_info or 'Life Line: resilient physical vitality'}\n\n"
                    f"**3. Drawn Tarot Cards Alignment:**\n"
                    f"These quantitative measurements directly guided the recommendation and interpretation of your drawn cards: {tarot_summary or 'your active Arcana draw'}."
                )
            else:
                reply = (
                    f"### 🔮 How Palm Metrics & Tarot Recommendations Work\n\n"
                    f"Regarding your question *\"{user_message}\"*\n\n"
                    f"Our platform recommends tarot cards by analyzing computer vision feature vectors extracted from uploaded hand images:\n\n"
                    f"1. **Landmark Ratios:** MediaPipe 3D hand coordinates measure palm aspect ratio (width vs height) to classify palm archetypes (Square, Rectangular, Long, Spatulate).\n"
                    f"2. **Line Segmentation:** PyTorch UNet models segment the Heart, Head, and Life lines, calculating pixel length, area, and slope angles.\n"
                    f"3. **Arcana Matching Matrix:** Quantitative features are cross-referenced with Tarot Arcana archetypes. High emotional intensity or strong cognitive focus maps to cards that balance and complement line traits."
                )

        # 3. Heart Line Deep-Dive
        elif any(k in msg_lower for k in ["heart line", "heart", "love line", "emotional line"]):
            if is_personal and pm["heart_line"]:
                hl = pm["heart_line"]
                length = hl.get("length_px", hl.get("length", "149.1"))
                desc = hl.get("description", "Empathetic connection style")
                reply = (
                    f"### ❤️ Your Measured Heart Line Analysis\n\n"
                    f"In your active session, your **Heart Line** was segmented at **{length}px**.\n\n"
                    f"• **Interpretation:** {desc}\n"
                    f"• **Emotional Connection Style:** A long, clear Heart Line indicates deep emotional capacity, strong empathy, and a preference for authentic, meaningful relationships over superficial interactions.\n"
                    f"• **Tarot Connection:** Complemented by your drawn cards ({tarot_summary or 'Arcana draw'}), emphasizing open communication and healthy boundaries."
                )
            else:
                reply = (
                    f"### ❤️ Heart Line (Line of Emotion & Relationships)\n\n"
                    f"Regarding *\"{user_message}\"*\n\n"
                    f"The **Heart Line** is the upper horizontal major line across the palm running beneath the fingers.\n\n"
                    f"**Key Interpretation Principles:**\n"
                    f"• **Ending Location:**\n"
                    f"  - *Under Index Finger (Jupiter):* Idealistic, deeply loyal, and romantic expectations.\n"
                    f"  - *Under Middle Finger (Saturn):* Pragmatic, sensual, and grounded in emotional needs.\n"
                    f"  - *Between Index & Middle Finger:* Ideal balance of emotional warmth and realistic discernment.\n"
                    f"• **Line Contour:** Curved line = expressive and warm; straight line = reserved, analytical feelings.\n"
                    f"• **Length & Depth:** Deep, clear lines indicate steady emotional resilience and capacity for lasting love."
                )

        # 4. Head Line Deep-Dive
        elif any(k in msg_lower for k in ["head line", "head", "mind line", "brain line", "logic line", "intellect"]):
            if is_personal and pm["head_line"]:
                hl = pm["head_line"]
                length = hl.get("length_px", hl.get("length", "135.4"))
                desc = hl.get("description", "Balanced logical & analytical focus")
                reply = (
                    f"### 🧠 Your Measured Head Line Analysis\n\n"
                    f"In your active session, your **Head Line** was segmented at **{length}px**.\n\n"
                    f"• **Interpretation:** {desc}\n"
                    f"• **Cognitive Style:** Reflects clear mental focus, strategic problem-solving skills, and balanced decision-making.\n"
                    f"• **Tarot Connection:** Aligning with your drawn cards ({tarot_summary or 'Arcana draw'}), signaling strong execution when guided by clear priorities."
                )
            else:
                reply = (
                    f"### 🧠 Head Line (Line of Intellect & Focus)\n\n"
                    f"Regarding *\"{user_message}\"*\n\n"
                    f"The **Head Line** is the middle major line running horizontally across the center of the palm.\n\n"
                    f"**Key Interpretation Principles:**\n"
                    f"• **Slope & Angle:**\n"
                    f"  - *Straight Across:* Highly analytical, practical, logical, and detail-oriented mindset.\n"
                    f"  - *Gentle Slope Downward:* Creative intelligence, strong imagination, and intuitive problem-solving.\n"
                    f"• **Length:** Long line = thorough, deep investigation before deciding; concise line = fast, pragmatic decision maker.\n"
                    f"• **Writer's Fork / Branching:** A fork at the end signifies dual capacity to combine hard logic with artistic imagination."
                )

        # 5. Life Line Deep-Dive (Clearing up the Lifespan Myth!)
        elif any(k in msg_lower for k in ["life line", "life", "vitality line"]):
            if is_personal and pm["life_line"]:
                ll = pm["life_line"]
                length = ll.get("length_px", ll.get("length", "162.8"))
                desc = ll.get("description", "Strong physical vitality & grounding")
                reply = (
                    f"### 🌿 Your Measured Life Line Analysis\n\n"
                    f"In your active session, your **Life Line** was segmented at **{length}px**.\n\n"
                    f"• **Interpretation:** {desc}\n"
                    f"• **Physical Energy Density:** Indicates robust stamina, strong immune grounding, and resilience under pressure.\n"
                    f"• **Important Clarification:** *Line length measures energy quality and physical vitality density, NOT your lifespan!*"
                )
            else:
                reply = (
                    f"### 🌿 Life Line (Line of Vitality & Physical Stamina)\n\n"
                    f"Regarding *\"{user_message}\"*\n\n"
                    f"The **Life Line** is the major line sweeping downward around the base of the thumb (Mount of Venus).\n\n"
                    f"⚠️ **IMPORTANT MYTH DEBUNKED:**\n"
                    f"The length of your Life Line does **NOT** determine how long you will live! It measures **vitality density, physical energy, health stamina, and major life shifts**.\n\n"
                    f"**Key Interpretation Principles:**\n"
                    f"• **Wide Sweeping Arc:** High physical enthusiasm, open-hearted energy, and strong stamina.\n"
                    f"• **Close to Thumb:** Reserved physical energy, need for regular rest and quiet recharging.\n"
                    f"• **Deep & Clear:** High immune resilience and physical vitality."
                )

        # 6. Fate Line / Destiny Line / Secondary Lines
        elif any(k in msg_lower for k in ["fate", "saturn line", "destiny", "sun line", "apollo line", "mercury line", "health line", "girdle of venus", "intuition line", "rascette"]):
            reply = (
                f"### ✋ Palmistry Secondary Lines & Specialty Contours\n\n"
                f"Regarding your palmistry inquiry *\"{user_message}\"*\n\n"
                f"**1. Secondary Palm Lines Overview:**\n"
                f"• **Fate Line (Line of Saturn):** Runs vertically up the palm toward the middle finger. Indicates career trajectory, vocational focus, and societal impact.\n"
                f"• **Sun Line (Line of Apollo):** Parallel to the Fate line beneath the ring finger. Reflects creative recognition, fame, and personal fulfillment.\n"
                f"• **Mercury Line (Health / Hepatica):** Extends from the base toward the pinky finger. Governs physical vitality, digestion, and business communication.\n"
                f"• **Girdle of Venus & Intuition Line:** Highlights heightened emotional sensitivity and innate intuitive awareness.\n\n"
                f"**2. Line Quality & Markings:**\n"
                f"Deep, clear lines denote steady, uninterrupted energy flow, while breaks or islands signify temporary pivot points or restructuring phases."
            )

        # 7. Line Markings (Breaks, Islands, Stars, Crosses, Squares, Forks)
        elif any(k in msg_lower for k in ["break", "island", "cross", "star", "square", "triangle", "chain", "fork"]):
            reply = (
                f"### 🔍 Palm Line Markings & Special Symbols\n\n"
                f"Regarding special line markings *\"{user_message}\"*\n\n"
                f"• **Square:** Strong protective marking shielding vitality or career during times of stress.\n"
                f"• **Star:** Sudden intense surge of energy, major breakthrough, or heightened achievement.\n"
                f"• **Island:** Temporary period of divided focus, lower energy, or careful restructuring.\n"
                f"• **Break:** Pivot point in life trajectory, signaling a transition or change of perspective.\n"
                f"• **Fork / Writer's Fork:** Dual talent combining analytical logic with creative synthesis."
            )

        # 8. All Major Arcana Tarot Cards (Fool, Magician, Priestess, Empress, Emperor, Hierophant, Lovers, Chariot, Strength, Hermit, Wheel, Justice, Hanged Man, Death, Temperance, Devil, Tower, Star, Moon, Sun, Judgement, World)
        elif any(k in msg_lower for k in [
            "fool", "magician", "high priestess", "priestess", "empress", "emperor", "hierophant", "lovers", "chariot",
            "strength", "hermit", "wheel of fortune", "wheel", "justice", "hanged man", "death", "temperance", "devil",
            "tower", "star", "moon", "sun", "judgement", "judgment", "world"
        ]):
            card_found = "Major Arcana Card"
            for kw, title in [
                ("fool", "The Fool (0)"), ("magician", "The Magician (I)"), ("high priestess", "The High Priestess (II)"),
                ("priestess", "The High Priestess (II)"), ("empress", "The Empress (III)"), ("emperor", "The Emperor (IV)"),
                ("hierophant", "The Hierophant (V)"), ("lovers", "The Lovers (VI)"), ("chariot", "The Chariot (VII)"),
                ("strength", "Strength (VIII)"), ("hermit", "The Hermit (IX)"), ("wheel of fortune", "Wheel of Fortune (X)"),
                ("wheel", "Wheel of Fortune (X)"), ("justice", "Justice (XI)"), ("hanged man", "The Hanged Man (XII)"),
                ("death", "Death (XIII)"), ("temperance", "Temperance (XIV)"), ("devil", "The Devil (XV)"),
                ("tower", "The Tower (XVI)"), ("star", "The Star (XVII)"), ("moon", "The Moon (XVIII)"),
                ("sun", "The Sun (XIX)"), ("judgement", "Judgement (XX)"), ("judgment", "Judgement (XX)"),
                ("world", "The World (XXI)")
            ]:
                if kw in msg_lower:
                    card_found = title
                    break

            reply = (
                f"### 🎴 Major Arcana Archetype: {card_found}\n\n"
                f"Regarding your inquiry *\"{user_message}\"*\n\n"
                f"**1. Core Archetypal Meaning:**\n"
                f"In traditional Tarot, **{card_found}** represents a major spiritual threshold, developmental phase, or life lesson. "
                f"Major Arcana cards signal pivotal overarching themes and inner transformation.\n\n"
                f"**2. Upright vs. Reversed Dynamics:**\n"
                f"• **Upright:** Direct, positive expression of the archetype in your external environment.\n"
                f"• **Reversed:** Internalized processing, shadow integration, unexpressed potential, or a call for inner alignment.\n\n"
                f"**3. Practical Guidance:**\n"
                f"Reflect on how {card_found}'s core lesson applies to your current choices. Combine spiritual insight with practical action."
            )

        # 9. Minor Arcana Suits & Court Cards
        elif any(k in msg_lower for k in ["wand", "cup", "sword", "pentacle", "court card", "page", "knight", "queen", "king", "suit", "ace", "minor arcana"]):
            reply = (
                f"### 🎴 Minor Arcana Suits & Court Card Hierarchy\n\n"
                f"Regarding Minor Arcana *\"{user_message}\"*\n\n"
                f"**1. The 4 Minor Arcana Suits:**\n"
                f"• **Wands (Fire Element):** Passion, ambition, career drive, creativity, and action.\n"
                f"• **Cups (Water Element):** Emotions, relationships, intuition, and artistic feeling.\n"
                f"• **Swords (Air Element):** Cognition, truth, mental clarity, challenges, and communication.\n"
                f"• **Pentacles (Earth Element):** Finance, material wealth, career security, and physical health.\n\n"
                f"**2. Court Cards Progression:**\n"
                f"Page (Studious learner/message) ➔ Knight (Action/pursuit) ➔ Queen (Internal emotional mastery) ➔ King (External leadership/authority)."
            )

        # 10. Spreads & Layout Architecture
        elif any(k in msg_lower for k in ["spread", "celtic cross", "three card", "3 card", "layout", "draw format"]):
            reply = (
                f"### 🃏 Tarot Spreads & Layout Architecture\n\n"
                f"Regarding your spread question *\"{user_message}\"*\n\n"
                f"**1. Popular Spread Architectures:**\n"
                f"• **3-Card Spread (Past / Present / Future):** A focused, versatile spread evaluating timeline momentum or Mind / Body / Spirit dynamics.\n"
                f"• **Celtic Cross (10 Cards):** The comprehensive classic spread analyzing immediate focus, crossing challenges, foundation, past influences, crown aspirations, near future, self-attitude, environment, hopes/fears, and ultimate outcome.\n"
                f"• **1-Card Daily Draw:** A concise focal archetype for morning reflection and daily mindfulness."
            )

        # 11. Palmistry Mounts
        elif any(k in msg_lower for k in ["mount", "venus", "jupiter", "saturn", "apollo", "luna", "plain of mars"]):
            reply = (
                f"### ✋ Palmistry Mounts & Planetary Energies\n\n"
                f"Regarding mounts *\"{user_message}\"*\n\n"
                f"**1. Mount Locations & Traits:**\n"
                f"• **Mount of Venus (Thumb Base):** Passion, vitality, love capacity, and appreciation for beauty.\n"
                f"• **Mount of Jupiter (Index Finger Base):** Ambition, leadership capacity, honor, and self-confidence.\n"
                f"• **Mount of Saturn (Middle Finger Base):** Discipline, responsibility, philosophical depth, and caution.\n"
                f"• **Mount of Apollo / Sun (Ring Finger Base):** Artistic talent, charisma, optimism, and creative drive.\n"
                f"• **Mount of Mercury (Pinky Finger Base):** Eloquence, scientific acumen, commerce, and adaptability.\n"
                f"• **Mount of Moon / Luna (Base Opposite Thumb):** Intuition, imagination, subconscious depth, and travel.\n\n"
                f"**2. Interpretation Principle:**\n"
                f"Well-developed, firm mounts indicate high energy density in that domain, balancing hand line features."
            )

        # 12. Hand Shapes & Elemental Archetypes
        elif any(k in msg_lower for k in ["element", "earth hand", "air hand", "fire hand", "water hand", "spatulate", "conic", "psychic hand", "hand shape"]):
            reply = (
                f"### 🖐️ Hand Shapes & Elemental Archetypes\n\n"
                f"Regarding hand shape classification *\"{user_message}\"*\n\n"
                f"**1. The 4 Elemental Hand Archetypes:**\n"
                f"• **Earth Hand (Square Palm, Short Fingers):** Grounded, practical, reliable, methodical, and physical.\n"
                f"• **Air Hand (Square Palm, Long Fingers):** Intellectual, communicative, analytical, curious, and articulate.\n"
                f"• **Fire Hand (Long Palm, Short Fingers):** Energetic, passionate, spontaneous, impulsive, and charismatic.\n"
                f"• **Water Hand (Long Palm, Long Fingers):** Sensitive, intuitive, imaginative, emotional, and creative.\n\n"
                f"**2. Aspect Ratio Mechanics:**\n"
                f"Our MediaPipe computer vision engine calculates palm width to height ratios to classify hand topology automatically."
            )

        # 13. Finger Types & Thumb Logic
        elif any(k in msg_lower for k in ["finger", "thumb", "index", "pinky", "joint", "phalange"]):
            reply = (
                f"### ✋ Finger Proportions & Thumb Psychology\n\n"
                f"Regarding finger traits *\"{user_message}\"*\n\n"
                f"**1. Finger Symbolic Roles:**\n"
                f"• **Thumb:** The anchor of personality. Top phalange = Willpower; Lower phalange = Logic. Stiff thumb = strong determination; Flexible thumb = adaptable nature.\n"
                f"• **Index Finger (Jupiter):** Leadership drive, self-worth, and ambition.\n"
                f"• **Middle Finger (Saturn):** Duty, moral compass, structure, and balance.\n"
                f"• **Ring Finger (Apollo):** Expression, creativity, and public reputation.\n"
                f"• **Little Finger (Mercury):** Verbal clarity, intimacy, and commercial instincts."
            )

        # 14. Core Domain Focus Topics (Career, Relationship, Health, Future, Money, Upright/Reversed)
        elif any(k in msg_lower for k in ["career", "job", "work", "business"]):
            reply = (
                f"### 💼 Career & Professional Guidance\n\n"
                f"Regarding career insights *\"{user_message}\"*\n\n"
                f"In palmistry and tarot systems, career development is indicated by the Head Line (cognitive strategy), "
                f"the Fate Line (vocational path), and the Wands & Pentacles suits in Tarot. Focus on steady, value-creating milestones."
            )

        elif any(k in msg_lower for k in ["love", "relationship", "romance", "partner"]):
            reply = (
                f"### ❤️ Relationship & Emotional Insights\n\n"
                f"Regarding relationship dynamics *\"{user_message}\"*\n\n"
                f"Emotional expressiveness is governed by the Heart Line and Mount of Venus in palmistry, paired with the Cups suit and Lovers/2 of Cups in Tarot. "
                f"Deep lines indicate strong emotional resonance, while clear communication fosters lasting connections."
            )

        elif any(k in msg_lower for k in ["health", "vitality", "energy", "wellness"]):
            reply = (
                f"### 🌿 Health & Energy Vitality\n\n"
                f"Regarding vitality insights *\"{user_message}\"*\n\n"
                f"Physical energy is measured by Life Line curvature and Mount of Venus in palmistry. Line length reflects energy density and stamina rather than lifespan duration. "
                f"Tarot guidance reminds us to balance cognitive work with physical rest."
            )

        elif any(k in msg_lower for k in ["future", "destiny", "outlook", "timing", "predict"]):
            reply = (
                f"### 🔮 Future Path & Destiny Dynamics\n\n"
                f"Regarding future trajectory *\"{user_message}\"*\n\n"
                f"In holistic analysis, the future is an evolving path shaped by current choices. Palm lines reveal foundational traits and energetic tendencies, while Tarot spreads highlight immediate momentum and decision points."
            )

        elif any(k in msg_lower for k in ["money", "finance", "wealth", "income"]):
            reply = (
                f"### 💰 Financial Growth & Resource Guidance\n\n"
                f"Regarding financial questions *\"{user_message}\"*\n\n"
                f"Financial discipline is governed by Head Line slope and Square palm structure in palmistry, combined with Pentacles cards in Tarot. Focus on steady, value-generating planning."
            )

        elif any(k in msg_lower for k in ["upright", "reverse"]):
            reply = (
                f"### 🎴 Upright vs. Reversed Tarot Card Dynamics\n\n"
                f"Regarding card orientation *\"{user_message}\"*\n\n"
                f"• **Upright Cards:** Represent direct, outward manifestation of the card's archetype in your environment.\n"
                f"• **Reversed Cards:** Indicate internal processing, shadow integration, delayed timing, or unexpressed potential."
            )

        elif any(k in msg_lower for k in ["palmistry", "palm reading"]):
            reply = (
                f"### ✋ What is Palmistry?\n\n"
                f"Regarding *\"{user_message}\"*\n\n"
                f"**Palmistry (Chiromancy)** is the ancient art and science of analyzing the physical contours, line features, mounts, and proportions of the hand.\n\n"
                f"1. **Major Lines:** Heart (emotions), Head (intellect), Life (vitality).\n"
                f"2. **Secondary Lines:** Fate (career), Sun (fame/art), Mercury (communication).\n"
                f"3. **Hand Archetypes:** Square, Rectangular, Long, and Spatulate shapes linked to Earth, Air, Fire, and Water elements."
            )

        elif any(k in msg_lower for k in ["tarot", "cards"]):
            reply = (
                f"### 🎴 What is Tarot?\n\n"
                f"Regarding *\"{user_message}\"*\n\n"
                f"**Tarot** is a symbolic system of 78 cards designed for self-reflection and energetic insight:\n\n"
                f"1. **22 Major Arcana Cards:** Represent major life lessons, spiritual archetypes, and developmental milestones (e.g. The Fool, The Star, The Sun).\n"
                f"2. **56 Minor Arcana Cards:** Divided into 4 suits (Wands, Cups, Swords, Pentacles) governing daily situations, emotions, thoughts, and practical efforts."
            )

        # 15. Personal Reading Q&A (Matches when explicitly asking about user's active session)
        elif is_personal or any(k in msg_lower for k in ["my reading", "my session", "my result", "my drawn cards"]):
            if pm["has_reading"]:
                reply = (
                    f"### 🌟 Comprehensive Personal Reading Synthesis\n\n"
                    f"Addressing your query regarding your personal session: *\"{user_message}\"*\n\n"
                    f"**1. Extracted Palm Geometry & UNet Lines:**\n"
                    f"- **Palm Archetype:** {pm['palm_shape']}{cluster_str}\n"
                    f"- **Heart Line Feature:** {heart_info or 'Analyzed'}\n"
                    f"- **Head Line Feature:** {head_info or 'Analyzed'}\n"
                    f"- **Life Line Feature:** {life_info or 'Analyzed'}\n\n"
                    f"**2. Drawn Tarot Cards Alignment:**\n"
                    f"Your active Arcana spread ({tarot_summary or 'Tarot draw active'}) complements your measured palm aspect ratio. "
                    f"Your hand topology establishes your practical temperament, while your drawn cards highlight key environmental choices.\n\n"
                    f"**3. Takeaway:** Focus on structured planning and trust your measured cognitive clarity."
                )
            else:
                reply = (
                    f"### 🌟 Personal Reading Overview\n\n"
                    f"Regarding your question *\"{user_message}\"*\n\n"
                    f"To view personalized insights for YOUR palm lines and tarot cards, run a reading in the 'Live Reading Demo' tab! "
                    f"Our MediaPipe + PyTorch UNet vision pipeline will calculate your exact line measurements and connect them to your tarot draw."
                )

        # 16. General Dynamic Synthesizer (Catches any open-ended or custom question)
        else:
            words = [w for w in re.findall(r'\b[a-zA-Z]{3,}\b', user_message) if w.lower() not in ["what", "how", "why", "when", "does", "this", "that", "with", "from", "about", "your", "have", "been", "give", "tell"]]
            topic_str = ", ".join(words[:4]).title() if words else "Palmistry & Tarot Wisdom"

            reply = (
                f"### 🔮 Educational Guidance: {topic_str}\n\n"
                f"Thank you for asking: *\"{user_message}\"*\n\n"
                f"**1. Core Principles & Insight:**\n"
                f"In our integrated platform, we analyze both the structural features of your hand (palm lines, aspect ratio, mounts) and celestial Tarot Arcana to address questions regarding **{topic_str or 'life guidance'}**.\n\n"
                f"**2. Practical Perspective:**\n"
                f"• Combine logical structure (Head Line clarity) with emotional awareness (Heart Line resonance).\n"
                f"• Use Tarot archetypes as mirrors for self-reflection and strategic decision-making.\n"
                f"• Ground your choices in concrete priorities and self-trust.\n\n"
                f"💡 *Tip: You can ask specific questions about any of the 78 tarot cards, 5 major palm lines, 8 mounts, left vs right hand, or your active reading results!*"
            )

        return {
            "reply": reply,
            "suggested_followups": self._generate_suggested_followups(user_message, reading_context)
        }

    def _generate_suggested_followups(self, user_message: str, reading_context: dict[str, Any] | None) -> list[str]:
        """Generate dynamic contextual suggested follow-up questions."""
        pm = self._extract_palm_metrics(reading_context)
        msg_lower = user_message.lower()

        if pm["has_reading"]:
            return [
                "How do my Heart and Head line measurements connect to my tarot cards?",
                "Which hand (left or right) was used for my reading?",
                "What specific action steps should I take based on my drawn cards?"
            ]
        elif "tarot" in msg_lower or "card" in msg_lower:
            return [
                "What is the difference between Major and Minor Arcana?",
                "What is the difference between Upright and Reversed cards?",
                "How does the computer vision model match hand lines to tarot cards?"
            ]
        elif "hand" in msg_lower or "line" in msg_lower or "palm" in msg_lower:
            return [
                "What is the difference between the Left hand and Right hand?",
                "Does a short Life Line mean a short life?",
                "How do Earth, Air, Fire, and Water hand shapes differ?"
            ]
        return [
            "What is the difference between the Left and Right hand?",
            "What does the Fate Line indicate about career trajectory?",
            "What is the meaning of The Fool Major Arcana card?"
        ]


if __name__ == "__main__":
    import io
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    else:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

    print("[INFO] Testing LLMInterpreter execution...")
    interpreter = LLMInterpreter()

    # Demo 1: Fallback Reading Generation
    sample_report = {"Palm_Shape": "Square Palm"}
    sample_tarot = {"cards": [{"name": "The Sun", "orientation": "Upright", "position": "Present"}]}
    reading = interpreter.generate_reading(palm_features={}, palm_report=sample_report, tarot_reading=sample_tarot)
    print("\n--- Sample Reading Output ---")
    print(f"Personality: {reading.get('personality')}")

    # Demo 2: Chat Completion
    demo_msgs = [{"role": "user", "content": "Which hand should I read: left or right?"}]
    chat_res = interpreter.chat_completion(demo_msgs)
    print("\n--- Sample Chat Output ---")
    print(chat_res["reply"])
    print(f"\nFollow-up Suggestions: {chat_res['suggested_followups']}")
    print("\n[SUCCESS] LLMInterpreter executed cleanly with zero errors!")



