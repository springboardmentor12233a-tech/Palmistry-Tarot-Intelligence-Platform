import json
import random
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.services.groq_client import ask_groq


Spread = Literal["single", "ppf"]


class TarotRequest(BaseModel):
    name: str = Field(min_length=1)
    question: str = Field(min_length=1)
    category: str = Field(default="General")
    spread: Spread = "single"


def _load_cards() -> list[dict]:
    path = get_settings().tarot_json_path
    with path.open("r", encoding="utf-8") as file:
        tarot_data = json.load(file)
    return tarot_data["cards"]


def _positions_for_spread(spread: Spread) -> list[str]:
    if spread == "ppf":
        return ["Past", "Present", "Future"]
    return ["Guidance"]


def draw_cards(spread: Spread) -> list[dict]:
    deck = _load_cards()
    positions = _positions_for_spread(spread)
    selected_cards = random.sample(deck, len(positions))

    reading_cards = []
    for position, card in zip(positions, selected_cards):
        orientation = random.choice(["Upright", "Reversed"])
        meaning_key = "light" if orientation == "Upright" else "shadow"
        reading_cards.append(
            {
                "position": position,
                "card": {
                    "name": card["name"],
                    "arcana": card.get("arcana"),
                    "suit": card.get("suit"),
                    "img": card.get("img"),
                    "keywords": card.get("keywords", []),
                },
                "orientation": orientation,
                "meaning": card["meanings"][meaning_key],
            }
        )
    return reading_cards


def build_tarot_prompt(request: TarotRequest, reading_cards: list[dict]) -> str:
    spread_name = (
        "Past-Present-Future"
        if request.spread == "ppf"
        else "Single Card"
    )

    prompt = f"""
You are a friendly and thoughtful tarot reader.

The reading is for self-reflection and entertainment only.
Do not make guaranteed predictions or claim certainty.
Provide an encouraging, balanced, and easy-to-understand interpretation.

User Name: {request.name}
Question: {request.question}
Category: {request.category}
Spread: {spread_name}

Selected Tarot Cards:
"""

    for item in reading_cards:
        card = item["card"]

        prompt += f"""
Position: {item["position"]}
Card: {card["name"]}
Orientation: {item["orientation"]}
Keywords: {", ".join(card["keywords"])}

Meanings:
"""

        for meaning in item["meaning"]:
            prompt += f"- {meaning}\n"

    prompt += """

Now create the tarot reading.

IMPORTANT FORMATTING RULES:
- Use simple plain English.
- Do NOT use Markdown.
- Do NOT use tables.
- Do NOT use the | symbol.
- Do NOT use --- or horizontal lines.
- Do NOT use # headings.
- Do NOT use ** or * for formatting.
- Do NOT create bullet-point tables.
- Do not include technical formatting.
- Write naturally as if you are speaking directly to the user.
- Keep the section titles exactly as written below.
- Leave a blank line between sections.

Use exactly these sections:

Overall Interpretation:
Explain how the selected cards connect with the user's question and the overall energy of the reading.

Card-wise Explanation:
Explain each selected card separately.
Mention its position, card name, orientation, and what it may represent in the context of the user's question.
For a Past-Present-Future reading, explain Past, Present, and Future separately.
For a Single Card reading, explain the Guidance card.

Guidance:
Give a few thoughtful and practical self-reflection points based only on the cards.
Do not make guaranteed predictions.

Reflection Question:
End with one thoughtful question that encourages the user to reflect on the reading.

Remember:
This is a reflective and entertainment experience, not a prediction or guarantee.
"""

    return prompt


def create_tarot_reading(request: TarotRequest) -> dict:
    reading_cards = draw_cards(request.spread)
    prompt = build_tarot_prompt(request, reading_cards)
    interpretation = ask_groq(
        prompt=prompt,
        system_prompt="You are a supportive tarot assistant for reflective, entertainment-only readings.",
        max_tokens=1000,
    )

    return {
        "name": request.name,
        "question": request.question,
        "category": request.category,
        "spread": request.spread,
        "cards": reading_cards,
        "interpretation": interpretation,
        "conversation_context": prompt + "\n\nPrevious AI Reading:\n" + interpretation,
    }


def answer_follow_up(conversation_context: str, follow_up_question: str) -> str:
    prompt = f"""
You are a thoughtful tarot assistant.

Previous tarot reading context:

{conversation_context}

User follow-up question:

{follow_up_question}

Answer using the same tarot cards.
Do not draw new cards.
Do not make guaranteed predictions.
Keep the response supportive and reflective.
"""
    return ask_groq(
        prompt=prompt,
        system_prompt="You answer tarot follow-up questions using existing reading context only.",
        max_tokens=700,
    )
def find_common_themes(palm_interpretation: str, tarot_interpretation: str) -> str:
    prompt = f"""
You are an AI assistant comparing two reflective readings.

PALM READING:
{palm_interpretation}

TAROT READING:
{tarot_interpretation}

Find the themes that genuinely overlap between these two readings.

Return exactly 3 to 5 common themes.

For each theme:
- Give it a short, clear title.
- Explain briefly how BOTH readings point toward it.
- Do not invent information that is not present in the readings.
- Do not mention that the readings are scientifically proven.
- Keep the tone mystical, thoughtful, and easy to understand.
- This is for self-reflection and entertainment only.

Format your response like this:

Theme Title
Explanation of how the palm and tarot readings connect.

Theme Title
Explanation of how the palm and tarot readings connect.
"""

    return ask_groq(
        prompt=prompt,
        system_prompt=(
            "You compare palmistry and tarot interpretations "
            "to identify meaningful overlapping themes."
        ),
        max_tokens=700,
    )
def generate_daily_question() -> str:
    prompt = """
Generate one thoughtful daily reflection question for a person.

The question should:
- Be meaningful and introspective
- Be easy to understand
- Encourage self-reflection
- Not be about predicting the future
- Not be too negative or depressing
- Feel slightly mystical and suitable for an Oracle experience

Return ONLY the question.
"""

    return ask_groq(
        prompt=prompt,
        system_prompt="You create thoughtful daily reflection questions.",
        max_tokens=150,
    )


def generate_daily_reflection(question: str, answer: str) -> str:
    prompt = f"""
A user was given this reflection question:

Question:
{question}

The user answered:

Answer:
{answer}

Give a thoughtful reflection on their answer.

Rules:
- Respond directly to what they said.
- Help them understand their thoughts or feelings.
- Do not diagnose them.
- Do not make predictions.
- Do not pretend to know things about them that they didn't say.
- Be supportive and insightful.
- Keep it concise, around 2-4 paragraphs.
"""

    return ask_groq(
        prompt=prompt,
        system_prompt="You are a supportive Oracle reflection assistant.",
        max_tokens=500,
    )
def generate_ai_insights(
    palm_interpretation: str,
    tarot_interpretation: str
) -> dict:

    prompt = f"""
You are an AI assistant analyzing two reflective readings.

PALM READING:
{palm_interpretation}

TAROT READING:
{tarot_interpretation}

Create a thoughtful combined insight based ONLY on information
present in these two readings.

Return exactly these five sections:

Personality:
...

Relationships:
...

Career:
...

Emotional Energy:
...

Overall Insight:
...

Rules:
- Do not invent information.
- Do not make predictions or guarantees.
- Keep the tone thoughtful, mystical, and encouraging.
- This is for self-reflection and entertainment only.
- Keep each section concise.
"""

    response = ask_groq(
        prompt=prompt,
        system_prompt=(
            "You analyze palmistry and tarot readings together "
            "to provide reflective personal insights."
        ),
        max_tokens=800,
    )

    sections = {
        "personality": "",
        "relationships": "",
        "career": "",
        "emotional": "",
        "overall": "",
    }

    current = None

    for line in response.splitlines():

        # Remove Markdown formatting that Groq may add
        text = line.strip()
        text = text.replace("**", "")
        text = text.replace("__", "")
        text = text.replace("###", "")
        text = text.strip()

        if text.lower().startswith("personality:"):
            current = "personality"
            sections[current] = text.split(":", 1)[1].strip()

        elif text.lower().startswith("relationships:"):
            current = "relationships"
            sections[current] = text.split(":", 1)[1].strip()

        elif text.lower().startswith("career:"):
            current = "career"
            sections[current] = text.split(":", 1)[1].strip()

        elif text.lower().startswith("emotional energy:"):
            current = "emotional"
            sections[current] = text.split(":", 1)[1].strip()

        elif text.lower().startswith("overall insight:"):
            current = "overall"
            sections[current] = text.split(":", 1)[1].strip()

        elif current and text:
            sections[current] += " " + text

    return sections