import io
import json
import urllib.parse
import urllib.request
import uuid

BASE = "http://127.0.0.1:8000"


def post_json(endpoint, data, token=None):
    url = f"{BASE}{endpoint}"
    headers = {"Content-Type": "application/json", "User-Agent": "WalkthroughTester"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(
        url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def get_json(endpoint, token=None):
    url = f"{BASE}{endpoint}"
    headers = {"User-Agent": "WalkthroughTester"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    print("=================================================================")
    print("  PALMISTRY & TAROT INTELLIGENCE PLATFORM — LIVE API WALKTHROUGH")
    print("  Testing /docs Endpoints via Direct HTTP Execution")
    print("=================================================================\n")

    # 1. Registration
    print(">>> 1. Testing POST /api/auth/register")
    reg_email = f"seeker_{uuid.uuid4().hex[:6]}@cosmicoracle.ai"
    reg_payload = {
        "name": "Aurelia Vance",
        "email": reg_email,
        "password": "SovereignPassword888!",
        "age_group": "25-34",
        "interests": ["Vedic Palmistry", "Hermetic Tarot", "Archetypal Psychology"],
        "spiritual_goals": ["Discovering Life Purpose", "Navigating Career Crossroads"],
    }
    auth_res = post_json("/api/auth/register", reg_payload)
    token = auth_res["tokens"]["access_token"]
    user_id = auth_res["user"]["id"]
    print(f"    [OK] User Registered: {auth_res['user']['name']} ({auth_res['user']['email']})")
    print(f"    [OK] User ID: {user_id}")
    print(f"    [OK] Access Token Issued: {token[:32]}...\n")

    # 2. Palm Analysis
    print(">>> 2. Testing POST /api/palm/analyze (UNet & Biometric Line Classification)")
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = io.BytesIO()
    body.write(f"--{boundary}\r\n".encode("utf-8"))
    body.write(b'Content-Disposition: form-data; name="image_url"\r\n\r\n')
    body.write(b"https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800\r\n")
    body.write(f"--{boundary}--\r\n".encode("utf-8"))
    data_bytes = body.getvalue()

    req = urllib.request.Request(
        f"{BASE}/api/palm/analyze",
        data=data_bytes,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}", "Authorization": f"Bearer {token}"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        palm_res = json.loads(resp.read().decode("utf-8"))

    print(f"    [OK] Hand Type Detected: {palm_res['hand_type']} (Primary Element: {palm_res['primary_element']})")
    print(f"    [OK] Confidence Score: {palm_res['confidence_score']}%")
    print(f"    [OK] Heart Line: {palm_res['lines']['heart_line']['summary']}")
    print(f"    [OK] Head Line: {palm_res['lines']['head_line']['summary']}")
    print(f"    [OK] Life Line: {palm_res['lines']['life_line']['summary']}\n")

    # 3. Tarot Draw
    print(">>> 3. Testing POST /api/tarot/draw (Past, Present & Future Spread)")
    tarot_payload = {"spread_type": "three_card", "seed": 888}
    tarot_res = post_json("/api/tarot/draw", tarot_payload, token=token)
    print(f"    [OK] Spread Title: {tarot_res['spread_title']}")
    for card_drawn in tarot_res["cards"]:
        c = card_drawn["card"]
        orientation = "Reversed" if card_drawn["is_reversed"] else "Upright"
        print(f"        • [{card_drawn['position_label']}] {c['name']} ({orientation}) | Suit: {c['suit']} | Element: {c['element']}")
    print()

    # 4. Reading Generation
    print(">>> 4. Testing POST /api/reading/generate (Groq LLM Synthesis & Scoring)")
    reading_payload = {
        "palm_result": palm_res,
        "tarot_spread": tarot_res,
        "user_context": {
            "focus_topic": "Career Crossroads & Creative Sovereignty",
            "specific_question": "How can I best align my creative skills with long-term financial abundance?",
        },
    }
    reading_res = post_json("/api/reading/generate", reading_payload, token=token)
    reading_id = reading_res["id"]
    print(f"    [OK] Reading Generated ID: {reading_id}")
    print(f"    [OK] Overall Insight Score: {reading_res['insight_score']['overall']}% ({reading_res['insight_score']['tier']})")
    print(f"        - Palm Confidence Sub-Score: {reading_res['insight_score']['palm_confidence']}%")
    print(f"        - Tarot Relevance Sub-Score: {reading_res['insight_score']['tarot_relevance']}%")
    print(f"        - Personality Alignment Sub-Score: {reading_res['insight_score']['personality_alignment']}%")
    print(f"        - Context Relevance Sub-Score: {reading_res['insight_score']['context_relevance']}%")
    print(f"        - Consistency Sub-Score: {reading_res['insight_score']['consistency']}%")
    print(f"\n    [OK] Executive Narrative Synthesis:\n    \"{reading_res['interpretation']['overview_summary']}\"\n")
    print(f"    [OK] Primary Archetype: {reading_res['personality']['primary_archetype']}")
    print(f"    [OK] Life Path Theme: {reading_res['life_trend']['life_path_summary']}")
    print(f"    [OK] Daily Mantra: \"{reading_res['recommendations']['daily_mantra']}\"\n")

    # 5. Reading Fetch
    print(f">>> 5. Testing GET /api/reading/{reading_id} (Database Persistence)")
    stored = get_json(f"/api/reading/{reading_id}", token=token)
    print(f"    [OK] Successfully retrieved stored reading from SQLite/PostgreSQL database.")
    print(f"    [OK] Associated Seeker User ID: {stored.get('user_id')}\n")

    # 6. Exports
    print(f">>> 6. Testing GET /api/reading/{reading_id}/export (PDF & Excel Streams)")
    req_pdf = urllib.request.Request(f"{BASE}/api/reading/{reading_id}/export?format=pdf", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req_pdf) as resp_pdf:
        pdf_bytes = resp_pdf.read()
        print(f"    [OK] PDF Report Generated: {len(pdf_bytes)} bytes | MIME: {resp_pdf.headers.get('Content-Type')}")

    req_xlsx = urllib.request.Request(f"{BASE}/api/reading/{reading_id}/export?format=xlsx", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req_xlsx) as resp_xlsx:
        xlsx_bytes = resp_xlsx.read()
        print(f"    [OK] Excel Workbook Generated: {len(xlsx_bytes)} bytes | MIME: {resp_xlsx.headers.get('Content-Type')}\n")

    # 7. User Reading History
    print(">>> 7. Testing GET /api/users/me/readings")
    history = get_json("/api/users/me/readings", token=token)
    print(f"    [OK] Retrieved {len(history)} past readings in user history.")
    for h in history:
        print(f"        • ID: {h['id']} | Date: {h['date'][:10]} | Score: {h['overall_score']}% | Theme: {h['key_theme']}")

    print("\n=================================================================")
    print("  ALL API ENDPOINTS TESTED LIVE AND FULLY OPERATIONAL (100% PASS)")
    print("  Ready for seamless Next.js frontend connection!")
    print("=================================================================")


if __name__ == "__main__":
    main()
