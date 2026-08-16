from typing import Any


def interpret_palm_width(x: float) -> str:
    """Interpret palm width distance."""
    if x < 0.25:
        return "Narrow Palm"
    elif x < 0.27:
        return "Medium Palm"
    else:
        return "Wide Palm"


def interpret_palm_height(x: float) -> str:
    """Interpret palm height distance."""
    if x < 0.40:
        return "Short Palm"
    elif x < 0.45:
        return "Medium Palm Height"
    else:
        return "Long Palm"


def interpret_finger(length: float) -> str:
    """Interpret finger length."""
    if length < 0.43:
        return "Short"
    elif length < 0.50:
        return "Medium"
    else:
        return "Long"


def interpret_aspect_ratio(r: float) -> str:
    """Interpret palm aspect ratio."""
    if r < 1.30:
        return "Square Palm"
    elif r < 1.48:
        return "Rectangular Palm"
    else:
        return "Long Rectangular Palm"


def interpret_line_length(length: float) -> str:
    """Interpret palm line length (Heart, Head, Life)."""
    if length >= 170:
        return "Long"
    elif length >= 100:
        return "Medium"
    else:
        return "Short"


def generate_palm_rule_report(features: dict[str, float]) -> dict[str, Any]:
    """Generate structured rule-based interpretation dictionary and formatted text report."""
    width_type = interpret_palm_width(features.get("palm_width", 0.0))
    height_type = interpret_palm_height(features.get("palm_height", 0.0))
    thumb_type = interpret_finger(features.get("thumb_length", 0.0))
    index_type = interpret_finger(features.get("index_length", 0.0))
    middle_type = interpret_finger(features.get("middle_length", 0.0))
    ring_type = interpret_finger(features.get("ring_length", 0.0))
    little_type = interpret_finger(features.get("little_length", 0.0))
    shape_type = interpret_aspect_ratio(features.get("aspect_ratio", 0.0))

    formatted_text = f"""
Palm Analysis Report
--------------------
Palm Shape      : {shape_type}
Palm Width      : {width_type}
Palm Height     : {height_type}

Finger Analysis
---------------
Thumb           : {thumb_type}
Index Finger    : {index_type}
Middle Finger   : {middle_type}
Ring Finger     : {ring_type}
Little Finger   : {little_type}
""".strip()

    return {
        "Palm_Shape": shape_type,
        "Palm_Width_Type": width_type,
        "Palm_Height_Type": height_type,
        "Thumb_Type": thumb_type,
        "Index_Type": index_type,
        "Middle_Type": middle_type,
        "Ring_Type": ring_type,
        "Little_Type": little_type,
        "formatted_report": formatted_text,
    }
