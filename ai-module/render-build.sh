#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Starting Render Build Process..."

# Directory to install apt dependencies without sudo
DEPS_DIR="$HOME/.local"
mkdir -p "$DEPS_DIR/deb"
mkdir -p "$DEPS_DIR/lib"
cd "$DEPS_DIR/deb"

echo "Downloading required apt packages for MediaPipe/OpenCV..."
# Using apt-get download allows us to fetch packages without sudo
apt-get update -y || true

# Download the required libraries
apt-get download libgl1 libglib2.0-0 libsm6 libxrender1 libxext6 libgles2 libglvnd0 || true

echo "Extracting packages..."
# Extract the shared libraries into our local directory
for f in *.deb; do
    if [ -f "$f" ]; then
        dpkg -x "$f" "$DEPS_DIR/extracted"
    fi
done

# Move all .so files to our local lib directory
if [ -d "$DEPS_DIR/extracted/usr/lib" ]; then
    find "$DEPS_DIR/extracted/usr/lib" -type f -name "*.so*" -exec cp {} "$DEPS_DIR/lib/" \;
    find "$DEPS_DIR/extracted/usr/lib" -type l -name "*.so*" -exec cp -d {} "$DEPS_DIR/lib/" \;
fi

# Clean up
rm -rf "$DEPS_DIR/deb" "$DEPS_DIR/extracted"

echo "Libraries installed in $DEPS_DIR/lib"

# Return to the project root (ai-module)
cd /opt/render/project/src/ai-module || cd "$HOME/project/src/ai-module" || cd "$(dirname "$0")"

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Build complete! Make sure to set LD_LIBRARY_PATH in your Render environment variables:"
echo "LD_LIBRARY_PATH=\$HOME/.local/lib:\$LD_LIBRARY_PATH"
