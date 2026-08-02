import os
from dotenv import load_dotenv
from groq import Groq

# Load .env from the project root (two levels up from this file)
ENV_PATH = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
load_dotenv(ENV_PATH)

_groq_client = Groq(api_key=os.environ["GROQ_API_KEY"])

LINE_MEANINGS = {
    "heart": "represents emotional life, relationships, and capacity for love",
    "head": "represents intellect, decision-making style, and communication",
    "life": "represents vitality, life changes, and physical wellbeing (not lifespan)"
}


def generate_palm_llm_reading(lines_data):
    lines_description = []
    for name, data in lines_data.items():
        meaning = LINE_MEANINGS.get(name, "")
        lines_description.append(
            f"- {name.capitalize()} Line: {data['relative_length']} ({meaning})"
        )
    lines_text = "\n".join(lines_description)

    prompt = f"""You are a warm, insightful palm reader. Based on the following detected palm line data, write a natural, personalized palm reading of 3-4 short paragraphs.

Detected lines:
{lines_text}

Guidelines:
- Write in a warm, conversational tone, as if speaking directly to the person.
- Do not just repeat the raw measurements back — weave them into a narrative.
- Do NOT make any medical claims, health predictions, or claims about lifespan.
- Keep it positive and constructive, while still feeling personalized and specific.
"""

    response = _groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content
def generate_tarot_llm_reading(spread):
    cards_description = []
    for card in spread:
        orientation = "reversed" if card["reversed"] else "upright"
        keywords = ", ".join(card["keywords"])
        cards_description.append(
            f"- {card['position']}: {card['name']} ({orientation}) — keywords: {keywords}\n"
            f"  Meaning: {'; '.join(card['meaning'])}"
        )
    cards_text = "\n".join(cards_description)

    prompt = f"""You are a warm, insightful tarot reader. Based on the following drawn spread, write a natural, personalized tarot reading of 3-4 short paragraphs that weaves the cards into one coherent narrative.

Drawn spread:
{cards_text}

Guidelines:
- Write in a warm, conversational tone, as if speaking directly to the person.
- Connect the cards into a flowing story across their positions, rather than describing each card in isolation.
- Do NOT make any medical claims or claims about specific future events (e.g. exact dates, named people).
- Keep it positive and constructive, while still feeling personalized and specific.
"""

    response = _groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content
def generate_combined_llm_reading(palm_reading, tarot_reading):
    prompt = f"""You are a warm, insightful spiritual guide. Below are two separate readings for the same person — one from palmistry, one from tarot. Weave them into a single integrated narrative reading of 3-4 short paragraphs that draws connections between the two, rather than just presenting them side by side.

Palm reading:
{palm_reading}

Tarot reading:
{tarot_reading}

Guidelines:
- Find genuine thematic connections between the two readings where they exist.
- Write in a warm, conversational tone, as if speaking directly to the person.
- Do NOT make medical claims or claims about specific future events.
- End with a short, encouraging closing thought.
"""

    response = _groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content