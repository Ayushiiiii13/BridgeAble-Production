#!/usr/bin/env bash
# BridgeAble AI Module — Render Build Script
# Installs system-level OpenGL ES libraries required by MediaPipe on headless Linux,
# then installs Python dependencies.

set -e

echo "=== [BridgeAble AI] Installing system dependencies ==="
apt-get update -y
apt-get install -y \
  libgles2 \
  libgles2-mesa \
  libgl1-mesa-glx \
  libglib2.0-0 \
  libsm6 \
  libxext6 \
  libxrender-dev \
  libgomp1

echo "=== [BridgeAble AI] Installing Python dependencies ==="
pip install --upgrade pip
pip install -r requirements.txt

echo "=== [BridgeAble AI] Build complete ==="
