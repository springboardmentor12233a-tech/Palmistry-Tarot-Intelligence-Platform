import json
import random
import time

from google.genai import errors, types

from app.models.trend_schemas import (
    TrendRequest,
    TrendResult,
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


def create_trend_prompt(
    reading_data: TrendRequest,
) -> str:
    reading_json = json.dumps(
        reading_data.model_dump(),
        indent=2,
        ensure_ascii=False,
    )

    return f"""
You are the Life Trend Analysis Module for a Palmistry and Tarot
Intelligence Platform.

Create a symbolic and reflective life-trend analysis using the
supplied user profile, question, palm findings and tarot cards.

Important rules:

1. Use only the supplied input data.
2. Treat palmistry and tarot as symbolic self-reflection tools.
3. Do not claim to predict the future with certainty.
4. Do not describe any outcome as guaranteed.
5. Use cautious wording such as:
   - may indicate
   - may suggest
   - could reflect
   - a possible theme
   - the user may benefit from
6. The palm-analysis prototype supports only:
   - heart line
   - head line
   - life line
7. Do not invent:
   - fate line
   - sun line
   - palm shape
   - finger structure
   - mounts
8. Connect the analysis to the user's question, category,
   interests and personal goal.
9. The next_30_days field should describe a short-term symbolic
   theme, not a guaranteed event.
10. The next_3_months field should describe a broader possible
    development direction, not a fixed prediction.
11. Return exactly 3 concise items for:
    - opportunities
    - challenges
    - recommended_focus
    - practical_actions
12. Practical actions must be realistic and safe.
13. Do not provide medical, legal, financial or mental-health
    diagnoses or advice.
14. Avoid fear-based, fatalistic or manipulative language.
15. Keep each paragraph concise and useful.

Required output fields:

- trend_summary
- current_theme
- next_30_days
- next_3_months
- opportunities
- challenges
- recommended_focus
- practical_actions
- disclaimer

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
                    response_schema=TrendResult,
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
                f"Temporary Gemini trend error "
                f"{error_code}. Retrying in "
                f"{delay:.1f} seconds."
            )

            time.sleep(delay)

    raise RuntimeError(
        "Gemini trend request failed after all attempts."
    )


def generate_life_trends(
    reading_data: TrendRequest,
) -> TrendResult:
    prompt = create_trend_prompt(reading_data)
    response = call_gemini_with_retry(prompt)

    if isinstance(response.parsed, TrendResult):
        return response.parsed

    if response.parsed is not None:
        return TrendResult.model_validate(
            response.parsed
        )

    if not response.text:
        raise RuntimeError(
            "Gemini returned an empty trend response."
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
            "Trend finish reason:",
            finish_reason,
        )
        print(
            "Raw trend response:",
            repr(response.text),
        )

        raise RuntimeError(
            "Gemini returned incomplete or invalid trend JSON."
        ) from error

    return TrendResult.model_validate(result_data)