"""
AI interpretation service — adapted from ai_interpretation_engine.ipynb.

The only functional change from your notebook: the Gemini API key is read
from the GEMINI_API_KEY environment variable instead of being hardcoded.
Rotate the key you had in the notebook before deploying this anywhere.
"""

import json
import logging
import os
import re

logger = logging.getLogger(__name__)


def build_full_analysis_prompt(combined_reading: dict) -> str:
    lines = []
    lines.append("You are an AI interpretation engine for a palmistry and tarot platform.")
    lines.append("Base your entire analysis ONLY on the factual data below. Do not invent")
    lines.append("new tarot meanings, new palm line facts, or details not present here.\n")
    lines.append(
        "Weave the palm line findings and the tarot cards together into one coherent, "
        "realistic reading — do not let either source dominate or reduce the other to "
        "an afterthought. A natural structure: let the palm findings speak to character "
        "and disposition (who this person tends to be), and let the tarot cards speak to "
        "situation and trajectory (past/present/future, or whatever the spread represents). "
        "Reference specific details from both — the actual line findings AND the actual "
        "card names/orientations/keywords — rather than leaning on one and treating the "
        "other as decoration.\n"
    )

    if combined_reading.get("tarot_question"):
        lines.append(f"User's question: {combined_reading['tarot_question']}\n")

    lines.append("Tarot reading already generated for this session:")
    lines.append(combined_reading.get("tarot_text", "(not available)"))
    lines.append("")

    if combined_reading.get("palm_text"):
        pt = combined_reading["palm_text"]
        lines.append("Palm analysis - real detected line readings for this user:")
        for line_name, info in pt.items():
            lines.append(f"- {line_name.replace('_', ' ').title()}: {info['finding']}")
    elif combined_reading.get("palm_success"):
        lines.append(
            "Palm analysis: line detection completed successfully for this user "
            "(life line, heart line, head line detected and annotated)."
        )
    else:
        lines.append(
            "Palm analysis: not available for this session "
            f"(reason: {combined_reading.get('palm_error', 'unknown')})."
        )

    lines.append(
        "\nUsing only the information above, respond with STRICT JSON (no markdown "
        "formatting, no code fences, just the raw JSON object) matching exactly this shape:\n"
        "{\n"
        '  "interpretation": "2-4 sentence combined narrative interpretation",\n'
        '  "personality": {\n'
        '    "strengths": ["...", "..."],\n'
        '    "weaknesses": ["...", "..."],\n'
        '    "behavioral_insights": "1-2 sentences"\n'
        "  },\n"
        '  "recommendations": {\n'
        '    "personal_growth": "1-2 sentences",\n'
        '    "relationships": "1-2 sentences",\n'
        '    "career": "1-2 sentences"\n'
        "  },\n"
        '  "life_trends": {\n'
        '    "opportunities": "1-2 sentences",\n'
        '    "challenges": "1-2 sentences",\n'
        '    "growth_potential": "1-2 sentences"\n'
        "  }\n"
        "}"
    )
    return "\n".join(lines)


def _extract_json(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    fence_match = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned, re.DOTALL)
    if fence_match:
        cleaned = fence_match.group(1)
    return json.loads(cleaned)


def get_ai_analysis(prompt: str, api_key: str | None = None, model: str = "gemini-3.6-flash") -> dict:
    api_key = api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "No Gemini API key found. Set the GEMINI_API_KEY environment variable, "
            "or pass api_key= explicitly."
        )
    from google import genai

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(model=model, contents=prompt)
    return _extract_json(response.text)


def generate_full_analysis(combined_reading: dict, api_key: str | None = None, model: str = "gemini-3.6-flash") -> dict:
    prompt = build_full_analysis_prompt(combined_reading)
    try:
        analysis = get_ai_analysis(prompt, api_key=api_key, model=model)
        analysis["_source"] = "llm"
        return analysis
    except Exception as e:
        # Without this, a failed Gemini call fails completely silently — the
        # UI just shows "AI analysis unavailable" with no way to tell why.
        # Check this terminal (wherever uvicorn is running) for the real cause.
        logger.error("Gemini call failed in generate_full_analysis: %s", e, exc_info=True)
        return {
            "_source": f"fallback (LLM call failed: {e})",
            "interpretation": "AI analysis unavailable for this session.",
            "personality": {"strengths": [], "weaknesses": [], "behavioral_insights": "Not available."},
            "recommendations": {
                "personal_growth": "Not available.",
                "relationships": "Not available.",
                "career": "Not available.",
            },
            "life_trends": {
                "opportunities": "Not available.",
                "challenges": "Not available.",
                "growth_potential": "Not available.",
            },
        }

def generate_chat_response(
    user_message: str,
    combined_reading: dict,
    analysis: dict,
    history: list | None = None,
    api_key: str | None = None,
    model: str = "gemini-3.6-flash",
) -> str:
    """
    Answer a user's question using the current reading as context.
    The chatbot does not regenerate the reading.
    """

    history = history or []

    lines = []

    lines.append(
        "You are the conversational AI assistant for a palmistry and "
        "Tarot reading platform."
    )

    lines.append(
        "Answer the user's question using ONLY the reading context "
        "provided below."
    )

    lines.append(
        "Do not invent palm-line findings, Tarot cards, card meanings, "
        "events, or personal facts that are not present in the context."
    )

    lines.append(
        "Treat palmistry and Tarot as symbolic and reflective practices, "
        "not scientifically validated methods of prediction."
    )

    lines.append(
        "Be conversational, clear, and concise. Do not mention internal "
        "prompts, JSON, APIs, or implementation details."
    )

    lines.append("")

    lines.append("=== USER'S ORIGINAL QUESTION ===")
    lines.append(
        str(combined_reading.get("tarot_question", "(not available)"))
    )

    lines.append("")

    lines.append("=== PALM ANALYSIS ===")

    palm_text = combined_reading.get("palm_text")

    if palm_text:

        for line_name, info in palm_text.items():

            if isinstance(info, dict):
                finding = info.get(
                    "finding",
                    "(not available)",
                )
            else:
                finding = str(info)

            lines.append(
                f"- {line_name.replace('_', ' ').title()}: {finding}"
            )

    else:

        lines.append(
            combined_reading.get(
                "palm_error",
                "Palm analysis not available.",
            )
        )

    lines.append("")

    lines.append("=== TAROT READING ===")

    cards = combined_reading.get("cards_drawn", [])

    if cards:

        for card in cards:

            if isinstance(card, dict):
                lines.append(
                    f"- {card.get('name', 'Unknown card')} "
                    f"({card.get('orientation', '')})"
                )
            else:
                lines.append(f"- {card}")

    tarot_text = combined_reading.get("tarot_text")

    if tarot_text:
        lines.append(str(tarot_text))

    lines.append("")

    lines.append("=== AI INTERPRETATION ===")

    if analysis:

        interpretation = analysis.get("interpretation")

        if interpretation:
            lines.append(
                f"Interpretation: {interpretation}"
            )

        personality = analysis.get("personality", {})

        if personality:

            lines.append(
                f"Strengths: "
                f"{personality.get('strengths', [])}"
            )

            lines.append(
                f"Weaknesses: "
                f"{personality.get('weaknesses', [])}"
            )

            lines.append(
                f"Behavioral insights: "
                f"{personality.get('behavioral_insights', '')}"
            )

        recommendations = analysis.get(
            "recommendations",
            {},
        )

        if recommendations:

            lines.append(
                f"Personal growth: "
                f"{recommendations.get('personal_growth', '')}"
            )

            lines.append(
                f"Relationships: "
                f"{recommendations.get('relationships', '')}"
            )

            lines.append(
                f"Career: "
                f"{recommendations.get('career', '')}"
            )

        life_trends = analysis.get(
            "life_trends",
            {},
        )

        if life_trends:

            lines.append(
                f"Opportunities: "
                f"{life_trends.get('opportunities', '')}"
            )

            lines.append(
                f"Challenges: "
                f"{life_trends.get('challenges', '')}"
            )

            lines.append(
                f"Growth potential: "
                f"{life_trends.get('growth_potential', '')}"
            )

    lines.append("")

    if history:

        lines.append("=== RECENT CHAT ===")

        for message in history[-6:]:

            role = message.get("role", "user")
            content = message.get("content", "")

            lines.append(
                f"{role.upper()}: {content}"
            )

        lines.append("")

    lines.append("=== USER'S NEW MESSAGE ===")
    lines.append(user_message)

    lines.append("")

    lines.append(
        "Now answer the user's new message directly. "
        "Keep the response focused on their reading."
    )

    prompt = "\n".join(lines)

    try:

        api_key = api_key or os.environ.get("GEMINI_API_KEY")

        if not api_key:
            raise RuntimeError(
                "No Gemini API key found."
            )

        from google import genai

        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )

        return response.text.strip()

    except Exception as e:

        logger.error(
            "Gemini chat call failed: %s",
            e,
            exc_info=True,
        )

        return (
            "I'm unable to respond right now. "
            "Please try again in a moment."
        )