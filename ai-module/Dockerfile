# BridgeAble AI Module — Production Dockerfile
# Uses python:3.11-slim-bullseye (Debian 11) where MediaPipe GL/EGL deps exist.

FROM python:3.11-slim-bullseye

# Install all system-level libs required by MediaPipe GestureRecognizer:
#   libgles2-mesa  → provides libGLESv2.so.2
#   libegl1-mesa   → provides libEGL.so.1
#   libgl1-mesa-glx → provides libGL.so.1
#   libglib2.0-0, libsm6, libxext6, libxrender1, libgomp1 → OpenCV / TF deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgles2-mesa \
    libegl1-mesa \
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

EXPOSE 8000

# Use sh -c so $PORT is always expanded from Render's runtime environment
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
