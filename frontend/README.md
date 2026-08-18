# Lucem — Palmistry & Tarot Intelligence (Frontend)

React + Vite + Tailwind. Talks to the FastAPI backend in `../backend`.

## Setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` just needs `VITE_API_URL` pointing at the backend (defaults to
`http://localhost:8000`, which matches the backend README).

## Run

```bash
npm run dev
```

Opens at http://localhost:5173.

## Build for production

```bash
npm run build
npm run preview   # serve the built files locally to sanity-check
```
