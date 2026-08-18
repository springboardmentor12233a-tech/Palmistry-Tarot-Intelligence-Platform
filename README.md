# Palmistry & Tarot Intelligence Platform

Beginner-friendly internship project for a localhost spiritual/self-reflection platform using React, FastAPI, PostgreSQL, and the required tarot-json dataset.

## Current Phase

Phase 0 is complete: requirements review, source-material preservation, initial folder structure, and planning documentation.

No application code has been built yet.

## Planned Stack

- Frontend: React.js + Vite + JavaScript.
- Backend: Python + FastAPI.
- Database: PostgreSQL.
- Charts: Chart.js.
- Image processing: Pillow/OpenCV where practical.
- AI interpretation: optional external API plus required local fallback.

## Localhost Targets

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- FastAPI docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

## Folder Structure

```text
Palmistry-Tarot-Intelligence-Platform/
  frontend/
  backend/
  data/
    tarot/
      cards/
  docs/
    source-material/
  reports/
  tests/
  scripts/
  screenshots/
  README.md
  PROJECT_FILE_MAP.md
  CHANGELOG.md
  .env.example
  .gitignore
```

## Important Notes

- The official PDF and blueprint image are preserved in `docs/source-material/`.
- No additional ZIP/source project was provided. This project is being developed from scratch.
- The tarot dataset has not been downloaded yet.
- Palm analysis will be implemented honestly as a prototype unless a trained model is supplied.
- The app must include clear disclaimers that readings are reflective/spiritual content, not scientific predictions.

## Beginner Setup Notes

Detailed install and run commands will be added after the frontend and backend are scaffolded in later phases.

For now, review:

- `docs/PROJECT_PLAN.md`
- `docs/PROJECT_REQUIREMENTS.md`
- `docs/ZIP_ANALYSIS.md`
- `docs/TAROT_DATASET.md`
- `PROJECT_FILE_MAP.md`

## GitHub Preparation

This project includes `.gitignore` and `.env.example`. Do not commit real `.env` files, passwords, API keys, virtual environments, or `node_modules/`.
