import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.asyncio
async def test_health_and_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["service"] == "palmistry_backend"

        res_root = await client.get("/")
        assert res_root.status_code == 200


@pytest.mark.asyncio
async def test_auth_and_user_lifecycle():
    import uuid
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        unique_email = f"cosmic_seeker_{uuid.uuid4().hex[:8]}@oracle.ai"
        password = "SecretPassword123!"

        # 1. Register
        reg_payload = {
            "name": "Test Seeker",
            "email": unique_email,
            "password": password,
            "age_group": "25-34",
            "interests": ["Vedic Palmistry", "Hermetic Tarot"],
            "spiritual_goals": ["Spiritual Purpose"],
        }
        res_reg = await client.post("/api/auth/register", json=reg_payload)
        assert res_reg.status_code == 201
        reg_data = res_reg.json()
        assert reg_data["user"]["email"] == unique_email
        assert "tokens" in reg_data
        access_token = reg_data["tokens"]["access_token"]

        # 2. Login
        login_payload = {
            "email": unique_email,
            "password": password,
        }
        res_login = await client.post("/api/auth/login", json=login_payload)
        assert res_login.status_code == 200
        login_data = res_login.json()
        assert login_data["user"]["name"] == "Test Seeker"

        # 3. Get /api/users/me
        headers = {"Authorization": f"Bearer {access_token}"}
        res_me = await client.get("/api/users/me", headers=headers)
        assert res_me.status_code == 200
        assert res_me.json()["email"] == unique_email

        # 4. Update /api/users/me
        update_payload = {
            "name": "Enlightened Seeker",
            "reading_preferences": {"primary_focus": "Career & Destiny"},
        }
        res_update = await client.put("/api/users/me", json=update_payload, headers=headers)
        assert res_update.status_code == 200
        assert res_update.json()["name"] == "Enlightened Seeker"

        # 5. Logout
        res_logout = await client.post("/api/auth/logout")
        assert res_logout.status_code == 200


@pytest.mark.asyncio
async def test_tarot_and_palm_endpoints():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Tarot draw
        res_tarot = await client.post("/api/tarot/draw", json={"spread_type": "three_card", "seed": 777})
        assert res_tarot.status_code == 200
        tarot_data = res_tarot.json()
        assert tarot_data["spread_type"] == "three_card"
        assert len(tarot_data["cards"]) == 3

        # Palm analyze (without file - tests dynamic fallback/biometrics)
        res_palm = await client.post("/api/palm/analyze", data={"image_url": "https://example.com/palm.jpg"})
        assert res_palm.status_code == 200
        palm_data = res_palm.json()
        assert "lines" in palm_data
        assert palm_data["lines"]["heart_line"]["confidence"] >= 90


@pytest.mark.asyncio
async def test_reading_generation_and_exports():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Generate reading
        res_gen = await client.post(
            "/api/reading/generate",
            json={
                "user_context": {
                    "focus_topic": "Career Sovereignty",
                    "specific_question": "What is my highest vocation path?",
                }
            },
        )
        assert res_gen.status_code == 200
        reading_data = res_gen.json()
        reading_id = reading_data["id"]
        assert reading_id.startswith("rdg_")
        assert "insight_score" in reading_data
        assert reading_data["insight_score"]["overall"] > 0
        assert "personality" in reading_data
        assert "life_trend" in reading_data
        assert "recommendations" in reading_data

        # 2. Get reading by ID
        res_get = await client.get(f"/api/reading/{reading_id}")
        assert res_get.status_code == 200
        assert res_get.json()["id"] == reading_id

        # 3. Export PDF
        res_pdf = await client.get(f"/api/reading/{reading_id}/export?format=pdf")
        assert res_pdf.status_code == 200
        assert res_pdf.headers["content-type"] == "application/pdf"
        assert len(res_pdf.content) > 1000
        assert res_pdf.content.startswith(b"%PDF")

        # 4. Export Excel
        res_xlsx = await client.get(f"/api/reading/{reading_id}/export?format=xlsx")
        assert res_xlsx.status_code == 200
        assert "spreadsheetml" in res_xlsx.headers["content-type"]
        assert len(res_xlsx.content) > 1000


@pytest.mark.asyncio
async def test_notifications_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/notifications")
        assert res.status_code == 200
        notifications = res.json()
        assert isinstance(notifications, list)
        assert len(notifications) >= 1
