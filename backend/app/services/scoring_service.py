from app.models.scoring_schemas import (
    GuidanceScoreRequest,
    GuidanceScoreResult,
)


PALM_WEIGHT = 0.30
TAROT_WEIGHT = 0.25
PERSONALITY_WEIGHT = 0.20
CONTEXT_WEIGHT = 0.15
CONSISTENCY_WEIGHT = 0.10


def get_score_label(score: float) -> str:
    if score >= 85:
        return "Very Strong Alignment"

    if score >= 70:
        return "Strong Alignment"

    if score >= 55:
        return "Moderate Alignment"

    if score >= 40:
        return "Limited Alignment"

    return "Low Alignment"


def calculate_guidance_scores(
    score_data: GuidanceScoreRequest,
) -> GuidanceScoreResult:
    overall_score = (
        score_data.palm_analysis_confidence
        * PALM_WEIGHT
        + score_data.tarot_interpretation_relevance
        * TAROT_WEIGHT
        + score_data.personality_alignment
        * PERSONALITY_WEIGHT
        + score_data.user_context_relevance
        * CONTEXT_WEIGHT
        + score_data.reading_consistency
        * CONSISTENCY_WEIGHT
    )

    rounded_score = round(overall_score, 2)

    return GuidanceScoreResult(
        palm_analysis_confidence=round(
            score_data.palm_analysis_confidence,
            2,
        ),
        tarot_interpretation_relevance=round(
            score_data.tarot_interpretation_relevance,
            2,
        ),
        personality_alignment=round(
            score_data.personality_alignment,
            2,
        ),
        user_context_relevance=round(
            score_data.user_context_relevance,
            2,
        ),
        reading_consistency=round(
            score_data.reading_consistency,
            2,
        ),
        overall_insight_score=rounded_score,
        score_label=get_score_label(rounded_score),
        calculation_method=(
            "Weighted calculation: palm analysis 30%, "
            "tarot relevance 25%, personality alignment 20%, "
            "user-context relevance 15%, and reading "
            "consistency 10%."
        ),
        disclaimer=(
            "These scores measure prototype input completeness, "
            "relevance and consistency. They do not measure "
            "scientific accuracy or predict future outcomes."
        ),
    )