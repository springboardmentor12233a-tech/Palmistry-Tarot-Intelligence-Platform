# ============================================================
# BASIC API / TAROT / ANALYTICS / REPORT TESTS
# ============================================================


# ============================================================
# ROOT
# ============================================================

def test_root_endpoint(
    client,
):

    response = client.get(
        "/"
    )

    assert (
        response.status_code
        == 200
    )


# ============================================================
# HEALTH
# ============================================================

def test_health_endpoint(
    client,
):

    response = client.get(
        "/api/health"
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert isinstance(
        data,
        dict,
    )


# ============================================================
# TAROT DATASET
# ============================================================

def test_tarot_dataset_summary(
    client,
):

    response = client.get(
        "/api/tarot/dataset-summary"
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data["status"]
        == "success"
    )

    assert (
        data["usable_card_count"]
        == 78
    )


# ============================================================
# SINGLE CARD
# ============================================================

def test_single_card_draw(
    client,
):

    response = client.post(
        "/api/tarot/draw",

        json={
            "spread":
                "Single Card"
        },
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data["card_count"]
        == 1
    )

    assert (
        len(
            data["cards"]
        )
        == 1
    )

    assert (
        data["cards"][0][
            "position"
        ]
        == "Guidance"
    )


# ============================================================
# PAST / PRESENT / FUTURE
# ============================================================

def test_past_present_future_draw(
    client,
):

    response = client.post(
        "/api/tarot/draw",

        json={
            "spread":
                "Past-Present-Future"
        },
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        data["card_count"]
        == 3
    )

    assert (
        len(
            data["cards"]
        )
        == 3
    )

    positions = [

        card["position"]

        for card in data[
            "cards"
        ]
    ]

    assert positions == [
        "Past",
        "Present",
        "Future",
    ]

    card_names = [

        card["name"]

        for card in data[
            "cards"
        ]
    ]

    assert (
        len(
            card_names
        )
        ==
        len(
            set(
                card_names
            )
        )
    )


# ============================================================
# INVALID TAROT SPREAD
# ============================================================

def test_invalid_tarot_spread(
    client,
):

    response = client.post(
        "/api/tarot/draw",

        json={
            "spread":
                "Invalid Spread"
        },
    )

    assert (
        response.status_code
        == 422
    )


# ============================================================
# ANALYTICS REQUIRE AUTHENTICATION
# ============================================================

def test_analytics_summary_requires_authentication(
    client,
):

    response = client.get(
        "/api/analytics/summary"
    )

    assert (
        response.status_code
        == 401
    )


def test_analytics_history_requires_authentication(
    client,
):

    response = client.get(
        "/api/analytics/history"
    )

    assert (
        response.status_code
        == 401
    )


# ============================================================
# AUTHENTICATED ANALYTICS
# ============================================================

def test_analytics_summary(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.get(
        "/api/analytics/summary",

        headers=(
            account[
                "headers"
            ]
        ),
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert (
        "total_readings"
        in data
    )

    assert (
        "average_guidance_score"
        in data
    )

    assert (
        "spread_distribution"
        in data
    )

    assert (
        "category_distribution"
        in data
    )

    assert (
        "orientation_distribution"
        in data
    )


# ============================================================
# AUTHENTICATED ANALYTICS HISTORY
# ============================================================

def test_analytics_history(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.get(
        "/api/analytics/history?limit=10",

        headers=(
            account[
                "headers"
            ]
        ),
    )

    assert (
        response.status_code
        == 200
    )

    data = response.json()

    assert isinstance(
        data,
        list,
    )


# ============================================================
# HISTORY LIMIT VALIDATION
# ============================================================

def test_invalid_history_limit(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.get(
        "/api/analytics/history?limit=101",

        headers=(
            account[
                "headers"
            ]
        ),
    )

    assert (
        response.status_code
        == 422
    )


# ============================================================
# REPORTS REQUIRE AUTHENTICATION
# ============================================================

def test_analytics_csv_requires_authentication(
    client,
):

    response = client.get(
        "/api/reports/analytics-summary.csv"
    )

    assert (
        response.status_code
        == 401
    )


def test_history_csv_requires_authentication(
    client,
):

    response = client.get(
        "/api/reports/reading-history.csv"
    )

    assert (
        response.status_code
        == 401
    )


# ============================================================
# ANALYTICS CSV
# ============================================================

def test_analytics_csv_export(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.get(
        "/api/reports/analytics-summary.csv",

        headers=(
            account[
                "headers"
            ]
        ),
    )

    assert (
        response.status_code
        == 200
    )

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


# ============================================================
# HISTORY CSV
# ============================================================

def test_history_csv_export(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.get(
        "/api/reports/reading-history.csv",

        headers=(
            account[
                "headers"
            ]
        ),
    )

    assert (
        response.status_code
        == 200
    )

    assert (
        "text/csv"
        in response.headers[
            "content-type"
        ]
    )

    assert (
        "ID"
        in response.text
    )