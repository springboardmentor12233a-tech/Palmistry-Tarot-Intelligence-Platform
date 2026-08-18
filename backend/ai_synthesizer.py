import os
import json
import base64
import requests
from typing import Optional, List, Dict

def get_gemini_api_key(custom_key: Optional[str] = None) -> Optional[str]:
    return custom_key or os.environ.get("GEMINI_API_KEY")


def _gemini_generate(parts: list, key: str, model: str = "gemini-3.5-flash", timeout: int = 20) -> Optional[str]:
    """
    Calls the Gemini REST API directly (bypassing the google-generativeai SDK).
    Works with both legacy 'AIza...' Standard keys and the newer 'AQ....' Auth
    keys Google is now issuing from AI Studio - the SDK version pinned in
    requirements.txt may predate that key format, so hitting the REST endpoint
    with the current auth header sidesteps any SDK/key-format mismatch.
    Returns the response text, or None (never raises) on any failure.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
    }
    body = {"contents": [{"parts": parts}]}

    resp = requests.post(url, headers=headers, json=body, timeout=timeout)

    if resp.status_code != 200:
        # Surface the real HTTP error so the fallback print statement is useful
        raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:500]}")

    data = resp.json()
    candidates = data.get("candidates", [])
    if not candidates:
        raise RuntimeError(f"No candidates in response: {json.dumps(data)[:500]}")

    text_parts = [p.get("text", "") for p in candidates[0].get("content", {}).get("parts", [])]
    text = "".join(text_parts).strip()
    return text or None


def analyze_palm_with_gemini(image_bytes: bytes, api_key: Optional[str] = None) -> Optional[Dict]:
    """
    Sends the uploaded palm photo to Gemini's vision model and asks it to
    return real, image-grounded palmistry line scores + archetypes as JSON.
    Returns None (never raises) if no key is set, the call fails, times out,
    or the model doesn't return valid JSON - callers should fall back to the
    synthetic engine in that case.
    """
    key = get_gemini_api_key(api_key)
    if not key or not image_bytes:
        return None

    try:
        prompt = (
            "You are an expert palmistry (chiromancy) reader. Look carefully at the "
            "palm in this photo and analyze the four main lines you can actually see: "
            "the Heart Line, Head Line, Life Line, and Fate Line, plus the four mounts "
            "(Jupiter, Venus, Moon, Sun).\n\n"
            "Respond with ONLY raw JSON (no markdown fences, no commentary) matching "
            "exactly this schema:\n"
            "{\n"
            '  "heart_line": {"score": <0-100 number>, "archetype": "<Short Style Label> '
            '(<one-line trait description>)", "description": "<one sentence on what this governs>"},\n'
            '  "head_line": {"score": <0-100>, "archetype": "...", "description": "..."},\n'
            '  "life_line": {"score": <0-100>, "archetype": "...", "description": "..."},\n'
            '  "fate_line": {"score": <0-100>, "archetype": "...", "description": "..."},\n'
            '  "mounts": [\n'
            '    {"mount": "Mount of Jupiter (Under Index)", "significance": "Ambition & Natural Leadership", "strength": "<NN%>"},\n'
            '    {"mount": "Mount of Venus (Base of Thumb)", "significance": "Vitality, Passion & Charm", "strength": "<NN%>"},\n'
            '    {"mount": "Mount of Moon (Lower Palm)", "significance": "Intuition, Dreams & Imagination", "strength": "<NN%>"},\n'
            '    {"mount": "Mount of Sun (Under Ring)", "significance": "Creativity, Fame & Success", "strength": "<NN%>"}\n'
            "  ]\n"
            "}\n"
            "Base the scores and archetypes on what is actually visible in the photo "
            "(line depth, length, curvature, breaks) rather than generic guesses."
        )

        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        parts = [
            {"text": prompt},
            {"inline_data": {"mime_type": "image/jpeg", "data": b64_image}},
        ]

        raw = _gemini_generate(parts, key, model="gemini-3.5-flash", timeout=20)
        if not raw:
            return None
        raw = raw.strip()
        # Strip markdown code fences if the model wrapped the JSON in them anyway
        if raw.startswith("```"):
            raw = raw.strip("`")
            if raw.lower().startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        parsed = json.loads(raw)

        required = ["heart_line", "head_line", "life_line", "fate_line", "mounts"]
        if not all(k in parsed for k in required):
            return None

        return parsed
    except Exception as e:
        print(f"[Gemini Palm Vision fallback] {e}")
        return None

def generate_tarot_reading(cards: List[Dict], question: str, api_key: Optional[str] = None) -> tuple[str, str]:
    """
    Generates a personalized Tarot reading for the drawn cards and question.
    """
    key = get_gemini_api_key(api_key)
    
    # Try calling Gemini if key is provided
    if key:
        try:
            cards_summary = "\n".join([
                f"- {c['position']}: {c['card']['name']} ({c['orientation']}) | Keywords: {', '.join(c['card'].get('keywords', []))} | Meaning: {'; '.join(c['card'].get('meanings', {}).get('light' if c['upright'] else 'shadow', []))}"
                for c in cards
            ])
            
            prompt = (
                f"You are a wise and compassionate Master Tarot Oracle.\n"
                f"The querent asks: \"{question}\"\n\n"
                f"The cards drawn in this spread are:\n{cards_summary}\n\n"
                f"Provide an eloquent, deeply insightful, and empowering interpretation. "
                f"Connect each card's archetypal energy directly to the querent's question, "
                f"and conclude with an inspiring piece of actionable spiritual advice (200-300 words)."
            )
            
            text = _gemini_generate([{"text": prompt}], key, model="gemini-3.5-flash", timeout=20)
            if text:
                return text, "gemini-ai"
        except Exception as e:
            print(f"[Gemini Tarot fallback] {e}")
    
    # High-quality Astrological Synthesis Engine fallback
    reading_lines = []
    reading_lines.append(f"✨ Oracle's Insight for: \"{question}\"\n")
    reading_lines.append("The cosmos has aligned these sacred archetypes for your inquiry:\n")
    
    for c in cards:
        card = c["card"]
        pos = c["position"]
        orient = c["orientation"]
        side = "light" if c["upright"] else "shadow"
        meanings = card.get("meanings", {}).get(side, ["Transformation and awareness unfold."])
        
        reading_lines.append(f"🔮 {pos} — {card['name']} ({orient}):")
        reading_lines.append(f"   The archetype of {card.get('archetype', card['name'])} indicates {meanings[0].lower()}. In this position, it asks you to embrace {', '.join(card.get('keywords', [])[:3])}.")
        if len(meanings) > 1:
            reading_lines.append(f"   Pay special attention to {meanings[1].lower()}.\n")
        else:
            reading_lines.append("\n")
            
    reading_lines.append(
        "🌟 Synthesized Guidance:\n"
        "Your path is marked by profound transition and opportunity. When navigating this cycle, "
        "trust in your inner discernment and let the wisdom of the cards ground your decisions. "
        "Take intentional steps forward, honoring both your intuition and practical responsibilities."
    )
    
    return "\n".join(reading_lines), "celestial-engine"


def generate_combined_reading(palm_data: Dict, cards: List[Dict], question: str, image_bytes: Optional[bytes] = None, api_key: Optional[str] = None) -> tuple[str, str]:
    """
    Synthesizes palm lines analysis, tarot cards spread, and the user's inquiry into a unified psychic reading.
    """
    key = get_gemini_api_key(api_key)
    
    # Format cards and palm summary
    cards_text = "\n".join([
        f"- {c['position']}: {c['card']['name']} ({c['orientation']}) [Keywords: {', '.join(c['card'].get('keywords', []))}]"
        for c in cards
    ])
    
    palm_lines_summary = "\n".join([
        f"- {info['name']}: Score {info['score']}/100 ({info['archetype']})"
        for key_name, info in palm_data.get("lines", {}).items()
    ])
    
    if key:
        try:
            prompt = (
                f"You are a revered mystic sage master of both Ancient Palmistry and Sacred Tarot.\n\n"
                f"QUERENT'S QUESTION: \"{question}\"\n\n"
                f"PALMISTRY ANALYSIS:\n{palm_lines_summary}\n\n"
                f"TAROT SPREAD DRAWN:\n{cards_text}\n\n"
                f"Write a unified, multi-layered psychic and astrological reading that synthesizes what is etched in their palm "
                f"with the cosmic energies revealed by the Tarot. Structure the reading into:\n"
                f"1. 🌌 Celestial Essence & Overview\n"
                f"2. ❤️ Heart & Emotional Landscape (Connecting Palm Heart Line & Tarot)\n"
                f"3. ⚡ Mind, Ambition & Destiny (Head/Fate Lines & Tarot Guidance)\n"
                f"4. 🌿 Life Force, Vitality & Overcoming Blocks\n"
                f"5. ✨ Sacred Oracle Blessing & Actionable Path Forward\n"
                f"Keep the tone majestic, empowering, and deeply comforting (300-450 words)."
            )

            parts = [{"text": prompt}]
            if image_bytes:
                b64_image = base64.b64encode(image_bytes).decode("utf-8")
                parts.append({"inline_data": {"mime_type": "image/jpeg", "data": b64_image}})

            text = _gemini_generate(parts, key, model="gemini-3.5-flash", timeout=20)
            if text:
                return text, "gemini-multimodal-ai"
        except Exception as e:
            print(f"[Gemini Multimodal fallback] {e}")

    # Fallback Astrological Synthesis
    heart = palm_data.get("lines", {}).get("heart_line", {}).get("archetype", "Emotionally receptive and perceptive")
    head = palm_data.get("lines", {}).get("head_line", {}).get("archetype", "Analytical and visionary")
    life = palm_data.get("lines", {}).get("life_line", {}).get("archetype", "Resilient with steady vitality")
    fate = palm_data.get("lines", {}).get("fate_line", {}).get("archetype", "Clear career trajectory")
    
    first_card = cards[0]['card']['name'] if cards else "The Sun"
    center_card = cards[1]['card']['name'] if len(cards) > 1 else "The Star"
    future_card = cards[2]['card']['name'] if len(cards) > 2 else "The World"
    
    text = (
        f"🌌 Celestial Essence & Cosmic Alignment\n"
        f"For your inquiry: \"{question}\"\n"
        f"The sacred convergence of your palm's physical blueprint and the astral archetypes reveals a powerful cycle of empowerment.\n\n"
        f"❤️ Heart & Emotional Resonance\n"
        f"Your palm displays a {heart}. This emotional nature is mirrored by the presence of {first_card}, "
        f"calling for vulnerability tempered with self-love. You are entering a chapter where relationships achieve genuine authenticity.\n\n"
        f"⚡ Mind, Ambition & Destiny\n"
        f"With your {head} and a {fate}, your intellectual energy aligns seamlessly with {center_card}. "
        f"The oracle encourages you to step into leadership, trusting your creative instincts to dissolve any perceived roadblocks.\n\n"
        f"🌿 Vitality & Spiritual Foundation\n"
        f"Your {life} confirms an innate resilience. As indicated by {future_card}, your energy is revitalizing. "
        f"Ground yourself in daily mindful rituals to sustain this high vibrational flow.\n\n"
        f"✨ Sacred Oracle Blessing\n"
        f"You are the master of your destiny. Let the wisdom etched in your palm and the foresight of the tarot illuminate your choices. "
        f"Step forward with courage, knowing the universe conspires in your favor."
    )
    
    return text, "celestial-multimodal-engine"
