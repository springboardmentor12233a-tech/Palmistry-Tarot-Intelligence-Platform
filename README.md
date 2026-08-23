# Palmistry & Tarot Intelligence Platform — Cosmic Oracle

An AI-powered spiritual intelligence platform that fuses computer-vision palm analysis with tarot archetypes to generate personalized, synthesized readings — combining palm-line detection, tarot draws, LLM-based interpretation, personality profiling, recommendations, and life-trend analysis into one product.

The project was developed as an Infosys Springboard internship prototype using a **FastAPI backend**, a **Next.js/React frontend**, and **Groq-powered AI interpretation**.

**Live App:** https://palmistry-frontend-ten.vercel.app
**Live API:** https://palmistry-tarot-intelligence-platform-production.up.railway.app (`/docs` for interactive API reference)

---

## Overview

The Palmistry & Tarot Intelligence Platform allows a user to:

- Upload or select a palm image for analysis
- Detect supported palm-line results
- Draw tarot cards from a full 78-card deck across multiple spread types
- Generate a combined AI-synthesized reading (palm + tarot)
- View personality insights (traits, strengths, growth areas)
- Review life-trend analysis (life path theme, opportunities, challenges)
- Receive categorized recommendations (personal growth, relationships, career, goal alignment)
- Download a complete reading report as a PDF, including tarot card artwork and palm results

---

## Current Prototype Scope

### Palm Analysis

The current palm-analysis engine, built on a deep-learning U-Net model with MediaPipe-based image alignment, supports:

- Heart Line
- Head Line
- Life Line

Detection was validated on 300 real images from the training dataset, achieving a **measured 91.3% success rate**. This figure is reported as tested, not assumed.

The following are **not currently supported** and should not be presented as detected features:
- Fate Line
- Sun Line
- Palm Shape
- Finger Structure

### Tarot Reading

The tarot engine supports a complete 78-card tarot deck (22 Major Arcana, 56 Minor Arcana) with:

- Upright and reversed (light/shadow) meanings
- Card keywords
- Tarot card artwork images

Supported spreads:
- Daily Oracle Pulse (1 card)
- Temporal Trinity — Past / Present / Future (3 cards)
- Soul Mirror & Dynamics (4 cards)
- Destiny Helix & Life Path (6 cards)
- Vocation & Abundance Matrix (5 cards)
- Grand Celtic Cross (10 cards)

---

## Main Features

### Palmistry Module
- Palm image processing
- Heart Line, Head Line, and Life Line results
- Palm analysis descriptions
- Annotated/processed image display

### Tarot Module
- 78-card tarot dataset
- Multiple spread options (1 to 10 cards)
- Upright/reversed orientation
- Card meanings, keywords, and artwork

### AI Reading Engine
The AI reading workflow combines palm results and tarot results into synthesized outputs, generated via the Groq API (`openai/gpt-oss-120b`):

- Personalized narrative reading
- Past / Present / Future descriptions tied to specific tarot cards
- Combined palm + tarot interpretation

### Personality Intelligence
- Personality traits
- Strengths
- Growth areas (framed constructively)
- Current life-phase summary

### Recommendation Engine
- Personal growth recommendations
- Career suggestions
- Relationship guidance
- Goal alignment recommendations

### Life-Trend Analysis
- Life path theme
- Current opportunity
- Potential challenge (framed constructively)
- Growth potential

Life-trend outputs are symbolic guidance and are not guaranteed predictions of future events.

### Reports
- Combined reading PDF generation (palm results, tarot card images with Past/Present/Future predictions, personality insights, recommendations, life-trend analysis)
- PDF download

---

## Technology Stack

### Palm Analysis Engine
- Python
- PyTorch (U-Net)
- MediaPipe Tasks API
- OpenCV
- scikit-image

### Backend
- Python
- FastAPI

### AI / Interpretation
- Groq API (`openai/gpt-oss-120b`)

### Reports
- fpdf2
- Pillow

### Frontend
- Next.js 14
- React

### Development & Deployment
- Google Colab — ML engine development and validation
- Google Antigravity — agentic application build
- Vercel — frontend hosting
- Railway — backend hosting
- Git & GitHub

---



## Local Development

### Prerequisites
Install:
- Python
- Node.js
- npm
- Git

### Backend Setup

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` using `.env.example` as reference, then run:

```
uvicorn main:app --reload
```

Local backend: `http://127.0.0.1:8000`
API documentation: `http://127.0.0.1:8000/docs`

### Frontend Setup

```
cd frontend
npm install
npm run dev
```

Local frontend: `http://localhost:3000`

---

## Environment Variables

### Backend

```
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
DATABASE_URL=
SECRET_KEY=
PUBLIC_FRONTEND_URL=
```

Do not commit production credentials or API keys into Git.

### Frontend

```
NEXT_PUBLIC_API_BASE_URL=
```

---

## Key API Endpoints

```
GET    /                          Health check / API status
GET    /docs                      Interactive API documentation

POST   /api/palm/analyze          Submit a palm image for analysis
POST   /api/tarot/draw            Draw a tarot spread
POST   /api/reading/generate      Generate combined AI reading
POST   /api/reading/report        Generate downloadable PDF report
```

---

## Production Deployment

The project is deployed using Vercel (frontend) and Railway (backend).

**Frontend:**
https://palmistry-frontend-ten.vercel.app

**Backend:**
https://palmistry-tarot-intelligence-platform-production.up.railway.app

Production configuration is handled using platform environment variables. Secret values must never be stored directly in the repository.

---

## Visual Design

The frontend uses a custom **Cosmic / Celestial Oracle** visual theme featuring:

- Deep midnight/indigo backgrounds
- Mystical violet and warm gold accents
- Soft lavender highlights
- Subtle stars and constellation patterns
- Atmospheric glow effects
- Tarot and palm-line symbolism woven into the design language

---

## Important Disclaimer

Palmistry and tarot features in this platform are intended for:
- Entertainment
- Personal reflection
- Educational demonstration
- Software prototype evaluation

They should not be treated as scientific, medical, legal, financial, or guaranteed predictive advice.

AI-generated interpretations and life-trend outputs are symbolic and contextual rather than factual predictions.

---

## Milestones & Development Status

| Milestone | Weeks | Focus | Status |
|---|---|---|---|
| 1 | 1–2 | Project setup, EDA on palm & tarot datasets, hand landmark extraction | ✅ Complete |
| 2 | 3–4 | Palm Analysis Engine (deep learning), Tarot Intelligence Engine, Reading Reports | ✅ Complete |
| 3 | 5–6 | AI Interpretation Engine (Groq LLM), Personality Module, Recommendation Engine, Life Trend Analysis | ✅ Complete |
| 4 | 7–8 | Frontend + backend build, deployment, end-to-end live workflow | ✅ Complete |

The current prototype includes:
- Palm analysis engine
- Tarot engine
- AI interpretation
- Personality intelligence
- Recommendation engine
- Life-trend analysis
- Combined reading reports (PDF)
- Deployed, live frontend and backend

---


---

## Repository

**Repository:** springboardmentor12233a-tech/Palmistry-Tarot-Intelligence-Platform

---

## Author

**Leela**
Infosys Springboard Internship Project, 2026
