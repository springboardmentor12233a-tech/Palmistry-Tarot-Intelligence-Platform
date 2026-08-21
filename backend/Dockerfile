FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies required for OpenCV, PyTorch, and MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and assets (UNet weights, MediaPipe model, Tarot cards)
COPY . .

# Download any missing model weights or Tarot imagery during build
RUN python scripts/download_assets.py

# Make entrypoint script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port (default 8000, dynamically overridden by $PORT at runtime)
EXPOSE 8000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
