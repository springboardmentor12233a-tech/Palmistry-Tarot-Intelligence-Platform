# Testing Documentation

Status: PLANNED

Phase 1 verifies only the development foundation.

## Phase 1 Verification

| Test Case | Expected Result | Status |
|---|---|---|
| Start FastAPI backend | Backend runs at `http://localhost:8000` | IMPLEMENTED |
| Request `GET /` | Application identity JSON is returned | IMPLEMENTED |
| Request `GET /health` | Health JSON returns `status: healthy` | IMPLEMENTED |
| Start React frontend | Frontend runs at `http://localhost:5173` | IMPLEMENTED |
| Frontend calls backend health endpoint | Starter page can display backend connection status | IMPLEMENTED |

## Phase 1 Notes

- Frontend dependency installation required `npm.cmd install --strict-ssl=false` because the machine could not verify the npm registry certificate.
- Backend dependency installation required trusted hosts for pip because the machine had certificate verification issues.

## Planned Backend Tests

These are PLANNED for later phases:

- Registration.
- Login.
- JWT authentication.
- Protected routes.
- Tarot card retrieval.
- Tarot reading generation.
- Palm upload.
- Dashboard API.
- Report generation.

## Planned Manual Postman Tests

Postman collections or step-by-step requests will be documented after the API modules are implemented.
