from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200


def test_health_endpoint():
    response = client.get(
        "/api/health"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, dict)


def test_tarot_dataset_summary():
    response = client.get(
        "/api/tarot/dataset-summary"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "success"

    assert (
        data["usable_card_count"]
        == 78
    )


def test_single_card_draw():
    response = client.post(
        "/api/tarot/draw",
        json={
            "spread": "Single Card"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["card_count"] == 1

    assert len(data["cards"]) == 1

    assert (
        data["cards"][0]["position"]
        == "Guidance"
    )


def test_past_present_future_draw():
    response = client.post(
        "/api/tarot/draw",
        json={
            "spread":
                "Past-Present-Future"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["card_count"] == 3

    assert len(data["cards"]) == 3

    positions = [
        card["position"]
        for card in data["cards"]
    ]

    assert positions == [
        "Past",
        "Present",
        "Future",
    ]

    card_names = [
        card["name"]
        for card in data["cards"]
    ]

    assert len(card_names) == len(
        set(card_names)
    )


def test_invalid_tarot_spread():
    response = client.post(
        "/api/tarot/draw",
        json={
            "spread": "Invalid Spread"
        },
    )

    assert response.status_code == 422


def test_analytics_summary():
    response = client.get(
        "/api/analytics/summary"
    )

    assert response.status_code == 200

    data = response.json()

    assert "total_readings" in data

    assert (
        "average_guidance_score"
        in data
    )

    assert (
        "spread_distribution"
        in data
    )


def test_analytics_history():
    response = client.get(
        "/api/analytics/history?limit=10"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)


def test_invalid_history_limit():
    response = client.get(
        "/api/analytics/history?limit=101"
    )

    assert response.status_code == 422


def test_analytics_csv_export():
    response = client.get(
        "/api/reports/analytics-summary.csv"
    )

    assert response.status_code == 200

    assert (
        "text/csv"
        in response.headers[
            "content-type"
        ]
    )

    assert (
        "Section"
        in response.text
    )


def test_history_csv_export():
    response = client.get(
        "/api/reports/reading-history.csv"
    )

    assert response.status_code == 200

    assert (
        "text/csv"
        in response.headers[
            "content-type"
        ]
    )

    assert "ID" in response.text