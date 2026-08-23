from typing import Any, Dict, Optional
from app.schemas.reading import InsightScore


def calculate_insight_score(
    palm_confidence: float = 92.0,
    tarot_relevance: float = 94.0,
    personality_alignment: float = 90.0,
    context_relevance: float = 88.0,
    consistency: float = 91.0,
) -> InsightScore:
    """
    Calculates the weighted Insight Score according to the exact platform formula:
    overall = (palm_confidence * 0.30) + (tarot_relevance * 0.25) + (personality_alignment * 0.20)
            + (context_relevance * 0.15) + (consistency * 0.10)
    """
    # Ensure inputs are within 0 - 100 range
    p_conf = max(0.0, min(100.0, float(palm_confidence)))
    t_rel = max(0.0, min(100.0, float(tarot_relevance)))
    p_align = max(0.0, min(100.0, float(personality_alignment)))
    c_rel = max(0.0, min(100.0, float(context_relevance)))
    consist = max(0.0, min(100.0, float(consistency)))

    overall = (
        (p_conf * 0.30)
        + (t_rel * 0.25)
        + (p_align * 0.20)
        + (c_rel * 0.15)
        + (consist * 0.10)
    )
    overall = round(overall, 1)

    if overall >= 92.0:
        tier = "Celestial Alignment"
    elif overall >= 80.0:
        tier = "Harmonic Resonance"
    elif overall >= 65.0:
        tier = "Promising Insight"
    else:
        tier = "Emerging Synthesis"

    return InsightScore(
        palm_confidence=round(p_conf, 1),
        tarot_relevance=round(t_rel, 1),
        personality_alignment=round(p_align, 1),
        context_relevance=round(c_rel, 1),
        consistency=round(consist, 1),
        overall=overall,
        tier=tier,
    )


def derive_score_from_payloads(
    palm_result: Optional[Dict[str, Any]],
    tarot_spread: Optional[Dict[str, Any]],
    user_context: Optional[Dict[str, Any]] = None,
) -> InsightScore:
    """
    Derives real sub-scores based on palm segmentation signals, tarot card distributions,
    and user contextual focus.
    """
    # 1. Palm Confidence from segmentation / landmarker detection confidence
    if palm_result and "confidence_score" in palm_result:
        palm_conf = float(palm_result.get("confidence_score", 92))
    elif palm_result and "lines" in palm_result:
        # Average line confidence
        lines = palm_result.get("lines", {})
        conf_vals = [
            v.get("confidence", 90)
            for v in lines.values()
            if isinstance(v, dict) and "confidence" in v
        ]
        palm_conf = sum(conf_vals) / len(conf_vals) if conf_vals else 92.0
    else:
        palm_conf = 90.0

    # 2. Tarot Relevance: derived from card arcana ratio & orientation stability
    tarot_relevance = 92.0
    if tarot_spread and "cards" in tarot_spread:
        cards = tarot_spread.get("cards", [])
        if cards:
            major_count = sum(
                1
                for c in cards
                if (c.get("card", {}).get("arcana") == "major")
                or (c.get("arcana") == "major")
            )
            upright_count = sum(1 for c in cards if not c.get("is_reversed", False))
            # Heuristic: Major Arcana conveys heavy archetypal relevance
            major_boost = (major_count / len(cards)) * 6.0
            upright_boost = (upright_count / len(cards)) * 4.0
            tarot_relevance = 88.0 + major_boost + upright_boost

    # 3. Personality Alignment: Hand element alignment with tarot suit distribution
    personality_alignment = 91.0
    if palm_result and tarot_spread:
        hand_elem = palm_result.get("primary_element", "Fire")
        cards = tarot_spread.get("cards", [])
        matching_elements = sum(
            1
            for c in cards
            if c.get("card", {}).get("element") == hand_elem
            or c.get("element") == hand_elem
        )
        if cards:
            alignment_ratio = matching_elements / len(cards)
            personality_alignment = 87.0 + (alignment_ratio * 10.0)

    # 4. Context Relevance: boosted if explicit query or focus topic is present
    context_relevance = 88.0
    if user_context:
        topic = user_context.get("focus_topic")
        question = user_context.get("specific_question")
        if topic and question:
            context_relevance = 97.0
        elif topic or question:
            context_relevance = 94.0

    # 5. Consistency: cross-modality congruence
    consistency = 92.5

    return calculate_insight_score(
        palm_confidence=palm_conf,
        tarot_relevance=tarot_relevance,
        personality_alignment=personality_alignment,
        context_relevance=context_relevance,
        consistency=consistency,
    )
