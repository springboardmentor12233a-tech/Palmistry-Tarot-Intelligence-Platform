# Deployment Documentation

Status: PLANNED

The priority is a working localhost application. Cloud deployment is not required for the current milestone.

## Current Localhost Targets

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- FastAPI docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

## Current Phase 1 Startup

Backend:

```powershell
cd C:\apache-tomcat-9.0.100\webapps\Enterprise-IT-Support-Ticketing-Portal\Palmistry-Tarot-Intelligence-Platform\backend
python -m uvicorn app.main:app --reload
```

Frontend:

```powershell
cd C:\apache-tomcat-9.0.100\webapps\Enterprise-IT-Support-Ticketing-Portal\Palmistry-Tarot-Intelligence-Platform\frontend
npm.cmd install
npm.cmd run dev
```

If npm reports `UNABLE_TO_VERIFY_LEAF_SIGNATURE` on this machine, use this one-time install command:

```powershell
npm.cmd install --strict-ssl=false
```

## Optional Future Docker

Docker is PLANNED only after the localhost app works reliably.
