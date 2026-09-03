#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Starting Render Build Process..."

# Since the Render Root Directory is 'ai-module', 
# $PWD will be /opt/render/project/src/ai-module
SERVICE_ROOT="$PWD"
DEPS_DIR="$SERVICE_ROOT/.local"

echo "Creating local dependency directories at $DEPS_DIR..."
mkdir -p "$DEPS_DIR/deb"
mkdir -p "$DEPS_DIR/lib"

# Move to the deb directory to download packages
cd "$DEPS_DIR/deb"

echo "Updating apt cache..."
# We ignore apt-get update failures since non-root might fail, but base image caches usually suffice
apt-get update -y || echo "apt-get update failed or was restricted, proceeding with existing package lists..."

echo "Downloading required apt packages for MediaPipe/OpenCV..."
# Using apt-get download allows us to fetch packages without sudo.
# We do NOT ignore errors here; if this fails, the build should fail clearly.
apt-get download libgl1 libglib2.0-0 libsm6 libxrender1 libxext6 libgles2 libglvnd0

echo "Extracting packages..."
# Extract the shared libraries into our local directory
for f in *.deb; do
    if [ -f "$f" ]; then
        echo "Extracting $f..."
        dpkg -x "$f" "$DEPS_DIR/extracted"
    fi
done

echo "Moving shared libraries to $DEPS_DIR/lib..."
# Move all .so files to our local lib directory
if [ -d "$DEPS_DIR/extracted/usr/lib" ]; then
    find "$DEPS_DIR/extracted/usr/lib" -type f -name "*.so*" -exec cp {} "$DEPS_DIR/lib/" \;
    find "$DEPS_DIR/extracted/usr/lib" -type l -name "*.so*" -exec cp -d {} "$DEPS_DIR/lib/" \;
else
    echo "ERROR: Could not find /usr/lib in extracted deb packages!"
    exit 1
fi

# Clean up temporary deb files to save space
rm -rf "$DEPS_DIR/deb" "$DEPS_DIR/extracted"

echo "System libraries successfully installed in $DEPS_DIR/lib"

# Return to the service root directory (ai-module)
cd "$SERVICE_ROOT"

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Build complete!"
echo "=========================================================="
echo "ACTION REQUIRED: Set the following Render Environment Variable:"
echo "LD_LIBRARY_PATH=/opt/render/project/src/ai-module/.local/lib:\$LD_LIBRARY_PATH"
echo "=========================================================="
