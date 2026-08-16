from unittest.mock import patch

import cv2
import numpy as np
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def create_dummy_image_bytes() -> bytes:
    """Create a synthetic RGB image in memory for API testing."""
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    # Draw simple hand-like shape
    cv2.circle(img, (150, 150), 80, (200, 200, 200), -1)
    is_success, buffer = cv2.imencode(".jpg", img)
    return buffer.tobytes() if is_success else b"dummy"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_analyze_palm_success():
    img_bytes = create_dummy_image_bytes()
    files = {"file": ("test_hand.jpg", img_bytes, "image/jpeg")}
    response = client.post("/analyze/palm", files=files)

    assert response.status_code == 200
    data = response.json()
    assert "landmarks" in data
    assert "engineered_features" in data
    assert "cluster" in data
    assert "rule_report" in data
    assert "palm_lines" in data


def test_analyze_palm_corrupt_file():
    files = {"file": ("bad_image.jpg", b"invalid image bytes data", "image/jpeg")}
    response = client.post("/analyze/palm", files=files)

    assert response.status_code == 400
    data = response.json()
    assert "Corrupt or unreadable" in data["detail"] or "Failed to decode" in data["detail"]


def test_analyze_tarot_success():
    payload = {"num_cards": 3, "seed": 42}
    response = client.post("/analyze/tarot", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["num_cards"] == 3
    assert len(data["cards"]) == 3
    assert data["cards"][0]["position"] == "Past"


def test_analyze_tarot_invalid_card_count():
    payload = {"num_cards": 0}
    response = client.post("/analyze/tarot", json=payload)
    assert response.status_code in [400, 422]


@patch("palmtarot.llm.client.LLMInterpreter.generate_reading")
def test_full_reading_endpoint(mock_llm_reading):
    mock_llm_reading.return_value = {
        "personality": "Mock personality narrative",
        "career_guidance": "Mock career advice",
        "relationship_insights": "Mock relationship insights",
        "health_wellness": "Mock health advice",
        "life_trend": "Mock life trend",
        "strengths": ["Focus", "Adaptability"],
        "areas_for_improvement": ["Patience"],
        "recommendations": ["Reflect daily"]
    }

    img_bytes = create_dummy_image_bytes()
    files = {"file": ("test_hand.jpg", img_bytes, "image/jpeg")}
    data = {"user_question": "What is my destiny?", "num_cards": "3"}

    response = client.post("/reading/full", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()

    assert res_data["user_question"] == "What is my destiny?"
    assert "pdf_url" in res_data
    assert res_data["pdf_url"].startswith("/pdf/")
    assert res_data["interpretation"]["personality"] == "Mock personality narrative"


def test_auth_login_endpoint():
    payload = {"email": "admin@gmail.com", "password": "admin123"}
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "admin"


import uuid


def test_auth_register_endpoint():
    uid = uuid.uuid4().hex[:6]
    email = f"api_test_{uid}@gmail.com"
    payload = {
        "name": "API Test User",
        "email": email,
        "password": "password123",
        "confirm_password": "password123",
        "role": "user"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert data["role"] == "user"


def test_auth_demo_users_endpoint():
    response = client.get("/auth/demo-users")
    assert response.status_code == 200
    data = response.json()
    assert "demo_users" in data
    assert len(data["demo_users"]) >= 2


def test_admin_dashboards_endpoints():
    login_resp = client.post("/auth/login", json={"email": "admin@gmail.com", "password": "admin123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    users_resp = client.get("/admin/users", headers=headers)
    assert users_resp.status_code == 200
    assert "users" in users_resp.json()
