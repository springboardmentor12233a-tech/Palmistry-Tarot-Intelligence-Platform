import json
from groq import Groq
from app.config import settings

_client = None


def get_client():
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not set. Add it to backend/.env")
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def _complete(prompt: str, temperature: float = 0.6) -> str:
    client = get_client()
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
    )
    return response.choices[0].message.content


def palm_interpretation(features: dict) -> str:
    prompt = f"""You are an expert palmist.

Below are the extracted palm line features.

{json.dumps(features, indent=2)}

Interpret ONLY these four lines:

1. Life Line
2. Head Line
3. Heart Line
4. Fate Line

For each line provide:

- Strength
- Meaning
- Personality
- Career
- Relationships
- Health
- Challenges
- Opportunities

Finally provide:

Overall Personality
Overall Career
Overall Love Life
Overall Health
Overall Fortune

Return in proper markdown, with clear ## headings for each line and each overall section.
If a line was not detected, briefly say so and move on rather than inventing details.
"""
    return _complete(prompt, temperature=0.5)


def tarot_interpretation(drawn_cards: list, spread: str) -> str:
    # Trim the payload to what the model actually needs per card - position,
    # orientation, name, archetype, keywords, and the relevant (light/shadow)
    # meaning list - rather than the full dataset record.
    slim = [
        {
            "position": c["position"],
            "card": c["name"],
            "reversed": c["reversed"],
            "archetype": c.get("archetype"),
            "keywords": c.get("keywords", []),
            "meanings": c.get("meanings", []),
        }
        for c in drawn_cards
    ]
    prompt = f"""You are an expert tarot reader.

Spread: {spread.replace('_', ' ').title()}

Cards drawn (with their keywords and light/shadow meanings depending on orientation):

{json.dumps(slim, indent=2)}

Write a flowing, professional tarot reading that:
- addresses each position by name and interprets its card, drawing on its keywords,
  archetype, and meanings (note plainly when a card is reversed)
- weaves the cards together into one coherent narrative rather than listing them in isolation
- ends with a short "Guidance" section with practical, grounded advice

Return in clean markdown with a heading per position plus a final ## Guidance section.
"""
    return _complete(prompt, temperature=0.65)


def combined_report(palm_report: str, tarot_result: list) -> str:
    prompt = f"""You are an expert Palmist and Tarot Reader.

Palm Reading:

{palm_report}

Tarot Cards:

{json.dumps(tarot_result, indent=2)}

Combine BOTH readings into one cohesive report. Do NOT simply repeat them section by
section - synthesize what they say together.

Generate a professional report with exactly these markdown headings:

# Overall Personality
# Love
# Career
# Money
# Health
# Spiritual Growth
# Past
# Present
# Future
# Guidance
# Lucky Color
# Lucky Number
# Lucky Day

Return beautiful, well-formatted markdown.
"""
    return _complete(prompt, temperature=0.7)


def chat_reply(context_summary: str, history: list, user_message: str) -> str:
    """
    history: list of {"role": "user"|"assistant", "content": str}
    """
    system = (
        "You are the AI companion inside a Palmistry & Tarot Intelligence app. "
        "You speak warmly and insightfully about the user's own reading below. "
        "Stay grounded in what the reading actually says, be concise (a few short "
        "paragraphs at most), and never claim certainty about real-world outcomes "
        "like health, money, or legal matters - frame guidance as reflection, not prediction.\n\n"
        f"The user's reading so far:\n{context_summary}\n"
    )
    messages = [{"role": "system", "content": system}]
    for m in history[-12:]:
        messages.append({"role": m["role"], "content": m["content"]})
    messages.append({"role": "user", "content": user_message})

    client = get_client()
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=0.6,
    )
    return response.choices[0].message.content
