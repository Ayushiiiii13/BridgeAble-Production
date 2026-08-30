"""
BridgeAble AI Module — Preprocessing Pipeline
=============================================
Handles:
- Base64 image decoding & validation
- OpenCV BGR to RGB color conversion
- MediaPipe Image encapsulation
- 3D Landmark normalization relative to wrist reference point
"""

import base64
import numpy as np
import cv2
import mediapipe as mp


def decode_base64_image(image_data: str):
    """
    Decodes a base64-encoded image string into an OpenCV RGB NumPy array
    and a MediaPipe mp.Image object.
    
    Returns:
        (image_rgb, mp_image) or (None, None) if decoding fails.
    """
    if not image_data:
        return None, None

    try:
        # Strip data URL prefix if present (e.g. data:image/jpeg;base64,...)
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]

        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, dtype=np.uint8)
        image_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image_bgr is None:
            return None, None

        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

        return image_rgb, mp_image
    except Exception as exc:
        print(f"[Preprocessing] Base64 decode error: {exc}")
        return None, None


def normalize_landmarks(landmarks: list) -> list:
    """
    Normalizes 21 3D hand landmarks by:
    1. Translating wrist (landmark 0) to origin (0, 0, 0)
    2. Scaling by palm size (distance between wrist and middle MCP)
    
    Args:
        landmarks: List of 21 [x, y, z] points
        
    Returns:
        Normalized list of 21 [nx, ny, nz] points
    """
    if not landmarks or len(landmarks) < 21:
        return landmarks

    pts = np.array(landmarks, dtype=np.float32)  # shape (21, 3)
    wrist = pts[0]
    translated = pts - wrist

    # Calculate scale factor using wrist-to-middle-MCP (index 9) distance
    middle_mcp = translated[9]
    scale = np.linalg.norm(middle_mcp)
    if scale < 1e-4:
        scale = 1.0

    normalized = translated / scale
    return normalized.tolist()


def flatten_landmarks(landmarks: list) -> np.ndarray:
    """
    Flattens a list of 21 [x, y, z] points into a 63-element 1D vector
    suitable for dense neural networks or classification models.
    """
    arr = np.array(landmarks, dtype=np.float32)
    return arr.flatten()
