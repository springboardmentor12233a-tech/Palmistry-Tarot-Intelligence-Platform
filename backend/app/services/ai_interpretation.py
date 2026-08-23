import json
import logging
from typing import Any, Dict, List, Optional
from groq import Groq
from app.core.config import settings
from app.schemas.palm import PalmAnalysisResult
from app.schemas.reading import (
    CategoryInsight,
    HorizonForecast,
    Interpretation,
    LifeTrendAnalysis,
    PersonalityIntelligence,
    Recommendations,
    UserContext,
)
from app.schemas.tarot import TarotDrawResult

logger = logging.getLogger(__name__)


class AIInterpretationService:
    """Service wrapping Groq LLM interpretation prompts and synthesis."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL
        self.fallback_model = settings.GROQ_FALLBACK_MODEL
        self._client: Optional[Groq] = None

    @property
    def client(self) -> Optional[Groq]:
        if self._client is None and self.api_key and not self.api_key.startswith("your_"):
            try:
                self._client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")
                self._client = None
        return self._client

    def _clean_json_output(self, raw: str) -> Dict[str, Any]:
        """Cleans markdown code fences and parses JSON securely."""
        text = raw.strip()
        if text.startswith("```"):
            parts = text.split("```")
            if len(parts) >= 2:
                text = parts[1]
                if text.startswith("json"):
                    text = text[4:]
        text = text.strip()
        return json.loads(text)

    def generate_structured_interpretation(
        self, palm_row_contents: List[str], tarot_spread: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Extracted directly from notebook:
        Generates core narrative, personality traits, strengths, growth areas,
        and past/present/future descriptions.
        """
        # Build palm facts
        heart_text = (palm_row_contents[0] + " " + palm_row_contents[1]) if len(palm_row_contents) >= 2 else "Harmonious connection and warmth."
        head_text = (palm_row_contents[2] + " " + palm_row_contents[3]) if len(palm_row_contents) >= 4 else "Sharp intellectual discernment."
        life_text = (palm_row_contents[4] + " " + palm_row_contents[5]) if len(palm_row_contents) >= 6 else "Vitality and rooted endurance."

        palm_facts = f"Heart line: {heart_text}\nHead line: {head_text}\nLife line: {life_text}"

        position_labels = ["Past", "Present", "Future"]
        tarot_facts = ""
        for i, card in enumerate(tarot_spread[:3]):
            label = position_labels[i] if i < len(position_labels) else f"Position {i+1}"
            orientation = card.get("orientation", "upright")
            if "is_reversed" in card:
                orientation = "reversed" if card.get("is_reversed") else "upright"

            card_obj = card.get("card", card)
            name = card_obj.get("name", "Major Arcana")
            keywords = card_obj.get("keywords", ["spiritual", "growth"])
            meanings = card_obj.get("meanings", {})

            if isinstance(meanings, dict):
                pool = meanings.get("light", []) if orientation == "upright" else meanings.get("shadow", [])
            else:
                pool = [card_obj.get("upright_meaning", "")]

            keywords_str = ", ".join(keywords[:4])
            meanings_str = ", ".join(pool[:3]) if pool else "awakening"
            tarot_facts += f"{label}: {name} ({orientation}) - keywords: {keywords_str}; meanings: {meanings_str}\n"

        prompt = f"""You are a spiritual guide and personality analyst. Based on the palm and tarot facts below, respond with ONLY a valid JSON object (no markdown, no extra text) with these exact keys:

{{
  "narrative_reading": "a 150-200 word flowing personalized reading combining palm and tarot",
  "personality_traits": ["3-4 short trait words/phrases"],
  "strengths": ["2-3 short strength phrases"],
  "growth_areas": ["2-3 short gentle growth-area phrases, framed constructively"],
  "past_description": "1-2 sentences describing what the Past tarot card reveals about this person's past",
  "present_description": "1-2 sentences describing what the Present tarot card reveals about their current life phase",
  "future_description": "1-2 sentences describing what the Future tarot card suggests is ahead for them"
}}

PALM READING FACTS:
{palm_facts}

TAROT SPREAD FACTS:
{tarot_facts}

Respond with ONLY the JSON object:"""

        client = self.client
        if client:
            try:
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=1200,
                )
                return self._clean_json_output(response.choices[0].message.content)
            except Exception as e:
                logger.warning(f"Primary Groq call failed ({e}), attempting fallback model...")
                try:
                    response = client.chat.completions.create(
                        model=self.fallback_model,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.7,
                        max_tokens=1200,
                    )
                    return self._clean_json_output(response.choices[0].message.content)
                except Exception as e2:
                    logger.error(f"Groq API call error: {e2}")

        # High quality fallback
        first_card_name = tarot_spread[0].get("card", tarot_spread[0]).get("name", "The Magician") if tarot_spread else "The Star"
        return {
            "narrative_reading": (
                f"Your biometric lines and archetypal draw reveal an auspicious window of transformative growth. "
                f"The deliberate contours of your Head Line mirror the wisdom of {first_card_name}, indicating that "
                "your intuitive gifts are ready to materialize into grounded reality. While your past was defined by "
                "karmic preparation and inner cultivation, your present is asking for courageous sovereign action. "
                "By aligning your deep heart discernment with disciplined purpose, you will unlock unprecedented spiritual and material fruition."
            ),
            "personality_traits": ["Intuitive Visionary", "Empathetic Leader", "Analytical Synthesizer", "Autonomous Thinker"],
            "strengths": ["Clear strategic discernment", "Profound emotional loyalty", "Creative problem solving"],
            "growth_areas": ["Releasing excessive perfectionism", "Trusting divine timing", "Setting firm boundaries"],
            "past_description": "Foundational trials have forged resilience and deep inner wisdom in your character.",
            "present_description": "You stand at a pivotal crossroads requiring confident ownership of your authentic destiny.",
            "future_description": "Emerging horizons promise expansive fulfillment, collaborative elevation, and joyful mastery.",
        }

    def generate_recommendations(self, structured_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracted from notebook:
        Generates actionable life coaching guidance.
        """
        prompt = f"""You are a life coach. Based on this personality profile, respond with ONLY a valid JSON object (no markdown) with these exact keys:

{{
  "personal_growth": "one specific actionable recommendation (1 sentence)",
  "relationship_guidance": "one specific relationship recommendation (1 sentence)",
  "career_suggestion": "one specific career suggestion (1 sentence)",
  "goal_alignment": "one suggestion for aligning daily actions with long-term goals (1 sentence)"
}}

Traits: {', '.join(structured_result.get('personality_traits', []))}
Strengths: {', '.join(structured_result.get('strengths', []))}
Growth areas: {', '.join(structured_result.get('growth_areas', []))}

Respond with ONLY the JSON object:"""

        client = self.client
        if client:
            try:
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=600,
                )
                return self._clean_json_output(response.choices[0].message.content)
            except Exception:
                try:
                    response = client.chat.completions.create(
                        model=self.fallback_model,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.7,
                        max_tokens=600,
                    )
                    return self._clean_json_output(response.choices[0].message.content)
                except Exception as e:
                    logger.error(f"Groq recommendations error: {e}")

        return {
            "personal_growth": "Dedicate 15 minutes each morning to journaling your highest intentions before engaging with external demands.",
            "relationship_guidance": "Communicate your emotional boundaries directly with warmth, honoring both your sovereignty and intimacy.",
            "career_suggestion": "Consolidate your dispersed talents into a unified creative offering or high-leverage project.",
            "goal_alignment": "Break your quarterly aspirations into daily micro-commitments to maintain steady, joyful momentum.",
        }

    def generate_life_trend_analysis(self, structured_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracted from notebook:
        Generates overarching life theme, opportunities, challenges, and growth trajectory.
        """
        prompt = f"""You are a life-trend analyst. Based on this profile, respond with ONLY a valid JSON object (no markdown) with these exact keys:

{{
  "life_path_theme": "short phrase capturing the overarching life path theme",
  "opportunity": "one specific opportunity this person is well-positioned for (1 sentence)",
  "potential_challenge": "one constructive challenge to be mindful of (1 sentence)",
  "growth_potential": "one sentence on their growth trajectory"
}}

Traits: {', '.join(structured_result.get('personality_traits', []))}
Strengths: {', '.join(structured_result.get('strengths', []))}
Present life phase: {structured_result.get('present_description', 'Pivotal crossroads')}

Respond with ONLY the JSON object:"""

        client = self.client
        if client:
            try:
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=600,
                )
                return self._clean_json_output(response.choices[0].message.content)
            except Exception:
                try:
                    response = client.chat.completions.create(
                        model=self.fallback_model,
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.7,
                        max_tokens=600,
                    )
                    return self._clean_json_output(response.choices[0].message.content)
                except Exception as e:
                    logger.error(f"Groq life trend error: {e}")

        return {
            "life_path_theme": "Sovereign Manifestation & Creative Alchemy",
            "opportunity": "You are primed to lead a significant collaborative endeavor that expands your spiritual and material horizons.",
            "potential_challenge": "Guard against impatience by remembering that deep roots sustain the tallest crowns.",
            "growth_potential": "Your capacity for conscious expansion is exceptionally strong, accelerating breakthroughs over the next six months.",
        }

    def synthesize_full_reading(
        self,
        palm_result: PalmAnalysisResult,
        tarot_result: TarotDrawResult,
        user_context: Optional[UserContext] = None,
    ) -> Dict[str, Any]:
        """
        Synthesizes the complete reading structure including all category narratives,
        personality intelligence, life trend horizons, and recommendations.
        """
        # 1. Run the 3 notebook prompts
        raw_spread = [c.model_dump() for c in tarot_result.cards]
        structured_ai = self.generate_structured_interpretation(palm_result.contents, raw_spread)
        recs_ai = self.generate_recommendations(structured_ai)
        trend_ai = self.generate_life_trend_analysis(structured_ai)

        primary_card_name = tarot_result.cards[0].card.name if tarot_result.cards else "The Magician"

        # 2. Build Category Insights for frontend tabs
        categories = [
            CategoryInsight(
                key="personality",
                title="Personality & Soul Architecture",
                score=95,
                summary=f"A synthesis of {', '.join(structured_ai.get('personality_traits', ['Wisdom', 'Courage'])[:3])}.",
                detailed_narrative=(
                    f"{structured_ai.get('narrative_reading', '')} "
                    f"Your hand features a pronounced {palm_result.lines.head_line.name} which reinforces high strategic stamina."
                ),
                key_takeaways=structured_ai.get("strengths", []) + structured_ai.get("growth_areas", []),
                astrological_influence="Solar-Jupiterian Resonance",
                palm_correlation=f"{palm_result.hand_type} with {palm_result.lines.head_line.curvature} head line",
                tarot_correlation=primary_card_name,
            ),
            CategoryInsight(
                key="relationships",
                title="Relational Resonance & Soul Ties",
                score=91,
                summary="A phase of establishing authentic reciprocity and heartfelt clarity in partnerships.",
                detailed_narrative=(
                    f"{palm_result.lines.heart_line.summary} "
                    f"{recs_ai.get('relationship_guidance', 'Cultivate openhearted communication.')}"
                ),
                key_takeaways=[
                    "Communicate transparently without defensiveness",
                    "Surround yourself with companions who respect your intellectual autonomy",
                    "Deepen existing sacred bonds through active appreciation",
                ],
                astrological_influence="Venus Trine Jupiter",
                palm_correlation=palm_result.lines.heart_line.name,
                tarot_correlation=f"{primary_card_name} Resonance",
            ),
            CategoryInsight(
                key="career",
                title="Career, Vocation & Sovereign Purpose",
                score=96,
                summary="A massive upward trajectory unlocked by leaning into specialized creative mastery.",
                detailed_narrative=(
                    f"{trend_ai.get('opportunity', 'Significant career openings await.')} "
                    f"{recs_ai.get('career_suggestion', 'Channel focus into high-impact initiatives.')}"
                ),
                key_takeaways=[
                    "Take visible ownership of high-leverage initiatives",
                    "Consolidate fragmented projects into one primary offering",
                    "Cultivate strategic alliances with complementary innovators",
                ],
                astrological_influence="10th House Solar Activation",
                palm_correlation=palm_result.lines.fate_line.name if palm_result.lines.fate_line else "Dharma Vector",
                tarot_correlation="Archetypal Success Vector",
            ),
            CategoryInsight(
                key="personal_growth",
                title="Personal Evolution & Spiritual Alignment",
                score=93,
                summary=trend_ai.get("growth_potential", "Expansive spiritual evolution is unfolding."),
                detailed_narrative=(
                    f"{structured_ai.get('present_description', '')} "
                    f"{recs_ai.get('personal_growth', '')} "
                    f"{trend_ai.get('potential_challenge', '')}"
                ),
                key_takeaways=[
                    recs_ai.get("personal_growth", "Prioritize mindful daily rituals"),
                    recs_ai.get("goal_alignment", "Align daily actions with long-term goals"),
                    "Maintain emotional equilibrium amidst rapid progress",
                ],
                astrological_influence="Neptunian Awakening",
                palm_correlation=palm_result.lines.life_line.name,
                tarot_correlation="Transmutation Portal",
            ),
        ]

        # 3. Build Personality Intelligence
        traits = structured_ai.get("personality_traits", ["Visionary", "Analytical", "Empathetic"])
        personality = PersonalityIntelligence(
            primary_archetype=f"The {traits[0] if traits else 'Visionary'}",
            secondary_archetype=f"The {traits[1] if len(traits) > 1 else 'Alchemist'}",
            core_strengths=structured_ai.get("strengths", ["Intuitive clarity", "Resilience", "Creative synthesis"]),
            growth_edges=structured_ai.get("growth_areas", ["Releasing perfectionism", "Pacing energy"]),
            behavioral_insights=[
                "Excels in dynamic environments where autonomy is respected",
                "Synthesizes intuitive gut feelings with analytical rigor",
                "Naturally inspires and mentors peers through authentic embodiment",
            ],
            development_recommendations=[
                recs_ai.get("personal_growth", "Engage in daily reflective journaling"),
                recs_ai.get("goal_alignment", "Set clear boundary checkpoints"),
            ],
            temperament_balance={
                "intuition": 92,
                "logic": 86,
                "emotion": 80,
                "action": 88,
            },
        )

        # 4. Build Life Trend Analysis
        life_trend = LifeTrendAnalysis(
            life_path_summary=trend_ai.get("life_path_theme", "Sovereign Manifestation & Creative Alchemy"),
            current_cycle=structured_ai.get("present_description", "Pivotal transformation cycle"),
            upcoming_opportunities=[
                trend_ai.get("opportunity", "Expanded leadership and creative fruition"),
                "High-resonance collaborations that elevate your public profile",
                "Breakthroughs in material and spiritual self-sufficiency",
            ],
            potential_challenges=[
                trend_ai.get("potential_challenge", "Pacing energy to prevent burnout"),
                "Resisting the urge to micromanage unpredictable variables",
            ],
            growth_potential_rating=94,
            horizon_forecast=HorizonForecast(
                near_term=structured_ai.get("present_description", "Immediate integration and clarity."),
                mid_term="A period of tangible public breakthroughs and expanding prosperity (3-6 months).",
                long_term=structured_ai.get("future_description", "Mastery, sovereignty, and deep communal impact."),
            ),
        )

        # 5. Build Recommendations
        recommendations = Recommendations(
            growth=[
                recs_ai.get("personal_growth", "Practice daily grounding meditation."),
                "Honor your energetic rhythm by scheduling regular periods of silence.",
            ],
            relationships=[
                recs_ai.get("relationship_guidance", "Speak your truth with gentle clarity."),
                "Cultivate partnerships based on mutual sovereignty and shared vision.",
            ],
            career=[
                recs_ai.get("career_suggestion", "Focus on high-leverage creative ownership."),
                "Build scalable frameworks for your intellectual assets.",
            ],
            goal_alignment=[
                recs_ai.get("goal_alignment", "Align daily tasks with overarching purpose."),
                "Review progress at each lunar cycle to adjust trajectory.",
            ],
            spiritual_development=[
                "Work with tarot and palm biometrics as contemplative self-inquiry tools.",
                "Dedicate sacred space in your environment for creative contemplation.",
            ],
            daily_mantra="I am sovereign, aligned, and gracefully creating my highest reality.",
            recommended_crystals_or_symbols=[
                "Lapis Lazuli (Mental Clarity & Intuition)",
                "Clear Quartz (Amplification & Focus)",
                "Sunstone (Vitality & Radiant Leadership)",
            ],
        )

        interpretation = Interpretation(
            overview_summary=structured_ai.get("narrative_reading", "Your palm and tarot readings indicate exceptional alignment."),
            categories=categories,
        )

        return {
            "interpretation": interpretation,
            "personality": personality,
            "life_trend": life_trend,
            "recommendations": recommendations,
        }


ai_service = AIInterpretationService()
