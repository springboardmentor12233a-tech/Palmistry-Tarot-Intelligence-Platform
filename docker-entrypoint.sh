#!/bin/sh
set -e

echo "=== Starting Palmistry & Tarot Intelligence Platform ==="
echo "Environment: ${ENVIRONMENT:-production}"
echo "Port: ${PORT:-8000}"

# Run database migrations if SYNC_DATABASE_URL or DATABASE_URL is configured
if [ -n "$DATABASE_URL" ] || [ -n "$SYNC_DATABASE_URL" ]; then
    echo "Running Alembic migrations..."
    alembic upgrade head || echo "Migration warning: proceeding with startup"
fi

# Ensure directories exist
mkdir -p results assets

# Start FastAPI server dynamically binding to PORT
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
