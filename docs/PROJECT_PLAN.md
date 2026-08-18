# Project Plan

Project: Palmistry & Tarot Intelligence Platform

Phase: 0 - Requirements, source review, and initial project setup

Date: 2026-08-08

## A. Project Overview

The platform will be a localhost web application for spiritual and self-reflection readings. It will combine palm image upload, prototype palm feature analysis, tarot card readings, interpretation, dashboards, history, reports, and basic administration.

The application must be honest about its scope. Palmistry, tarot, life trends, and spiritual scoring are reflective and entertainment/wellness features, not scientific prediction, medical advice, financial advice, or guaranteed life outcomes.

## B. Official Requirements Summary

The attached request and official project material describe these major modules:

- User authentication and role-based access.
- User profile management.
- Palm analysis engine.
- Tarot reading engine using the required Kaggle tarot-json dataset.
- AI interpretation engine with external API support when configured and local fallback when not configured.
- Personality intelligence.
- Life trend analysis.
- Spiritual guidance scoring.
- Recommendation engine.
- User dashboard and analytics.
- Notification and engagement features.
- Reports and exports.
- Admin dashboard.
- Testing, deployment notes, and documentation.

Important implementation rule: build a stable localhost application first. Avoid unnecessary enterprise services such as Redis, Kafka, Kubernetes, Elasticsearch, microservices, or MongoDB unless a later phase proves they are necessary.

## C. Milestone 4 Requirements

For the final-week milestone, the realistic target is a complete demonstrable localhost application:

- React frontend at `http://localhost:5173`.
- FastAPI backend at `http://localhost:8000`.
- FastAPI docs at `http://localhost:8000/docs`.
- PostgreSQL database at `localhost:5432`.
- Working registration, login, JWT, protected routes, and USER/ADMIN roles.
- Working tarot reading flow using the required dataset.
- Working prototype palm upload and analysis flow.
- Working dashboards, analytics, history, reports, and documented limitations.

Cloud deployment and Docker are optional after the local app is stable.

## D. Source Project Analysis Summary

No additional ZIP/source project was provided. The Palmistry & Tarot Intelligence Platform is being developed from scratch using the official project requirements PDF, the specified Tarot dataset, and the provided design/blueprint reference.

Visible source material:

- Official PDF: `C:\Users\LENOVO\OneDrive\Desktop\AI\AI_Palmistry & Tarot Intelligence Platform.pdf`
- Blueprint image: `C:\Users\LENOVO\OneDrive\Desktop\AI\BluePrint.png`

Both files were copied into `docs/source-material/` for preserved reference. The original files were not modified.

Future phases should not search for, expect, or depend on a ZIP/source project.

## E. Tarot Dataset Integration Plan

Required dataset:

- Source: Kaggle Tarot Deck by `lsind18`
- URL: https://www.kaggle.com/datasets/lsind18/tarot-json

The dataset contains `tarot-images.json` and a `cards/` folder with 78 Rider-Waite-Smith card scans. The app will load cards from `data/tarot/tarot-images.json` and map image filenames to `data/tarot/cards/`.

Because Kaggle downloads usually require a Kaggle account/API token, Phase 1 or Phase 6 should include clear manual download instructions if direct download is unavailable.

## F. Proposed Architecture

Simple localhost architecture:

```text
React + Vite frontend
        |
        | REST API
        v
FastAPI backend
        |
        v
PostgreSQL database
        |
        +-- Tarot dataset files in data/tarot
        +-- Report files in reports
```

The backend will be modular, not microservice-based.

## G. Database Design

Planned PostgreSQL tables:

- `users`: login identity, hashed password, role, account status.
- `profiles`: user details and preferences.
- `palm_readings`: uploaded palm analysis metadata and extracted features.
- `tarot_readings`: spread, selected cards, category, summary.
- `reading_results`: shared result records for palm/tarot/insight outputs.
- `recommendations`: career, relationship, growth, and spiritual recommendations.
- `life_trends`: reflective score history by category.
- `reports`: generated PDF/report metadata.
- `notifications`: simple in-app notifications.

Detailed schema will be created in `docs/DATABASE.md` during the database phase.

## H. Frontend Pages

Public:

- Home, About, Features, Contact, Login, Register.

User:

- Dashboard, Palm Analysis, Palm Results, Tarot Reading, Tarot Results, AI Insights, Personality, Recommendations, Life Trends, Reading History, Reports, Profile, Notifications, Settings.

Admin:

- Admin Dashboard, User Management, Reading Analytics, System Reports.

Pages should be useful and connected to actual APIs. Empty button-only pages are not acceptable.

## I. Backend Modules

Planned modules:

- `auth`: registration, login, JWT.
- `users`: user and admin user management.
- `profiles`: user profile data.
- `tarot`: dataset loading, card listing, spreads, reading generation.
- `palm`: image upload, prototype feature extraction, result saving.
- `insights`: interpretation, personality, life trends, scoring.
- `recommendations`: contextual recommendations.
- `dashboard`: user/admin statistics.
- `reports`: PDF generation and downloads.
- `notifications`: simple in-app notices.

## J. API Plan

Planned route groups:

- `/api/auth/*`
- `/api/users/*`
- `/api/profile/*`
- `/api/tarot/*`
- `/api/palm/*`
- `/api/readings/*`
- `/api/insights/*`
- `/api/recommendations/*`
- `/api/life-trends/*`
- `/api/dashboard/*`
- `/api/reports/*`
- `/api/admin/*`

All protected routes will require JWT authentication. Admin routes will require ADMIN role.

## K. Palm Analysis Approach

Minimum viable approach:

- Accept palm image uploads.
- Validate file type and size.
- Preview image on frontend.
- Backend processes image using Pillow/OpenCV if available.
- Extract simple prototype features such as image quality, edge density, contrast, approximate hand/palm region hints, and line-like contours.
- Generate reflective palm interpretation for life line, head line, heart line, fate line, sun line, palm shape, and finger structure.

This is a prototype unless a trained model is later supplied. The app must not claim scientific validation.

## L. Tarot Reading Approach

Supported spreads:

- Single Card.
- Three Card: Past, Present, Future.
- Career.
- Relationship.
- Life Path.

Optional:

- Celtic Cross, if time remains.

Cards must be drawn without duplicates in one spread. Interpretations will use dataset fields such as name, arcana, suit, keywords, fortune telling, meanings, and questions.

## M. AI Interpretation Approach

Implementation will be modular:

- If `OPENAI_API_KEY` is configured, use external AI for richer wording.
- If no key is configured, use local structured fallback logic.

The application must work without an external AI API.

## N. Personality Approach

Personality output will be derived from:

- User profile preferences.
- Tarot keywords.
- Palm prototype indicators.
- Reading history.

It will include strengths, areas for improvement, behavior insights, and development suggestions.

## O. Recommendation Approach

Recommendations will be contextual and grouped into:

- Career.
- Relationships.
- Personal growth.
- Goal alignment.
- Spiritual development.

They should reference the user's reading context and avoid unrelated random advice.

## P. Life Trend Approach

Life trends will display reflective indicators for:

- Career.
- Relationships.
- Personal growth.
- Opportunities.
- Challenges.
- Overall growth potential.

Charts and progress bars will show percentages with a clear disclaimer.

## Q. Dashboard Plan

User dashboard:

- Total readings.
- Palm readings.
- Tarot readings.
- Reports.
- Recent readings.
- Reading activity chart.
- Insight categories chart.
- Personality summary.
- Recommendations.
- Life trends.

Admin dashboard:

- Total users.
- Total readings.
- Palm readings.
- Tarot readings.
- Active users.
- Recent users.
- Reading statistics.
- User management actions.

## R. Analytics Plan

Use Chart.js for:

- Reading activity over time.
- Tarot vs palm usage.
- Reading categories.
- User activity.
- Insight category distribution.

Charts should use backend/database data. Demo seed data must be labeled if used.

## S. Reports Plan

Minimum report types:

- Palmistry report.
- Tarot report.
- Personality report.
- Spiritual guidance report.
- Insight trend report.

Required:

- View report.
- Generate report.
- Download PDF.

Optional:

- Excel export.

Generated files will be stored under `reports/`.

## T. Testing Plan

Backend tests where practical:

- Registration.
- Login.
- Authentication.
- Tarot card retrieval.
- Tarot reading generation.
- Palm upload.
- Dashboard API.
- Report generation.

Manual Postman testing will be documented in `docs/TESTING.md`.

## U. Localhost Run Plan

Backend:

```text
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```text
cd frontend
npm install
npm run dev
```

PostgreSQL:

- Create a database.
- Put the connection string in `.env`.
- Run migrations or initialization script when implemented.

## V. Optional Docker Plan

Docker may be added after localhost is working:

- Backend container.
- Frontend container.
- PostgreSQL container.
- `docker-compose.yml` at project root.

Docker must not block the local manual run workflow.

## W. Documentation Plan

Documents to maintain:

- `README.md`
- `PROJECT_FILE_MAP.md`
- `CHANGELOG.md`
- `docs/PROJECT_PLAN.md`
- `docs/PROJECT_REQUIREMENTS.md`
- `docs/ZIP_ANALYSIS.md`
- `docs/TAROT_DATASET.md`
- Later: `docs/DATABASE.md`, `docs/API_DOCUMENTATION.md`, `docs/PALM_ANALYSIS.md`, `docs/TESTING.md`, `docs/DEPLOYMENT.md`, `docs/USER_GUIDE.md`, `FINAL_PROJECT_STRUCTURE.md`

## X. Final ZIP Plan

After all phases and verification pass, create:

`Palmistry-Tarot-Intelligence-Platform-Final.zip`

It must contain one top-level folder:

`Palmistry-Tarot-Intelligence-Platform/`

It must exclude secrets, `.env`, `node_modules/`, `.venv/`, caches, and temporary files.

## Y. Development Phases

0. Requirements, source review, initial project setup.
1. Project structure and documentation expansion.
2. React + Vite frontend scaffold.
3. FastAPI backend scaffold.
4. PostgreSQL schema and database setup.
5. Authentication and role authorization.
6. Tarot dataset integration.
7. Tarot reading engine.
8. Palm analysis prototype.
9. AI interpretation service and fallback.
10. Personality, recommendations, life trends, scoring.
11. User dashboard.
12. Admin dashboard.
13. Reports and PDF export.
14. Analytics and visualization.
15. Testing and validation.
16. UI polish.
17. Optional Docker.
18. Final documentation.
19. End-to-end verification.
20. Final ZIP.

## Z. Risks And Limitations

- PDF extraction was limited in this environment because no PDF parsing package was available and package installation failed due SSL certificate errors.
- No additional ZIP/source project was provided, so the application will be built from scratch.
- Kaggle direct download may require a Kaggle account/API token.
- Palm analysis will be a prototype unless a trained model/dataset is supplied.
- External AI requires an API key. The fallback engine must remain functional without it.
- Final-week scope is large, so the implementation should prioritize a reliable demo workflow over optional extras.
