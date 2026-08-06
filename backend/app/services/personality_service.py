import json
import random
import time

from google.genai import errors, types

from app.models.personality_schemas import (
    PersonalityRequest,
    PersonalityResult,
)
from app.services.gemini_service import (
    GEMINI_MODEL,
    client,
)


TRANSIENT_ERROR_CODES = {
    429,
    500,
    502,
    503,
    504,
}


def create_personality_prompt(
    reading_data: PersonalityRequest,
) -> str:
    """
    Create a concise prompt for structured personality generation.
    """

    reading_json = json.dumps(
        reading_data.model_dump(),
        indent=2,
        ensure_ascii=False,
    )

    return f"""
You are the Personality Intelligence Module for a Palmistry and
Tarot Intelligence Platform.

Generate a concise symbolic personality profile from the supplied
user profile, question, palm findings and tarot cards.

Rules:

1. Use only the supplied input.
2. Treat palmistry and tarot as symbolic self-reflection tools.
3. Do not present the analysis as scientific fact.
4. Do not diagnose medical or mental-health conditions.
5. Do not make guaranteed claims about the user.
6. Use cautious language such as:
   - may suggest
   - can indicate
   - appears to reflect
7. The palm prototype supports only:
   - heart line
   - head line
   - life line
8. Do not invent fate line, sun line, palm shape, finger structure
   or mounts.
9. Connect the result to the user's question, interests and goal.
10. Avoid repeating the same information.
11. Do not provide medical, legal or financial advice.
12. Keep each paragraph between 1 and 3 sentences.
13. Return exactly 3 concise items in every list.

Required output fields:

- personality_summary
- dominant_traits
- emotional_style
- thinking_style
- decision_style
- relationship_style
- strengths
- development_areas
- growth_advice

Input data:

{reading_json}
""".strip()


def call_gemini_with_retry(
    prompt: str,
    max_attempts: int = 3,
):
    """
    Retry temporary Gemini API failures.
    """

    for attempt in range(1, max_attempts + 1):
        try:
            return client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=PersonalityResult,
                    temperature=0.25,
                    max_output_tokens=4096,
                ),
            )

        except errors.APIError as error:
            error_code = getattr(error, "code", None)
            final_attempt = attempt == max_attempts

            if (
                error_code not in TRANSIENT_ERROR_CODES
                or final_attempt
            ):
                raise

            delay = (
                2 ** (attempt - 1)
                + random.uniform(0.2, 0.8)
            )

            print(
                f"Temporary Gemini error {error_code}. "
                f"Retrying in {delay:.1f} seconds."
            )

            time.sleep(delay)

    raise RuntimeError(
        "Gemini request failed after all retry attempts."
    )


def generate_personality_profile(
    reading_data: PersonalityRequest,
) -> PersonalityResult:
    """
    Generate and validate the personality result.
    """

    prompt = create_personality_prompt(reading_data)
    response = call_gemini_with_retry(prompt)

    # Preferred result when response_schema is used.
    if isinstance(response.parsed, PersonalityResult):
        return response.parsed

    # Some SDK versions return a dictionary in response.parsed.
    if response.parsed is not None:
        return PersonalityResult.model_validate(
            response.parsed
        )

    # Fallback if parsed output is unavailable.
    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty personality response."
        )

    try:
        result_data = json.loads(response.text)

    except json.JSONDecodeError as error:
        finish_reason = "unknown"

        if response.candidates:
            finish_reason = str(
                response.candidates[0].finish_reason
            )

        print(
            "Gemini finish reason:",
            finish_reason,
        )
        print(
            "Raw Gemini personality response:",
            repr(response.text),
        )

        raise RuntimeError(
            "Gemini returned incomplete or invalid "
            "personality JSON."
        ) from error

    return PersonalityResult.model_validate(result_data)