"""
BridgeAble AI Module — Gesture Service Adapter
==============================================
Provides backward compatibility with app.services.gesture_service
by delegating to app.predictor.GesturePredictor and app.preprocessing.
"""

from app.predictor import predictor, GesturePredictor
from app.preprocessing import decode_base64_image, normalize_landmarks, flatten_landmarks

# Alias GestureService to GesturePredictor
GestureService = GesturePredictor

# Singleton instance
gesture_service = predictor

__all__ = [
    "GestureService",
    "gesture_service",
    "predictor",
    "decode_base64_image",
    "normalize_landmarks",
    "flatten_landmarks",
]
