import os
import io
import math
import random
from typing import Optional
from PIL import Image, ImageOps, ImageEnhance, ImageFilter

def analyze_palm_image(image_bytes: bytes, filename: str = "palm.jpg", api_key: Optional[str] = None):
    """
    Analyzes an uploaded palm image. If a Gemini API key is available, the real
    photo is sent to Gemini's vision model for a grounded reading; otherwise (or
    if that call fails/times out for any reason) this falls back to a
    deterministic synthetic generator so the feature always returns a result.
    """
    width, height = 800, 1000
    if image_bytes:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            width, height = image.size
        except Exception:
            # If synthetic bytes passed, proceed with standard dimensions
            pass
    else:
        image_bytes = b"default_palm_tensor"

    # Static decorative line-overlay coordinates for the frontend canvas (not
    # derived from real landmark detection either way, used purely for the
    # visual line-drawing on top of the photo).
    overlay_landmarks = {
        "heart_line": [
            {"x": 82, "y": 42}, {"x": 65, "y": 40}, {"x": 48, "y": 44}, {"x": 35, "y": 49}
        ],
        "head_line": [
            {"x": 22, "y": 52}, {"x": 40, "y": 55}, {"x": 60, "y": 62}, {"x": 78, "y": 70}
        ],
        "life_line": [
            {"x": 22, "y": 52}, {"x": 28, "y": 65}, {"x": 34, "y": 78}, {"x": 42, "y": 88}
        ],
        "fate_line": [
            {"x": 50, "y": 90}, {"x": 51, "y": 70}, {"x": 50, "y": 52}, {"x": 48, "y": 38}
        ]
    }

    # ---- Try real Gemini vision analysis of the actual photo first ----
    try:
        import ai_synthesizer
        gemini_result = ai_synthesizer.analyze_palm_with_gemini(image_bytes, api_key=api_key)
    except Exception as e:
        print(f"[Palm Gemini call skipped] {e}")
        gemini_result = None

    if gemini_result:
        try:
            lines = {}
            for key_name, label, desc_default in [
                ("heart_line", "Heart Line (Emotional & Romantic Flow)",
                 "Governs how you experience romantic love, emotional resilience, and connection with fellow souls."),
                ("head_line", "Head Line (Intellect & Mindset)",
                 "Reflects your intellectual methodology, problem-solving prowess, and psychological focus."),
                ("life_line", "Life Line (Vitality & Physical Energy)",
                 "Indicates physical vitality, stamina, passion for lived experiences, and foundational well-being."),
                ("fate_line", "Fate Line (Destiny & Career Vector)",
                 "Reveals the trajectory of career fulfillment, life purpose, and self-directed achievements."),
            ]:
                entry = gemini_result.get(key_name, {})
                lines[key_name] = {
                    "name": label,
                    "score": float(entry.get("score", 80)),
                    "archetype": entry.get("archetype", "Balanced expression"),
                    "description": entry.get("description", desc_default)
                }

            mounts = gemini_result.get("mounts") or []

            heart_score = lines["heart_line"]["score"]
            head_score = lines["head_line"]["score"]
            life_score = lines["life_line"]["score"]

            return {
                "success": True,
                "filename": filename,
                "image_dimensions": {"width": width, "height": height},
                "lines": lines,
                "mounts": mounts,
                "overall_compatibility_index": f"{round((heart_score + head_score + life_score) / 3, 1)}%",
                "overlay_landmarks": overlay_landmarks,
                "source": "gemini-vision"
            }
        except Exception as e:
            # Malformed Gemini JSON shape - fall through to synthetic engine below
            print(f"[Palm Gemini result malformed, using fallback] {e}")

    # ---- Deterministic synthetic fallback (used with no key, or on any failure above) ----
    return _synthetic_palm_analysis(image_bytes, filename, width, height, overlay_landmarks)


def _synthetic_palm_analysis(image_bytes: bytes, filename: str, width: int, height: int, overlay_landmarks: dict):
    # Deterministic yet diverse trait calculation based on image hash & dimensions
    img_hash = sum(image_bytes[:min(1024, len(image_bytes))])
    rng = random.Random(img_hash)

    # Core Palmistry Lines Metrics
    heart_depth = round(rng.uniform(75.0, 96.0), 1)
    head_length = round(rng.uniform(70.0, 98.0), 1)
    life_vitality = round(rng.uniform(78.0, 99.0), 1)
    fate_prominence = round(rng.uniform(65.0, 94.0), 1)
    intuition_mount = round(rng.uniform(70.0, 95.0), 1)

    # Determine qualitative readings based on metrics
    heart_style = (
        "Curved & Deep (Deeply passionate, empathetic, prioritizes meaningful heart connections)"
        if heart_depth > 85 else
        "Straight & Clear (Balanced, logical in romance, values emotional loyalty and honesty)"
    )

    head_style = (
        "Long & Sloping (Highly creative, visionary thinker with strong philosophical intuition)"
        if head_length > 85 else
        "Sharp & Direct (Pragmatic problem-solver with acute analytical clarity)"
    )

    life_style = (
        "Strong & Sweeping Arc (Robust vitality, incredible recuperative power, zest for adventure)"
        if life_vitality > 88 else
        "Smooth & Steady (Disciplined stamina, paced energy reserves, resilient immune vitality)"
    )

    fate_style = (
        "Distinct Vertical Ascent (Self-made destiny, clear professional focus and leadership aura)"
        if fate_prominence > 80 else
        "Dynamic & Adaptable (Versatile career path, success through diverse multidisciplinary talents)"
    )

    mount_highlights = [
        {"mount": "Mount of Jupiter (Under Index)", "significance": "Ambition & Natural Leadership", "strength": f"{round(rng.uniform(80, 98))}%"},
        {"mount": "Mount of Venus (Base of Thumb)", "significance": "Vitality, Passion & Charm", "strength": f"{round(rng.uniform(82, 99))}%"},
        {"mount": "Mount of Moon (Lower Palm)", "significance": "Intuition, Dreams & Imagination", "strength": f"{round(rng.uniform(75, 96))}%"},
        {"mount": "Mount of Sun (Under Ring)", "significance": "Creativity, Fame & Success", "strength": f"{round(rng.uniform(70, 92))}%"}
    ]

    # Generate synthetic visual landmark overlay vectors for the frontend canvas
    # Normalized coordinates [x, y] in percentage (passed in from the caller,
    # kept consistent whether this ran as the primary path or a Gemini fallback)

    return {
        "success": True,
        "filename": filename,
        "image_dimensions": {"width": width, "height": height},
        "lines": {
            "heart_line": {
                "name": "Heart Line (Emotional & Romantic Flow)",
                "score": heart_depth,
                "archetype": heart_style,
                "description": "Governs how you experience romantic love, emotional resilience, and connection with fellow souls."
            },
            "head_line": {
                "name": "Head Line (Intellect & Mindset)",
                "score": head_length,
                "archetype": head_style,
                "description": "Reflects your intellectual methodology, problem-solving prowess, and psychological focus."
            },
            "life_line": {
                "name": "Life Line (Vitality & Physical Energy)",
                "score": life_vitality,
                "archetype": life_style,
                "description": "Indicates physical vitality, stamina, passion for lived experiences, and foundational well-being."
            },
            "fate_line": {
                "name": "Fate Line (Destiny & Career Vector)",
                "score": fate_prominence,
                "archetype": fate_style,
                "description": "Reveals the trajectory of career fulfillment, life purpose, and self-directed achievements."
            }
        },
        "mounts": mount_highlights,
        "overall_compatibility_index": f"{round((heart_depth + head_length + life_vitality) / 3, 1)}%",
        "overlay_landmarks": overlay_landmarks,
        "source": "celestial-engine"
    }
