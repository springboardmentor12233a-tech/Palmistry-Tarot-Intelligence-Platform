import json
import os

from dotenv import load_dotenv
from google import genai

from app.models.interpretation_schemas import (
    InterpretationRequest,
    InterpretationResult,
)


load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash",
)


if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. Add it to backend/.env."
    )


client = genai.Client(api_key=GEMINI_API_KEY)


def create_interpretation_prompt(
    reading_data: InterpretationRequest,
) -> str:
    reading_json = json.dumps(
        reading_data.model_dump(),
        indent=2,
        ensure_ascii=False,
    )

    return f"""
You are the AI Interpretation Engine for a Palmistry and Tarot
Intelligence Platform.

Analyze the supplied user profile, reading question, palm findings
and tarot cards.

Rules:

1. Use only the supplied input.
2. The palm system supports only heart line, head line and life line.
3. Do not invent fate line, sun line, palm shape or finger findings.
4. Connect the interpretation to the user's question and category.
5. Treat palmistry and tarot as symbolic self-reflection tools.
6. Do not present the reading as scientific fact.
7. Do not make guaranteed future predictions.
8. Do not provide medical, legal or financial conclusions.
9. Keep the response clear, practical and personalized.
10. Avoid repeating the same information.

Input data:

{reading_json}
""".strip()


def generate_interpretation(
    reading_data: InterpretationRequest,
) -> InterpretationResult:
    prompt = create_interpretation_prompt(reading_data)

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_json_schema":
                InterpretationResult.model_json_schema(),
            "temperature": 0.4,
            "max_output_tokens": 2000,
        },
    )

    if response.parsed is not None:
        result_data = response.parsed
    elif response.text:
        result_data = json.loads(response.text)
    else:
        raise RuntimeError("Gemini returned an empty response.")

    return InterpretationResult.model_validate(result_data)