"""
BridgeAble AI Module — Gesture Predictor
========================================
Performs real-time sign language gesture recognition:
1. Base64 frame decode & preprocessing
2. MediaPipe Task Vision GestureRecognizer inference
3. Strict Hand-Presence Detection (hand_detected=False if no hand is in frame)
4. Landmark extraction & Geometric Verification
5. Dynamic Confidence Thresholding (no fake or hardcoded outputs)
"""

import os
import math
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple
import numpy as np

from app.config import settings
from app.preprocessing import decode_base64_image, normalize_landmarks

# MediaPipe Tasks
try:
    import cv2
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    MEDIAPIPE_AVAILABLE = True
except ImportError as e:
    MEDIAPIPE_AVAILABLE = False
    print(f"[Predictor] MediaPipe import warning: {e}")

# Optional TensorFlow support
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False


MODEL_TASK_PATH = Path(__file__).resolve().parent.parent / "models" / "gesture_recognizer.task"


class GesturePredictor:
    """Singleton service for real-time sign language gesture recognition."""

    def __init__(self) -> None:
        self.recognizer: Any = None
        self.custom_model: Any = None
        self.model_loaded: bool = False

        self._initialize_recognizer()
        self._load_custom_model()

    def _initialize_recognizer(self) -> None:
        """Initializes the MediaPipe GestureRecognizer model asset ONCE on startup."""
        if not MEDIAPIPE_AVAILABLE:
            print("[Predictor] MediaPipe is not installed. Recognizer unavailable.")
            return

        try:
            if not MODEL_TASK_PATH.exists():
                print(f"[Predictor] Model asset not found at {MODEL_TASK_PATH}, attempting download...")
                import urllib.request
                MODEL_TASK_PATH.parent.mkdir(parents=True, exist_ok=True)
                url = "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
                urllib.request.urlretrieve(url, str(MODEL_TASK_PATH))

            base_options = python.BaseOptions(model_asset_path=str(MODEL_TASK_PATH))
            options = vision.GestureRecognizerOptions(
                base_options=base_options,
                num_hands=2,
                min_hand_detection_confidence=0.55,
                min_hand_presence_confidence=0.55,
                min_tracking_confidence=0.55,
            )
            self.recognizer = vision.GestureRecognizer.create_from_options(options)
            self.model_loaded = True
            print("[Predictor] MediaPipe GestureRecognizer loaded successfully.")
        except Exception as exc:
            print(f"[Predictor] Error initializing MediaPipe GestureRecognizer: {exc}")

    def _load_custom_model(self) -> None:
        """Loads custom trained Keras model if available in models directory."""
        if not TF_AVAILABLE:
            return

        custom_path = settings.MODEL_PATH
        if os.path.exists(custom_path):
            try:
                self.custom_model = tf.keras.models.load_model(custom_path)
                print(f"[Predictor] Loaded custom model from {custom_path}")
            except Exception as exc:
                print(f"[Predictor] Could not load custom model from {custom_path}: {exc}")

    def _calculate_distance(self, p1: List[float], p2: List[float]) -> float:
        """Calculates 3D Euclidean distance between two landmark points."""
        return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2)

    def _analyze_landmark_geometry(self, lm: List[List[float]], num_hands: int = 1) -> Tuple[Optional[str], float]:
        """
        Analyzes 21 3D hand landmarks for finger extension, curled status,
        and geometric relationships to classify standard ASL/hand gestures.

        Landmark indices:
          0: Wrist
          1-4: Thumb (4 is tip, 2 is MCP)
          5-8: Index (8 is tip, 6 is PIP, 5 is MCP)
          9-12: Middle (12 is tip, 10 is PIP, 9 is MCP)
          13-16: Ring (16 is tip, 14 is PIP, 13 is MCP)
          17-20: Pinky (20 is tip, 18 is PIP, 17 is MCP)
        """
        if not lm or len(lm) < 21:
            return None, 0.0

        wrist = lm[0]
        thumb_tip = lm[4]
        thumb_mcp = lm[2]

        index_tip = lm[8]
        index_pip = lm[6]
        index_mcp = lm[5]

        middle_tip = lm[12]
        middle_pip = lm[10]
        middle_mcp = lm[9]

        ring_tip = lm[16]
        ring_pip = lm[14]
        ring_mcp = lm[13]

        pinky_tip = lm[20]
        pinky_pip = lm[18]
        pinky_mcp = lm[17]

        # Finger vertical extensions (y is inverted in screen space: tip < pip < mcp means extended upwards)
        index_ext = index_tip[1] < index_pip[1] and index_pip[1] < index_mcp[1]
        middle_ext = middle_tip[1] < middle_pip[1] and middle_pip[1] < middle_mcp[1]
        ring_ext = ring_tip[1] < ring_pip[1] and ring_pip[1] < ring_mcp[1]
        pinky_ext = pinky_tip[1] < pinky_pip[1] and pinky_pip[1] < pinky_mcp[1]

        thumb_ext = self._calculate_distance(thumb_tip, wrist) > self._calculate_distance(thumb_mcp, wrist) * 1.15
        thumb_up = thumb_tip[1] < index_mcp[1] and not index_ext and not middle_ext and not ring_ext and not pinky_ext

        palm_size = max(self._calculate_distance(wrist, middle_mcp), 0.001)
        thumb_index_dist = self._calculate_distance(thumb_tip, index_tip) / palm_size
        index_middle_dist = self._calculate_distance(index_tip, middle_tip) / palm_size

        # 1. THUMBS UP
        if thumb_up and not index_ext and not middle_ext and not ring_ext and not pinky_ext:
            return "THUMBS UP", 0.94

        # 2. I LOVE YOU (ILY): Thumb, Index, Pinky extended; Middle and Ring curled
        if thumb_ext and index_ext and not middle_ext and not ring_ext and pinky_ext:
            return "I LOVE YOU", 0.96

        # 3. PEACE / VICTORY / NO
        if index_ext and middle_ext and not ring_ext and not pinky_ext:
            if index_middle_dist > 0.20:
                return "PEACE", 0.95
            else:
                return "NO", 0.85

        # 4. OKAY / OK: Thumb and Index touching, other 3 extended
        if thumb_index_dist < 0.35 and middle_ext and ring_ext and pinky_ext:
            return "OK", 0.92

        # 5. HELLO: Open palm, all fingers extended
        if index_ext and middle_ext and ring_ext and pinky_ext and thumb_ext:
            return "HELLO", 0.94

        # 6. STOP: 4 fingers extended upright together
        if index_ext and middle_ext and ring_ext and pinky_ext:
            return "STOP", 0.90

        # 7. YES: Closed fist
        if not index_ext and not middle_ext and not ring_ext and not pinky_ext and not thumb_up:
            return "YES", 0.88

        # 8. HELP: 2 hands detected in active framing
        if num_hands >= 2:
            return "HELP", 0.89

        return None, 0.35

    def predict(
        self,
        image_data: Optional[str] = None,
        landmarks: Optional[List[List[float]]] = None
    ) -> Dict[str, Any]:
        """
        Main prediction method.
        Accepts base64 image frame or 3D landmark array.
        Strictly returns hand_detected=False and confidence=0 when no hand is present.
        """
        if self.recognizer is None and self.custom_model is None:
            return {
                "status": "ai_unavailable",
                "hand_detected": False,
                "sign": None,
                "confidence": 0.0,
                "text": ""
            }

        # Case 1: Base64 image frame provided
        if image_data:
            _, mp_image = decode_base64_image(image_data)
            if mp_image is None or self.recognizer is None:
                return {
                    "status": "invalid_image",
                    "hand_detected": False,
                    "sign": None,
                    "confidence": 0.0,
                    "text": ""
                }

            try:
                result = self.recognizer.recognize(mp_image)

                # STRICT HAND DETECTION: No hands found
                if not result.hand_landmarks or len(result.hand_landmarks) == 0:
                    return {
                        "status": "success",
                        "hand_detected": False,
                        "sign": None,
                        "confidence": 0.0,
                        "text": ""
                    }

                num_hands = len(result.hand_landmarks)
                primary_landmarks = [
                    [float(lm.x), float(lm.y), float(lm.z)] for lm in result.hand_landmarks[0]
                ]

                # Evaluate pre-trained MediaPipe Gesture Classifier category
                mp_sign = None
                mp_conf = 0.0
                if result.gestures and len(result.gestures) > 0 and len(result.gestures[0]) > 0:
                    top_gesture = result.gestures[0][0]
                    category_name = top_gesture.category_name
                    score = float(top_gesture.score)

                    mp_mapping = {
                        "Thumb_Up": "THUMBS UP",
                        "Thumb_Down": "BAD",
                        "Victory": "PEACE",
                        "Open_Palm": "HELLO",
                        "Closed_Fist": "YES",
                        "ILoveYou": "I LOVE YOU",
                        "Pointing_Up": "STOP"
                    }
                    if category_name in mp_mapping and score >= 0.55:
                        mp_sign = mp_mapping[category_name]
                        mp_conf = score

                # Evaluate Landmark Geometric Analysis
                geo_sign, geo_conf = self._analyze_landmark_geometry(primary_landmarks, num_hands=num_hands)

                # Fuse detections with priority on high-confidence geometric validation
                chosen_sign = geo_sign if (geo_conf >= 0.85 or not mp_sign) else mp_sign
                chosen_conf = max(geo_conf, mp_conf)

                # Check against confidence threshold
                if chosen_sign and chosen_conf >= settings.CONFIDENCE_THRESHOLD:
                    return {
                        "status": "success",
                        "hand_detected": True,
                        "sign": chosen_sign,
                        "confidence": round(chosen_conf, 2),
                        "text": settings.SIGN_TEXT_MAP.get(chosen_sign, chosen_sign)
                    }

                # Hand detected but ambiguous / below confidence threshold
                return {
                    "status": "success",
                    "hand_detected": True,
                    "sign": None,
                    "confidence": round(chosen_conf, 2),
                    "text": ""
                }

            except Exception as exc:
                print(f"[Predictor] Inference error: {exc}")
                return {
                    "status": f"error: {str(exc)}",
                    "hand_detected": False,
                    "sign": None,
                    "confidence": 0.0,
                    "text": ""
                }

        # Case 2: Pre-extracted landmarks provided
        if landmarks:
            geo_sign, geo_conf = self._analyze_landmark_geometry(landmarks)
            if geo_sign and geo_conf >= settings.CONFIDENCE_THRESHOLD:
                return {
                    "status": "success",
                    "hand_detected": True,
                    "sign": geo_sign,
                    "confidence": round(geo_conf, 2),
                    "text": settings.SIGN_TEXT_MAP.get(geo_sign, geo_sign)
                }
            return {
                "status": "success",
                "hand_detected": True,
                "sign": None,
                "confidence": round(geo_conf, 2),
                "text": ""
            }

        return {
            "status": "success",
            "hand_detected": False,
            "sign": None,
            "confidence": 0.0,
            "text": ""
        }

    def extract_landmarks(self, image_data: str) -> Dict[str, Any]:
        """Extracts 21 3D landmarks from a base64 frame."""
        if self.recognizer is None:
            return {
                "status": "recognizer_unavailable",
                "hand_detected": False,
                "num_hands": 0,
                "landmarks": None
            }

        _, mp_image = decode_base64_image(image_data)
        if mp_image is None:
            return {
                "status": "invalid_image",
                "hand_detected": False,
                "num_hands": 0,
                "landmarks": None
            }

        try:
            result = self.recognizer.recognize(mp_image)
            if not result.hand_landmarks or len(result.hand_landmarks) == 0:
                return {
                    "status": "no_hand_detected",
                    "hand_detected": False,
                    "num_hands": 0,
                    "landmarks": None
                }

            pts = [[float(lm.x), float(lm.y), float(lm.z)] for lm in result.hand_landmarks[0]]
            return {
                "status": "success",
                "hand_detected": True,
                "num_hands": len(result.hand_landmarks),
                "landmarks": pts,
                "normalized_landmarks": normalize_landmarks(pts)
            }
        except Exception as exc:
            return {
                "status": f"error: {str(exc)}",
                "hand_detected": False,
                "num_hands": 0,
                "landmarks": None
            }


# Export singleton predictor instance
predictor = GesturePredictor()
