# ============================================================
# ROLE-BASED ACCESS CONTROL TESTS
# ============================================================


# ============================================================
# ADMIN ENDPOINT
# ============================================================

def test_normal_user_cannot_access_admin(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.get(
        "/api/admin/overview",
        headers=account["headers"],
    )

    assert response.status_code == 403


def test_tarot_reader_cannot_access_admin(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="tarot_reader"
    )

    response = client.get(
        "/api/admin/overview",
        headers=account["headers"],
    )

    assert response.status_code == 403


def test_spiritual_consultant_cannot_access_admin(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="spiritual_consultant"
    )

    response = client.get(
        "/api/admin/overview",
        headers=account["headers"],
    )

    assert response.status_code == 403


def test_administrator_can_access_admin(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="administrator"
    )

    response = client.get(
        "/api/admin/overview",
        headers=account["headers"],
    )

    assert response.status_code == 200

    data = response.json()

    assert "total_users" in data
    assert "active_users" in data
    assert "inactive_users" in data
    assert "roles" in data


# ============================================================
# TAROT READER DASHBOARD
# ============================================================

def test_normal_user_cannot_access_tarot_reader_dashboard(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.get(
        "/api/tarot-reader/analytics/summary",
        headers=account["headers"],
    )

    assert response.status_code == 403


def test_spiritual_consultant_cannot_access_tarot_reader_dashboard(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="spiritual_consultant"
    )

    response = client.get(
        "/api/tarot-reader/analytics/summary",
        headers=account["headers"],
    )

    assert response.status_code == 403


def test_tarot_reader_can_access_tarot_reader_dashboard(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="tarot_reader"
    )

    response = client.get(
        "/api/tarot-reader/analytics/summary",
        headers=account["headers"],
    )

    assert response.status_code == 200

    data = response.json()

    assert "total_readings" in data
    assert "spread_distribution" in data


def test_administrator_can_access_tarot_reader_dashboard(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="administrator"
    )

    response = client.get(
        "/api/tarot-reader/analytics/summary",
        headers=account["headers"],
    )

    assert response.status_code == 200


# ============================================================
# SPIRITUAL CONSULTANT DASHBOARD
# ============================================================

def test_normal_user_cannot_access_consultant_dashboard(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="user"
    )

    response = client.get(
        "/api/spiritual-consultant/analytics/summary",
        headers=account["headers"],
    )

    assert response.status_code == 403


def test_tarot_reader_cannot_access_consultant_dashboard(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="tarot_reader"
    )

    response = client.get(
        "/api/spiritual-consultant/analytics/summary",
        headers=account["headers"],
    )

    assert response.status_code == 403


def test_spiritual_consultant_can_access_consultant_dashboard(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="spiritual_consultant"
    )

    response = client.get(
        "/api/spiritual-consultant/analytics/summary",
        headers=account["headers"],
    )

    assert response.status_code == 200

    data = response.json()

    assert "total_readings" in data
    assert "average_guidance_score" in data


def test_administrator_can_access_consultant_dashboard(
    client,
    authenticated_user,
):

    account = authenticated_user(
        role="administrator"
    )

    response = client.get(
        "/api/spiritual-consultant/analytics/summary",
        headers=account["headers"],
    )

    assert response.status_code == 200


# ============================================================
# UNAUTHENTICATED ACCESS
# ============================================================

def test_admin_requires_authentication(
    client,
):

    response = client.get(
        "/api/admin/overview"
    )

    assert response.status_code == 401


def test_tarot_reader_dashboard_requires_authentication(
    client,
):

    response = client.get(
        "/api/tarot-reader/analytics/summary"
    )

    assert response.status_code == 401


def test_consultant_dashboard_requires_authentication(
    client,
):

    response = client.get(
        "/api/spiritual-consultant/analytics/summary"
    )

    assert response.status_code == 401