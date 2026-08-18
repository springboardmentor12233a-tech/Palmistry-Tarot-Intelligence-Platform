# Project File Map

Project root:

`C:\apache-tomcat-9.0.100\webapps\Enterprise-IT-Support-Ticketing-Portal\Palmistry-Tarot-Intelligence-Platform`

## Current Tree

```text
Palmistry-Tarot-Intelligence-Platform/
  frontend/
    .gitkeep
  backend/
    .gitkeep
  data/
    tarot/
      cards/
        .gitkeep
      .gitkeep
  docs/
    source-material/
      AI_Palmistry & Tarot Intelligence Platform.pdf
      BluePrint.png
    PROJECT_PLAN.md
    PROJECT_REQUIREMENTS.md
    ZIP_ANALYSIS.md
    TAROT_DATASET.md
  reports/
    .gitkeep
  tests/
    .gitkeep
  scripts/
    .gitkeep
  screenshots/
    .gitkeep
  README.md
  PROJECT_FILE_MAP.md
  CHANGELOG.md
  .env.example
  .gitignore
```

## Important Files

| File | Type | Purpose | Dependencies | Safe To Modify |
|---|---|---|---|---|
| `README.md` | Documentation | Beginner project overview and setup notes | None | Yes |
| `PROJECT_FILE_MAP.md` | Documentation | Tracks the project tree and important files | None | Yes, update when files change |
| `CHANGELOG.md` | Documentation | Tracks phase progress | None | Yes |
| `.env.example` | Configuration example | Shows required environment variables without secrets | Backend/frontend config later | Yes |
| `.gitignore` | Git config | Prevents secrets and build artifacts from being committed | Git | Yes |
| `docs/PROJECT_PLAN.md` | Documentation | Main implementation plan from Phase 0 | Request/PDF/blueprint/dataset source | Yes |
| `docs/PROJECT_REQUIREMENTS.md` | Documentation | Requirements summary and constraints | Request/PDF/blueprint | Yes |
| `docs/ZIP_ANALYSIS.md` | Documentation | Confirms no ZIP/source project was provided and documents from-scratch source inputs | Official PDF, blueprint, tarot dataset plan | Yes |
| `docs/TAROT_DATASET.md` | Documentation | Dataset source and integration plan | Kaggle tarot-json | Yes |
| `docs/source-material/AI_Palmistry & Tarot Intelligence Platform.pdf` | Source material | Preserved copy of official PDF | None | No, keep original copy unchanged |
| `docs/source-material/BluePrint.png` | Source material | Preserved UI blueprint reference | None | No, keep original copy unchanged |

## Folder Purposes

| Folder | Purpose |
|---|---|
| `frontend/` | React + Vite frontend source will be created here |
| `backend/` | FastAPI backend source will be created here |
| `data/tarot/` | Required tarot-json dataset will be placed here |
| `docs/` | Project documentation and preserved source references |
| `reports/` | Generated reports will be stored here |
| `tests/` | Test files and test support files |
| `scripts/` | Helper scripts for setup, seed data, or verification |
| `screenshots/` | Final verification screenshots |
