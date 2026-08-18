# Lucem — Palmistry & Tarot Intelligence Platform

Full-stack rebuild of your Colab notebook: FastAPI backend (MediaPipe + OpenCV palm-line
detection, a 78-card tarot engine, Groq LLM interpretation, auth, PDF export, chat) plus a
React/Vite/Tailwind frontend implementing your flow:

```
Register/Login → Dashboard → Palmistry | Tarot → AI report → Combine → Chat → History
```

See `backend/README.md` and `frontend/README.md` for full setup details. Quick version below.

## Run it locally (two terminals)

**Terminal 1 — backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then edit .env and add your GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install
cp .env.example .env             # defaults already point at localhost:8000
npm run dev
```

Then open **http://localhost:5173**, register an account, and try a palm or tarot reading.

## Requirements

- Python 3.10+
- Node 18+
- A free Groq API key: https://console.groq.com
- Internet access on first run (backend downloads the ~10MB MediaPipe hand model automatically)

## Folder map

```
backend/    FastAPI app — see backend/README.md
frontend/   React app — see frontend/README.md
```
