FROM python:3.10-slim


# ========================================================
# CONTAINER SETTINGS
# ========================================================

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV BACKEND_VENV=/opt/backend-venv
ENV PALM_VENV=/opt/palm-venv

ENV PATH="/opt/backend-venv/bin:$PATH"

ENV PALM_PYTHON_EXECUTABLE=/opt/palm-venv/bin/python


# ========================================================
# WORKING DIRECTORY
# ========================================================

WORKDIR /app


# ========================================================
# LINUX SYSTEM DEPENDENCIES
# ========================================================

RUN apt-get update && \
    apt-get install -y \
        --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
        libsm6 \
        libxext6 \
        libxrender1 \
        ffmpeg \
        gcc \
        g++ \
        git \
    && rm -rf /var/lib/apt/lists/*


# ========================================================
# BACKEND PYTHON ENVIRONMENT
# ========================================================

RUN python -m venv ${BACKEND_VENV}

RUN ${BACKEND_VENV}/bin/pip install \
    --upgrade \
    pip \
    setuptools \
    wheel


COPY requirements-backend.txt \
    /tmp/requirements-backend.txt


RUN ${BACKEND_VENV}/bin/pip install \
    --no-cache-dir \
    -r /tmp/requirements-backend.txt


# ========================================================
# PALM MODEL PYTHON ENVIRONMENT
# ========================================================

RUN python -m venv ${PALM_VENV}

RUN ${PALM_VENV}/bin/pip install \
    --upgrade \
    pip \
    setuptools \
    wheel


COPY requirements-palm.txt \
    /tmp/requirements-palm.txt


RUN ${PALM_VENV}/bin/pip install \
    --no-cache-dir \
    --extra-index-url \
    https://download.pytorch.org/whl/cpu \
    -r /tmp/requirements-palm.txt


# ========================================================
# COPY PROJECT
# ========================================================

COPY . /app


# ========================================================
# RUNTIME DIRECTORIES
# ========================================================

RUN mkdir -p \
    /app/app/data/palm_uploads \
    /app/app/static/palm_results


# ========================================================
# FASTAPI PORT
# ========================================================

RUN chmod +x /app/start.sh

EXPOSE 8000

CMD ["/app/start.sh"]