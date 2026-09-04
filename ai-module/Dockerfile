# BridgeAble AI Module — Production Dockerfile
# Uses python:3.11-slim-bullseye (Debian 11) where libgles2-mesa and
# libgl1-mesa-glx exist — these were removed/renamed in Debian Bookworm.

FROM python:3.11-slim-bullseye

# Install system-level OpenGL ES + supporting libs required by MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgles2-mesa \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (layer cache friendly)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Render injects $PORT at runtime; default to 8000 locally
ENV PORT=8000

EXPOSE $PORT

CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
