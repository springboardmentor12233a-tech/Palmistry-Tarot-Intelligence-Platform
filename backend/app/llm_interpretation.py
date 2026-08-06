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

    prompt = f"""You are an AI palmistry interpretation assistant.

Analyze the detected palm line features and create a short personalized palm reading.

Detected Palm Features:
{lines_text}

STRICT FORMAT:

Personality & Character
start in new line
Write 2-3 sentences about personality, emotions, and strengths.

Education & Learning Style
start in new line
Write 2-3 sentences about learning style, creativity, and skills.

Career & Professional Strengths
start in new line
Write 2-3 sentences about career abilities, work style, and professional strengths.

Relationships & Emotional Life
start in new line
Write 2-3 sentences about relationships and emotional nature.

Finance & Growth
start in new line
Write 2-3 sentences about financial habits and personal growth.

Personal Guidance
start in new line
Write 2-3 sentences with positive self-improvement advice.

Overall Summary
start in new line
Write 2 sentences summarizing the complete reading.

Disclaimer:
This AI-generated reading is based on traditional palmistry concepts and is intended for entertainment and self-reflection purposes only.

Rules:
- Do not use markdown symbols (#, ##, *, -).
- Do not put headings and text on the same line.
- Leave one blank line after every heading.
- Keep the total response under 350 words.
- Do not make medical claims.
- Do not predict exact future events.
- Keep the tone positive and personalized.
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

    prompt = f"""You are an AI tarot interpretation assistant.

    Analyze the tarot cards below and create a short personalized tarot reading.

    Drawn Tarot Cards:
    {cards_text}

    The reading structure must follow the card positions provided.

    STRICT FORMAT:

    """

    if len(spread) == 1:

        prompt += """
    Focus

    Explain the meaning of this card and how it relates to the person's current situation, thoughts, and personal growth in 3-4 sentences.

    """

    else:

        prompt += """
Past

Explain what the past card represents and how previous experiences or lessons influence the person's current situation in 2-3 sentences.

Present

Explain the current energy, challenges, opportunities, and emotions represented by the present card in 2-3 sentences.

Future

Explain the possible direction, guidance, or lessons represented by the future card in 2-3 sentences.

"""


    prompt += """
Final Message

Write a short encouraging conclusion based on the complete tarot spread.

Disclaimer:
This AI-generated tarot interpretation is based on traditional tarot symbolism and is intended for entertainment and self-reflection purposes only.

Rules:
- Do not use markdown symbols (#, ##, *, -).
- Do not put headings and text on the same line.
- Leave one blank line after every heading.
- Keep the total response under 300 words.
- Do not predict exact dates or guaranteed future events.
- Do not claim guaranteed outcomes.
- Keep the tone positive and meaningful.
"""
    response = _groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content
def generate_combined_llm_reading(palm_reading, tarot_reading):
    prompt = f"""You are an AI spiritual guidance assistant.

Combine the palm reading and tarot reading into one short personalized report.

Palm Reading:
{palm_reading}

Tarot Reading:
{tarot_reading}

STRICT FORMAT:

Combined Insight

Explain the common themes between palm and tarot readings in 3 sentences.

Career & Life Direction

Provide guidance about strengths, opportunities, and personal development in 2-3 sentences.

Relationships & Balance

Explain emotional and relationship insights in 2-3 sentences.

Personal Growth

Provide positive improvement suggestions in 2-3 sentences.

Final Guidance

Write a short motivational closing message.

Disclaimer:
This AI-generated combined reading uses traditional palmistry and tarot concepts for entertainment and self-reflection purposes only.

Rules:
- Do not use markdown symbols (#, ##, *, -).
- Do not put headings and text on the same line.
- Leave one blank line after every heading.
- Keep the total response under 350 words.
- Do not make medical claims.
- Do not make guaranteed predictions.
- Keep the tone warm and professional.
"""
    response = _groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    return response.choices[0].message.content