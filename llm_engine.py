import os
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env
load_dotenv()

# Create Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_tarot_reading(question, reading):
    """
    Generate a personalized Tarot interpretation
    using the user's question and the three drawn cards.
    """

    card_information = []

    positions = ["Past", "Present", "Future"]

    for position, item in zip(positions, reading):

        card = item["card"]
        orientation = item["orientation"]

        meanings = card["meanings"].get(orientation, [])

        card_information.append(
            f"""
Position: {position}
Card: {card['name']}
Arcana: {card['arcana']}
Suit: {card['suit']}
Orientation: {orientation}

Keywords:
{", ".join(card.get("keywords", []))}

Meanings:
{chr(10).join("- " + meaning for meaning in meanings)}

Fortune Telling:
{chr(10).join("- " + meaning for meaning in card.get("fortune_telling", []))}
"""
        )

    cards_text = "\n".join(card_information)

    prompt = f"""
You are an AI Tarot interpretation assistant for a
Palmistry and Tarot Intelligence Platform.

The user has asked:

"{question}"

The user has received a three-card Tarot reading:

{cards_text}

Generate a personalized Tarot reading based ONLY on the
card information provided above.

IMPORTANT RULES:
1. Do not invent cards.
2. Do not change the supplied card meanings.
3. Do not claim Tarot can scientifically predict the future.
4. Treat the reading as reflective guidance rather than certainty.
5. Connect the three cards directly to the user's question.
6. Do not make guaranteed claims about future events.
7. Frame future interpretations as possibilities, tendencies, or areas for reflection.
8. If the user asks a yes/no prediction, provide a nuanced interpretation rather than simply saying yes or no.
9. Keep the interpretation grounded in the supplied Tarot information.
10. Do not mention that you are using a JSON dataset.

Use this structure:

## 🔮 Tarot Reading

### 🎯 Reading Focus

### 🕰️ Past

### 🌱 Present

### 🔮 Future

### 🔗 Connection Between the Cards

### ✨ Overall Reading

### 🎯 Guidance

### 💭 Reflection
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return response.text

    except Exception as e:

        error_message = str(e)

        if "429" in error_message or "RESOURCE_EXHAUSTED" in error_message:

            return """
## 🔮 Tarot Reading

### ⚠️ AI Interpretation Temporarily Unavailable

The Tarot cards were successfully drawn, but the
AI interpretation service has reached its current
API quota.

Your cards and their traditional interpretations
are still available above.

You can continue using the Tarot reading without
AI interpretation. The AI interpretation will work
again when API access becomes available.

### 🃏 Your Reading

The three cards shown above can be explored through
their individual meanings, orientation, keywords,
and fortune-telling guidance.

### 💭 Reflection

Consider how the Past, Present, and Future cards
relate to your question and to each other.
"""

        return f"""
## ⚠️ Unable to Generate AI Reading

An error occurred while generating the AI interpretation.

Error:
{error_message}
"""
def generate_combined_reading(question, palm_contents, tarot_reading):
    """
    Generate a combined Palmistry + Tarot interpretation.
    """

    palm_information = "\n".join(
        f"- {content}" for content in palm_contents
    )

    tarot_information = []

    positions = ["Past", "Present", "Future"]

    for position, item in zip(positions, tarot_reading):
        card = item["card"]
        orientation = item["orientation"]

        meanings = card["meanings"].get(orientation, [])

        tarot_information.append(
            f"""
Position: {position}
Card: {card['name']}
Orientation: {orientation}

Keywords:
{", ".join(card.get("keywords", []))}

Meanings:
{chr(10).join("- " + meaning for meaning in meanings)}
"""
        )

    tarot_text = "\n".join(tarot_information)

    prompt = f"""
You are an AI interpretation assistant for a
Palmistry and Tarot Intelligence Platform.

The user asked:

"{question}"

PALMISTRY INFORMATION:
{palm_information}

TAROT INFORMATION:
{tarot_text}

Create a combined reflective reading using BOTH the
Palmistry and Tarot information.

IMPORTANT RULES:
1. Do not invent palmistry findings.
2. Do not invent Tarot cards or Tarot meanings.
3. Do not claim that Palmistry or Tarot scientifically predicts the future.
4. Do not make guaranteed predictions.
5. Treat the result as reflective guidance.
6. Connect the findings to the user's question.
7. Clearly distinguish Palmistry observations from Tarot interpretation.
8. Identify meaningful themes that appear across both systems.
9. Provide practical, non-extreme guidance.
10. Do not mention the underlying JSON or programming implementation.

Use this structure:

## ✨ Combined Palmistry + Tarot Reading

### 🖐️ Palmistry Insights
Explain the supplied palm findings.

### 🔮 Tarot Insights
Explain the three Tarot cards in relation to the question.

### 🔗 Common Themes
Explain themes that appear across both readings.

### 🌟 Overall Interpretation
Combine the information into one coherent reflection.

### 🎯 Guidance
Give practical suggestions related to the user's question.

### 💭 Reflection Questions
Give 2-3 questions for the user to think about.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return response.text

    except Exception as e:
        return f"Unable to generate combined reading: {str(e)}"
def generate_palm_reading(contents):

    palm_text = f"""
Heart Line:
{contents[0]}

Heart Line Interpretation:
{contents[1]}

Head Line:
{contents[2]}

Head Line Interpretation:
{contents[3]}

Life Line:
{contents[4]}

Life Line Interpretation:
{contents[5]}
"""

    prompt = f"""
You are an AI palmistry interpretation assistant.

The palm analysis system produced the following
traditional interpretations:

{palm_text}

Create a personalized palm reading.

Rules:
1. Use only the information provided.
2. Do not invent palm features.
3. Do not claim palmistry scientifically predicts the future.
4. Treat the reading as reflective guidance.
5. Explain Heart Line, Head Line and Life Line separately.
6. Provide an overall interpretation.
7. Do not provide medical diagnosis.
8. Do not make guaranteed predictions.

Format:

### ❤️ Heart Line

### 🧠 Head Line

### 🌱 Life Line

### 🔮 Overall Interpretation
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text