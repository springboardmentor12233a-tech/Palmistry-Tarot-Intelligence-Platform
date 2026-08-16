from pathlib import Path

from palmtarot.report.pdf_generator import generate_pdf_report


def test_generate_pdf_report(tmp_path: Path):
    output_pdf = tmp_path / "test_report.pdf"

    reading_data = {
        "user_question": "What does my career hold?",
        "palm_lines": [
            {"Line": "Heart", "Length": 180.5, "Area": 250.0, "Angle": 45.0, "Interpretation": "Long"},
            {"Line": "Head", "Length": 120.0, "Area": 190.0, "Angle": 30.0, "Interpretation": "Medium"},
            {"Line": "Life", "Length": 210.0, "Area": 310.0, "Angle": 60.0, "Interpretation": "Long"}
        ],
        "tarot_reading": {
            "cards": [
                {"position": "Past", "name": "The Fool", "orientation": "Upright", "meaning": "New beginnings"},
                {"position": "Present", "name": "The Magician", "orientation": "Upright", "meaning": "Resourcefulness"},
                {"position": "Future", "name": "The World", "orientation": "Upright", "meaning": "Fulfillment"}
            ]
        },
        "interpretation": {
            "personality": "Creative and balanced.",
            "career_guidance": "High potential for leadership.",
            "relationship_insights": "Harmonious dynamics.",
            "health_wellness": "Strong vitality.",
            "life_trend": "Upward trajectory.",
            "strengths": ["Leadership", "Clarity"],
            "areas_for_improvement": ["Patience"],
            "recommendations": ["Focus on long-term strategy"]
        }
    }

    result_path = generate_pdf_report(reading_data, output_path=output_pdf)
    assert result_path.exists()
    assert result_path.stat().st_size > 0


def test_resolve_card_img_filename():
    from palmtarot.report.pdf_generator import _resolve_card_img_filename
    assert _resolve_card_img_filename({"img": "w01.jpg", "name": "Ace of Wands"}) == "w01.jpg"
    assert _resolve_card_img_filename({"name": "The Fool"}) == "m00.jpg"
    assert _resolve_card_img_filename({}) == "ar00.jpg"

