# API Documentation

Status: Phase 1 foundation

Base URL:

`http://localhost:8000`

## Implemented Endpoints

### GET /

Status: IMPLEMENTED

Purpose: Confirms the FastAPI backend is running and identifies the application.

Authentication: Not required.

Example response:

```json
{
  "application": "Palmistry & Tarot Intelligence Platform",
  "message": "Palmistry & Tarot Intelligence Platform backend is running.",
  "phase": "Phase 1 foundation"
}
```

### GET /health

Status: IMPLEMENTED

Purpose: Health check endpoint for frontend/backend connection testing.

Authentication: Not required.

Example response:

```json
{
  "status": "healthy",
  "service": "backend",
  "database": "configured_not_connected"
}
```

## Planned API Groups

These route groups are PLANNED and are not implemented in Phase 1:

| API Group | Status | Purpose |
|---|---|---|
| `/api/auth/*` | PLANNED | Registration, login, JWT authentication, logout |
| `/api/users/*` | PLANNED | User account and admin user management |
| `/api/profile/*` | PLANNED | User profile data |
| `/api/palm/*` | PLANNED | Palm image upload and prototype analysis |
| `/api/tarot/*` | PLANNED | Tarot cards, spreads, and readings |
| `/api/readings/*` | PLANNED | Reading history and reading details |
| `/api/insights/*` | PLANNED | AI/local interpretation results |
| `/api/recommendations/*` | PLANNED | Contextual recommendations |
| `/api/life-trends/*` | PLANNED | Reflective life trend scores |
| `/api/dashboard/*` | PLANNED | User dashboard statistics |
| `/api/reports/*` | PLANNED | Report generation and downloads |
| `/api/admin/*` | PLANNED | Admin-only statistics and management |
