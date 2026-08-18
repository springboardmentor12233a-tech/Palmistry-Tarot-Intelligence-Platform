# Database Documentation

Status: PLANNED

The project will use PostgreSQL as the primary database. No database tables are implemented in Phase 1.

## Current Implementation

IMPLEMENTED:

- Backend configuration placeholder for `DATABASE_URL`.
- Backend database module skeleton at `backend/app/database/session.py`.

PLANNED:

- Actual PostgreSQL database creation.
- SQLAlchemy models.
- Database migrations or setup script.
- Table relationships and indexes.

## Planned Tables

| Table | Status | Purpose |
|---|---|---|
| `users` | PLANNED | Stores account identity, role, status, and hashed password |
| `profiles` | PLANNED | Stores user profile details and preferences |
| `palm_readings` | PLANNED | Stores palm upload metadata and prototype analysis results |
| `tarot_readings` | PLANNED | Stores tarot spread, selected cards, category, and summary |
| `reading_results` | PLANNED | Stores normalized result summaries for readings and insights |
| `recommendations` | PLANNED | Stores contextual recommendations linked to a user or reading |
| `life_trends` | PLANNED | Stores reflective trend scores by category |
| `reports` | PLANNED | Stores generated report metadata and file paths |
| `notifications` | PLANNED | Stores in-app notification messages |

## Planned Relationships

- One user has one profile.
- One user can have many palm readings.
- One user can have many tarot readings.
- One reading can have many recommendations.
- One user can have many life trend snapshots.
- One user can have many reports.
- One user can have many notifications.

## Environment Variable

The connection string will be configured through:

```text
DATABASE_URL=postgresql://username:password@localhost:5432/palmistry_tarot_db
```

Do not commit a real `.env` file.
