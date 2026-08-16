from palmtarot.palm_engine.rules import (
    generate_palm_rule_report,
    interpret_aspect_ratio,
    interpret_finger,
    interpret_line_length,
    interpret_palm_height,
    interpret_palm_width,
)


def test_interpret_palm_width():
    assert interpret_palm_width(0.20) == "Narrow Palm"
    assert interpret_palm_width(0.26) == "Medium Palm"
    assert interpret_palm_width(0.30) == "Wide Palm"


def test_interpret_palm_height():
    assert interpret_palm_height(0.35) == "Short Palm"
    assert interpret_palm_height(0.42) == "Medium Palm Height"
    assert interpret_palm_height(0.50) == "Long Palm"


def test_interpret_finger():
    assert interpret_finger(0.40) == "Short"
    assert interpret_finger(0.46) == "Medium"
    assert interpret_finger(0.55) == "Long"


def test_interpret_aspect_ratio():
    assert interpret_aspect_ratio(1.20) == "Square Palm"
    assert interpret_aspect_ratio(1.40) == "Rectangular Palm"
    assert interpret_aspect_ratio(1.60) == "Long Rectangular Palm"


def test_interpret_line_length():
    assert interpret_line_length(180.0) == "Long"
    assert interpret_line_length(120.0) == "Medium"
    assert interpret_line_length(80.0) == "Short"


def test_generate_palm_rule_report():
    features = {
        "palm_width": 0.26,
        "palm_height": 0.42,
        "thumb_length": 0.45,
        "index_length": 0.48,
        "middle_length": 0.52,
        "ring_length": 0.48,
        "little_length": 0.41,
        "aspect_ratio": 1.61
    }
    report = generate_palm_rule_report(features)
    assert report["Palm_Width_Type"] == "Medium Palm"
    assert report["Palm_Height_Type"] == "Medium Palm Height"
    assert report["Middle_Type"] == "Long"
    assert report["Little_Type"] == "Short"
    assert "Palm Shape" in report["formatted_report"]
