# Palmistry & Tarot Intelligence — Backend

FastAPI port of your Colab notebook: MediaPipe hand detection → palm ROI → CLAHE/denoise/
threshold preprocessing → skeletonization → graph-based line detection (Life/Head/Heart/Fate) →
feature extraction → Groq LLM interpretation, plus a tarot deck + spread engine, a combined
report generator, an AI chat grounded in each reading, PDF export, auth, and reading history.

## 1. Open in VS Code

```bash
cd backend
code .
```

Install the **Python** extension if you don't have it, then select this folder's
`.venv` as the interpreter once you create it below (VS Code will prompt you).

## 2. Create a virtual environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

`mediapipe` and `opencv-python-headless` are the heaviest installs — give it a minute.

## 4. Configure environment variables

```bash
cp .env.example .env       # Windows: copy .env.example .env
```

Open `.env` and set:
- `GROQ_API_KEY` — free key from https://console.groq.com
- `JWT_SECRET` — any long random string

## 5. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

- API base: http://localhost:8000
- Interactive docs: http://localhost:8000/docs

The first palm analysis request downloads MediaPipe's hand landmark model (~10MB) into
`backend/models/` automatically — you need internet access for that one-time download.

## Project layout

```
backend/
  app/
    main.py            FastAPI app, CORS, static files, routers
    config.py           settings from .env
    database.py          SQLAlchemy engine/session
    models.py            User, Reading, ChatMessage tables
    schemas.py            Pydantic request/response models
    security.py            password hashing + JWT
    deps.py                  get_db / get_current_user
    routers/
      auth.py                 register, login, /auth/me
      palm.py                  POST /palm/analyze (multipart image upload)
      tarot.py                  GET /tarot/deck, GET /tarot/spreads, POST /tarot/draw
      reports.py                  history, detail, POST /reports/combine, PDF export
      chat.py                      AI chat grounded in a specific reading
    services/
      hand_detection.py             MediaPipe + palm ROI extraction
      preprocessing.py               CLAHE / denoise / threshold / skeletonize
      line_graph.py                   skeleton → graph → Life/Head/Heart/Fate lines
      features.py                      length / curvature / tortuosity per line
      tarot_service.py                  78-card deck + spread drawing
      groq_service.py                    all LLM prompts (palm, tarot, combined, chat)
      pdf_service.py                      reportlab PDF assembly
    data/
      tarot_deck.json     generated 78-card deck (Major + Minor Arcana)
  static/                uploaded images, processed results, generated PDFs (served at /static)
  requirements.txt
  .env.example
```

## API quick reference

| Method | Path                    | Purpose                                  |
|--------|--------------------------|-------------------------------------------|
| POST   | `/auth/register`          | create account, returns JWT               |
| POST   | `/auth/login`               | returns JWT                               |
| GET    | `/auth/me`                    | current user                              |
| POST   | `/palm/analyze`                 | upload a palm photo → full analysis      |
| GET    | `/tarot/deck`                     | all 78 cards                            |
| GET    | `/tarot/spreads`                    | available spread layouts               |
| POST   | `/tarot/draw`                         | draw a spread + AI reading             |
| POST   | `/reports/combine`                       | merge a palm + tarot reading         |
| GET    | `/reports/history`                          | list your past readings           |
| GET    | `/reports/{id}`                                | a single reading in full       |
| GET    | `/reports/{id}/pdf`                               | download/generate its PDF   |
| GET/POST | `/chat/{reading_id}`                                | AI chat about a reading  |

All routes except `/auth/register` and `/auth/login` require `Authorization: Bearer <token>`.

## Notes on fidelity to the original notebook

The CV pipeline (hand alignment, ROI extraction, CLAHE/blackhat/threshold preprocessing,
skeleton graph construction, and Life/Head/Heart/Fate line heuristics) is a direct port of
your notebook's logic, just refactored into reusable functions with no `input()` prompts or
Colab-specific calls. The Groq prompts for palm and combined reports are your originals; a new
`tarot_interpretation` prompt was added since the notebook only had a combined-report prompt,
so the frontend can show a tarot-only reading before a palm reading exists.
