# Palmistry & Tarot Intelligence Platform — Backend Service

FastAPI-powered machine learning and LLM intelligence service for the Palmistry & Tarot Intelligence Platform. This backend powers the Next.js frontend, providing real PyTorch UNet segmentation on palm line photos, 78-card archetypal Tarot spread drawer, Groq LLM interpretation synthesis, weighted Insight Scoring, and automated PDF / Excel report exports.

---

## Architecture Overview

- **Framework**: Python 3.11, FastAPI, Uvicorn
- **ML / Biometrics**:
  - **UNet Palm Segmentation**: PyTorch model checkpoint (`checkpoint_aug_epoch70.pth`)
  - **MediaPipe Hand Landmarker**: 21-keypoint homography rectification & line measurement
- **Tarot Engine**: 78-card dataset with Major and Minor Arcana across Wands, Cups, Swords, and Pentacles
- **AI Synthesis**: Groq API (`openai/gpt-oss-120b` / `llama-3.1-8b-instant`)
- **Database & Auth**: PostgreSQL (or SQLite for development) with SQLAlchemy 2.0 async sessions & Alembic migrations; JWT authentication with httpOnly cookie & Bearer token support
- **Reporting**: Automated multi-page PDF generation (`fpdf2` / `reportlab`) and styled multi-sheet Excel workbooks (`openpyxl`)

---

## Directory Structure

```
palmistry-backend/
├── app/
│   ├── main.py                     # FastAPI application setup, CORS, static mounts, and /health
│   ├── core/
│   │   ├── config.py               # Pydantic Settings & environment variables
│   │   └── security.py             # JWT token creation/verification, password hashing
│   ├── db/
│   │   ├── base.py                 # SQLAlchemy DeclarativeBase
│   │   ├── session.py              # Async engine and get_db session dependency
│   │   └── models.py               # User and Reading tables
│   ├── schemas/                    # Pydantic request/response validation models
│   ├── services/
│   │   ├── palm_analysis.py        # UNet palm analysis & line classification
│   │   ├── palm_core/              # UNet architecture, homography warp, skeletonization
│   │   ├── tarot_engine.py         # 78-card spread drawer with position semantics
│   │   ├── ai_interpretation.py    # Groq LLM synthesis prompts and fallbacks
│   │   ├── scoring.py              # Exact weighted Insight Score calculator
│   │   └── report_generator.py     # PDF and Excel export engine
│   └── api/                        # REST API routers matching the Next.js frontend contract
│       ├── auth.py                 # /api/auth/register, /login, /refresh, /logout
│       ├── users.py                # /api/users/me, /api/users/me/readings
│       ├── palm.py                 # /api/palm/analyze
│       ├── tarot.py                # /api/tarot/draw
│       ├── reading.py              # /api/reading/generate, /api/reading/{id}, /export
│       └── notifications.py        # /api/notifications
├── assets/                         # ML weights, MediaPipe model, tarot-images.json, card images
├── alembic/                        # Database migration scripts
├── scripts/
│   └── download_assets.py          # Automated asset downloader
├── tests/                          # Standalone and API test suites
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

---

## Quickstart & Setup

### 1. Environment Setup

Copy `.env.example` to `.env` and configure your credentials:

```bash
cp .env.example .env
```

Key environment variables in `.env`:
```ini
GROQ_API_KEY=gsk_your_groq_api_key_here
JWT_SECRET=super-secret-jwt-key-for-development-1234567890!
DATABASE_URL=sqlite+aiosqlite:///./palmistry.db
SYNC_DATABASE_URL=sqlite:///./palmistry.db
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

*(For PostgreSQL production deployment, set `DATABASE_URL=postgresql+asyncpg://postgres:postgrespassword@db:5432/palmistry_db`)*

### 2. Local Virtual Environment

```bash
# Create and activate Python 3.11 virtual environment
py -3.11 -m venv venv
.\venv\Scripts\activate   # Windows
# or: source venv/bin/activate # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Download model weights and card images (automatic)
python scripts/download_assets.py
```

### 3. Run Database Migrations

```bash
alembic upgrade head
```

### 4. Start the Development Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## Running via Docker & Docker-Compose

To run the complete platform (FastAPI backend + PostgreSQL) in containers:

```bash
docker-compose up --build -d
```

To stop containers:
```bash
docker-compose down
```

---

## API Endpoints (Frontend Contract)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user account with hashed password |
| `POST` | `/api/auth/login` | Login user, issue JWT access + refresh tokens |
| `POST` | `/api/auth/refresh` | Silent refresh of expired access token |
| `POST` | `/api/auth/logout` | Clear auth cookies |
| `GET` | `/api/users/me` | Fetch authenticated user profile |
| `PUT` | `/api/users/me` | Update profile fields & reading preferences |
| `GET` | `/api/users/me/readings` | Retrieve seeker reading history |
| `POST` | `/api/palm/analyze` | Multipart image upload for UNet segmentation & biometric line classification |
| `POST` | `/api/tarot/draw` | Draw Tarot spread (`single_card`, `three_card`, `celtic_cross`, etc.) |
| `POST` | `/api/reading/generate` | Synthesize palm + tarot + context via Groq LLM into full structured reading |
| `GET` | `/api/reading/{id}` | Retrieve stored reading by unique ID |
| `GET` | `/api/reading/{id}/export?format=pdf\|xlsx` | Download complete reading as branded PDF report or Excel workbook |
| `GET` | `/api/notifications` | Retrieve alerts and celestial transits |
| `GET` | `/health` | Container health check |

---

## Insight Score Formula

```
overall = (palm_confidence * 0.30) + (tarot_relevance * 0.25) + (personality_alignment * 0.20)
        + (context_relevance * 0.15) + (consistency * 0.10)
```

Tiers:
- **Celestial Alignment**: Score $\ge 92$
- **Harmonic Resonance**: $80 \le \text{Score} < 92$
- **Promising Insight**: $65 \le \text{Score} < 80$
- **Emerging Synthesis**: $\text{Score} < 65$

---

## Running the Test Suite

```bash
pytest -v
```
