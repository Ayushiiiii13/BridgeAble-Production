# BridgeAble AI Module — Production Dockerfile
# Uses python:3.11-slim and installs libGLESv2 system deps
# required by MediaPipe GestureRecognizer on headless Linux.

FROM python:3.11-slim

# Install system-level OpenGL ES + supporting libs needed by MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgles2 \
    libgles2-mesa \
    libgl1 \
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
