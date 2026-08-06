import json
import random
import re
import time
from typing import Any

from google.genai import errors, types

from app.models.reading_schemas import (
    CompleteAIResult,
    CompleteReadingRequest,
)
from app.models.scoring_schemas import (
    GuidanceScoreRequest,
    GuidanceScoreResult,
)
from app.services.gemini_service import (
    GEMINI_MODEL,
    client,
)
from app.services.scoring_service import (
    calculate_guidance_scores,
)


TRANSIENT_ERROR_CODES = {
    429,
    500,
    502,
    503,
    504,
}


STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "how",
    "i",
    "in",
    "is",
    "it",
    "me",
    "my",
    "of",
    "on",
    "or",
    "should",
    "the",
    "this",
    "to",
    "what",
    "when",
    "with",
}


def create_complete_reading_prompt(
    reading_data: CompleteReadingRequest,
) -> str:
    reading_json = json.dumps(
        reading_data.model_dump(),
        indent=2,
        ensure_ascii=False,
    )

    return f"""
You are the complete AI Reading Engine for a Palmistry and Tarot
Intelligence Platform.

Generate one structured response containing:

1. AI interpretation
2. Personality intelligence
3. Personalized recommendations
4. Symbolic life-trend analysis

General rules:

1. Use only the supplied input.
2. Treat palmistry and tarot as symbolic self-reflection tools.
3. Do not present the reading as scientific fact.
4. Do not make guaranteed future predictions.
5. Do not diagnose medical or mental-health conditions.
6. Do not provide medical, legal or financial advice.
7. Use cautious wording such as:
   - may suggest
   - can indicate
   - appears to reflect
   - could represent
8. The palm prototype supports only:
   - heart line
   - head line
   - life line
9. Never invent:
   - fate line
   - sun line
   - palm shape
   - finger structure
   - mounts
10. Connect every section to the user's question, category,
    interests and personal goal.
11. Avoid repeating identical sentences across modules.
12. Keep paragraphs concise and meaningful.
13. Return exactly 3 concise items in each list.
14. Immediate actions must be suitable for the next 7 days.
15. Long-term actions must be suitable for the next 1 to 6 months.
16. Life trends must describe possible themes, not fixed events.
17. Do not include markdown formatting.
18. Complete every required field.

Interpretation requirements:

- overall_summary
- palm_interpretation
- tarot_interpretation
- combined_interpretation
- key_strengths
- growth_areas
- current_focus
- key_message
- reflection_question
- disclaimer

Personality requirements:

- personality_summary
- dominant_traits
- emotional_style
- thinking_style
- decision_style
- relationship_style
- strengths
- development_areas
- growth_advice

Recommendation requirements:

- recommendation_summary
- personal_growth
- career
- relationships
- goal_alignment
- spiritual_development
- immediate_actions
- long_term_actions

Life-trend requirements:

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
    max_attempts: int = 5,
):
    for attempt in range(1, max_attempts + 1):
        try:
            return client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=CompleteAIResult,
                    temperature=0.3,
                    max_output_tokens=8192,
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
                f"Temporary Gemini complete-reading error "
                f"{error_code}. Retrying in "
                f"{delay:.1f} seconds."
            )

            time.sleep(delay)

    raise RuntimeError(
        "Complete reading request failed after all attempts."
    )


def normalize_words(text: str) -> set[str]:
    words = re.findall(
        r"[a-zA-Z]{3,}",
        text.lower(),
    )

    return {
        word
        for word in words
        if word not in STOP_WORDS
    }


def flatten_text(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, str):
        return value

    if isinstance(value, list):
        return " ".join(
            flatten_text(item)
            for item in value
        )

    if isinstance(value, dict):
        return " ".join(
            flatten_text(item)
            for item in value.values()
        )

    if hasattr(value, "model_dump"):
        return flatten_text(value.model_dump())

    return str(value)


def calculate_keyword_coverage(
    source_text: str,
    generated_text: str,
) -> float:
    source_words = normalize_words(source_text)
    generated_words = normalize_words(generated_text)

    if not source_words:
        return 100.0

    matched_words = (
        source_words & generated_words
    )

    return (
        len(matched_words)
        / len(source_words)
        * 100
    )


def calculate_palm_input_score(
    reading_data: CompleteReadingRequest,
) -> float:
    supported_values = {
        "short",
        "long",
    }

    palm_values = [
        reading_data.palm_analysis.heart_line,
        reading_data.palm_analysis.head_line,
        reading_data.palm_analysis.life_line,
    ]

    valid_count = sum(
        1
        for value in palm_values
        if value.strip().lower()
        in supported_values
    )

    return round(
        valid_count / len(palm_values) * 100,
        2,
    )


def calculate_tarot_input_score(
    reading_data: CompleteReadingRequest,
) -> float:
    cards = reading_data.tarot_analysis.cards

    if not cards:
        return 0.0

    valid_items = 0
    total_items = len(cards) * 5

    for card in cards:
        if card.position.strip():
            valid_items += 1

        if card.name.strip():
            valid_items += 1

        if card.orientation.lower() in {
            "upright",
            "reversed",
        }:
            valid_items += 1

        if card.keywords:
            valid_items += 1

        if card.selected_meaning.strip():
            valid_items += 1

    return round(
        valid_items / total_items * 100,
        2,
    )


def calculate_structure_consistency(
    complete_result: CompleteAIResult,
) -> float:
    checks = [
        bool(
            complete_result.interpretation
            .overall_summary.strip()
        ),
        bool(
            complete_result.interpretation
            .combined_interpretation.strip()
        ),
        len(
            complete_result.interpretation
            .key_strengths
        ) >= 3,
        len(
            complete_result.interpretation
            .growth_areas
        ) >= 3,
        bool(
            complete_result.personality
            .personality_summary.strip()
        ),
        len(
            complete_result.personality
            .dominant_traits
        ) >= 3,
        len(
            complete_result.personality
            .growth_advice
        ) >= 3,
        bool(
            complete_result.recommendations
            .recommendation_summary.strip()
        ),
        len(
            complete_result.recommendations
            .immediate_actions
        ) >= 3,
        len(
            complete_result.recommendations
            .long_term_actions
        ) >= 3,
        bool(
            complete_result.trends
            .trend_summary.strip()
        ),
        len(
            complete_result.trends
            .opportunities
        ) >= 3,
        len(
            complete_result.trends
            .challenges
        ) >= 3,
    ]

    passed_checks = sum(checks)

    return round(
        passed_checks / len(checks) * 100,
        2,
    )


def calculate_complete_reading_scores(
    reading_data: CompleteReadingRequest,
    complete_result: CompleteAIResult,
) -> GuidanceScoreResult:
    personality_source = " ".join(
        [
            *reading_data.user_profile.interests,
            reading_data.user_profile.spiritual_goal,
            reading_data.reading_context.category,
        ]
    )

    personality_output = flatten_text(
        complete_result.personality
    )

    question_source = " ".join(
        [
            reading_data.reading_context.question,
            reading_data.reading_context.category,
            reading_data.user_profile.spiritual_goal,
        ]
    )

    complete_output = flatten_text(
        complete_result
    )

    personality_overlap = (
        calculate_keyword_coverage(
            personality_source,
            personality_output,
        )
    )

    context_overlap = (
        calculate_keyword_coverage(
            question_source,
            complete_output,
        )
    )

    # A schema-valid response receives a base score.
    # Keyword overlap adds context sensitivity.
    personality_alignment = min(
        100.0,
        65.0 + personality_overlap * 0.35,
    )

    user_context_relevance = min(
        100.0,
        65.0 + context_overlap * 0.35,
    )

    score_request = GuidanceScoreRequest(
        palm_analysis_confidence=(
            calculate_palm_input_score(
                reading_data
            )
        ),
        tarot_interpretation_relevance=(
            calculate_tarot_input_score(
                reading_data
            )
        ),
        personality_alignment=round(
            personality_alignment,
            2,
        ),
        user_context_relevance=round(
            user_context_relevance,
            2,
        ),
        reading_consistency=(
            calculate_structure_consistency(
                complete_result
            )
        ),
    )

    return calculate_guidance_scores(
        score_request
    )


def generate_complete_reading(
    reading_data: CompleteReadingRequest,
) -> tuple[
    CompleteAIResult,
    GuidanceScoreResult,
]:
    prompt = create_complete_reading_prompt(
        reading_data
    )

    response = call_gemini_with_retry(prompt)

    if isinstance(
        response.parsed,
        CompleteAIResult,
    ):
        complete_result = response.parsed

    elif response.parsed is not None:
        complete_result = (
            CompleteAIResult.model_validate(
                response.parsed
            )
        )

    elif response.text:
        try:
            result_data = json.loads(
                response.text
            )

        except json.JSONDecodeError as error:
            finish_reason = "unknown"

            if response.candidates:
                finish_reason = str(
                    response.candidates[
                        0
                    ].finish_reason
                )

            print(
                "Complete reading finish reason:",
                finish_reason,
            )

            print(
                "Raw complete reading response:",
                repr(response.text),
            )

            raise RuntimeError(
                "Gemini returned incomplete or "
                "invalid complete-reading JSON."
            ) from error

        complete_result = (
            CompleteAIResult.model_validate(
                result_data
            )
        )

    else:
        raise RuntimeError(
            "Gemini returned an empty "
            "complete-reading response."
        )

    scores = calculate_complete_reading_scores(
        reading_data,
        complete_result,
    )

    return complete_result, scores