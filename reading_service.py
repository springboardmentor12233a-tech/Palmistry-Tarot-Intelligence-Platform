"""
Combines palm_service + tarot_service into one reading, mirroring
reading_report.generate_combined_reading() referenced in your
milestone3_pipeline.ipynb and Reading_report.py.ipynb.
"""

from services import palm_service, tarot_service


def generate_combined_reading(
    palm_image_path: str,
    tarot_deck_path: str,
    palmistry_code_dir: str,
    tarot_question: str | None = None,
    spread_size: int = 3,
    seed: int | None = None,
) -> dict:
    """Runs palm analysis + tarot draw and merges them into one dict shape
    that ai_interpretation_service and dashboard_service both expect."""

    palm_result = palm_service.analyze_palm(palm_image_path, palmistry_code_dir)
    tarot_result = tarot_service.generate_tarot_reading(tarot_deck_path, spread_size=spread_size, seed=seed)

    return {
        "tarot_question": tarot_question,
        **tarot_result,
        **palm_result,
    }
