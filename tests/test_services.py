import pytest
from app.services.tarot_engine import tarot_engine
from app.services.palm_analysis import palm_service
from app.services.ai_interpretation import ai_service
from app.services.scoring import calculate_insight_score, derive_score_from_payloads
from app.services.report_generator import generate_pdf_report, generate_excel_report
from app.schemas.reading import FullReading


def test_tarot_engine_draw():
    result = tarot_engine.draw_spread("three_card", seed=42)
    assert result.spread_type == "three_card"
    assert len(result.cards) == 3
    assert result.cards[0].card.name is not None
    assert result.cards[0].position_label == "Past"
    assert result.cards[1].position_label == "Present"
    assert result.cards[2].position_label == "Future"


def test_scoring_weights():
    # Formula test
    # (90 * 0.30) + (90 * 0.25) + (90 * 0.20) + (90 * 0.15) + (90 * 0.10) = 90
    score = calculate_insight_score(
        palm_confidence=90.0,
        tarot_relevance=90.0,
        personality_alignment=90.0,
        context_relevance=90.0,
        consistency=90.0,
    )
    assert score.overall == 90.0
    assert score.tier == "Harmonic Resonance"

    # Test Celestial Alignment
    score_high = calculate_insight_score(95, 95, 95, 95, 95)
    assert score_high.overall == 95.0
    assert score_high.tier == "Celestial Alignment"


def test_palm_service_fallback_synthesis():
    palm_res = palm_service.analyze_palm_image(image_bytes=None)
    assert palm_res.hand_type is not None
    assert len(palm_res.contents) >= 6
    assert palm_res.lines.heart_line.summary is not None
    assert palm_res.confidence_score >= 90


def test_ai_interpretation_synthesis():
    palm_res = palm_service.analyze_palm_image(image_bytes=None)
    tarot_res = tarot_engine.draw_spread("three_card", seed=108)

    synthesis = ai_service.synthesize_full_reading(palm_res, tarot_res)
    assert "interpretation" in synthesis
    assert "personality" in synthesis
    assert "life_trend" in synthesis
    assert "recommendations" in synthesis
    assert len(synthesis["interpretation"].categories) >= 3


def test_pdf_and_excel_export():
    palm_res = palm_service.analyze_palm_image(image_bytes=None)
    tarot_res = tarot_engine.draw_spread("three_card", seed=108)
    synthesis = ai_service.synthesize_full_reading(palm_res, tarot_res)
    score = derive_score_from_payloads(palm_res.model_dump(), tarot_res.model_dump())

    full_reading = FullReading(
        id="rdg_test_001",
        date="2026-08-20T10:00:00Z",
        spread_type="three_card",
        spread_title="Past, Present & Future Synthesis",
        palm_result=palm_res,
        tarot_result=tarot_res,
        interpretation=synthesis["interpretation"],
        personality=synthesis["personality"],
        life_trend=synthesis["life_trend"],
        recommendations=synthesis["recommendations"],
        insight_score=score,
        created_at="2026-08-20T10:00:00Z",
    )

    pdf_bytes = generate_pdf_report(full_reading, user_name="Test Seeker")
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")

    excel_bytes = generate_excel_report(full_reading, user_name="Test Seeker")
    assert len(excel_bytes) > 1000
    assert excel_bytes[:2] == b"PK"  # Zip/XLSX header
