import json
import random
import time

from google.genai import errors, types

from app.models.recommendation_schemas import (
    RecommendationRequest,
    RecommendationResult,
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


def create_recommendation_prompt(
    reading_data: RecommendationRequest,
) -> str:
    reading_json = json.dumps(
        reading_data.model_dump(),
        indent=2,
        ensure_ascii=False,
    )

    return f"""
You are the Recommendation Engine for a Palmistry and Tarot
Intelligence Platform.

Generate practical recommendations using the supplied user profile,
question, category, palm findings and tarot cards.

Rules:

1. Use only the supplied input.
2. Treat palmistry and tarot as symbolic self-reflection tools.
3. Do not present recommendations as guaranteed outcomes.
4. Do not provide medical, legal or financial advice.
5. The palm prototype supports only:
   - heart line
   - head line
   - life line
6. Do not invent fate line, sun line, palm shape, finger structure
   or mount findings.
7. Connect recommendations to the user's question, interests,
   spiritual goal and reading category.
8. Make recommendations practical and realistic.
9. Avoid vague advice such as only saying "stay positive."
10. Avoid repeating the same recommendation in multiple sections.
11. Return exactly 3 concise items in every list.
12. Immediate actions should be achievable within the next 7 days.
13. Long-term actions should be suitable for the next 1 to 6 months.
14. Relationship recommendations must remain respectful and must not
    encourage manipulation or dependency.
15. Spiritual recommendations must focus on reflection, mindfulness,
    journaling or personal awareness.

Required output fields:

- recommendation_summary
- personal_growth
- career
- relationships
- goal_alignment
- spiritual_development
- immediate_actions
- long_term_actions

Input data:

{reading_json}
""".strip()


def call_gemini_with_retry(
    prompt: str,
    max_attempts: int = 3,
):
    for attempt in range(1, max_attempts + 1):
        try:
            return client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=RecommendationResult,
                    temperature=0.3,
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
                f"Temporary Gemini recommendation error "
                f"{error_code}. Retrying in {delay:.1f} seconds."
            )

            time.sleep(delay)

    raise RuntimeError(
        "Gemini recommendation request failed after all attempts."
    )


def generate_recommendations(
    reading_data: RecommendationRequest,
) -> RecommendationResult:
    prompt = create_recommendation_prompt(reading_data)
    response = call_gemini_with_retry(prompt)

    if isinstance(response.parsed, RecommendationResult):
        return response.parsed

    if response.parsed is not None:
        return RecommendationResult.model_validate(
            response.parsed
        )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty recommendation response."
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
            "Recommendation finish reason:",
            finish_reason,
        )
        print(
            "Raw recommendation response:",
            repr(response.text),
        )

        raise RuntimeError(
            "Gemini returned incomplete or invalid "
            "recommendation JSON."
        ) from error

    return RecommendationResult.model_validate(result_data)