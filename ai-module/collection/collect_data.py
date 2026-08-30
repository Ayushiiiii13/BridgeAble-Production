"""
BridgeAble — Interactive Sign Language Data Collection Tool
============================================================
Allows collecting training and validation dataset samples for new/extended gestures.

Workflow:
1. Prompts for gesture name (e.g., 'thank_you', 'please', 'help', 'good_morning')
2. Opens webcam with visual bounding box ROI and hand landmark overlay
3. Press 'c' to start automatic capture sequence (e.g. 50-100 frames)
4. Saves images & 21-landmark numpy coordinate vectors into:
   - data/train/<gesture_name>/
   - data/validation/<gesture_name>/ (20% split)
5. Automatically increments frame index — no manual renaming needed!
6. Press 'n' to enter a new gesture or 'q' to exit.

Usage:
    python collection/collect_data.py
    python collection/collect_data.py --samples 60 --val-split 0.2
"""

import os
import cv2
import time
import argparse
from typing import Any, Optional
import numpy as np
from pathlib import Path
import mediapipe as mp

mp_solutions: Any = getattr(mp, "solutions", None)
mp_hands = mp_solutions.hands if mp_solutions else None
mp_drawing = mp_solutions.drawing_utils if mp_solutions else None
mp_drawing_styles = mp_solutions.drawing_styles if mp_solutions else None


def extract_landmarks(hand_landmarks: Any) -> np.ndarray:
    """Extracts 21 3D coordinates (x, y, z)."""
    coords = []
    for lm in hand_landmarks.landmark:
        coords.append([lm.x, lm.y, lm.z])
    return np.array(coords, dtype=np.float32)


def collect_gesture_samples(gesture_name: str, num_samples: int = 60, val_split: float = 0.2, data_dir: str = "data") -> None:
    sanitized_name = gesture_name.strip().lower().replace(" ", "_")
    if not sanitized_name:
        print("Invalid gesture name.")
        return

    train_dir = Path(data_dir) / "train" / sanitized_name
    val_dir = Path(data_dir) / "validation" / sanitized_name
    train_dir.mkdir(parents=True, exist_ok=True)
    val_dir.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Could not open webcam.")
        return

    if mp_hands is None:
        print("ERROR: MediaPipe hands solution not available.")
        return

    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.6,
        min_tracking_confidence=0.6
    )

    print(f"\n==================================================")
    print(f" Ready to collect data for gesture: '{sanitized_name}'")
    print(f" Target samples: {num_samples} ({int(num_samples * (1 - val_split))} train, {int(num_samples * val_split)} val)")
    print(f" Controls in video window:")
    print(f"   [SPACE] or [c] : Start / Pause automatic recording")
    print(f"   [q]           : Finish collecting this gesture")
    print(f"==================================================\n")

    captured_count = 0
    is_recording = False
    last_capture_time = time.time()
    capture_interval = 0.12  # ~8 frames per second to allow natural hand variation

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to read from webcam.")
            break

        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        # Draw ROI guide box in center
        roi_x1, roi_y1 = int(w * 0.25), int(h * 0.15)
        roi_x2, roi_y2 = int(w * 0.75), int(h * 0.85)
        box_color = (0, 255, 0) if results.multi_hand_landmarks else (0, 165, 255)
        cv2.rectangle(frame, (roi_x1, roi_y1), (roi_x2, roi_y2), box_color, 2)

        hand_detected = False
        current_landmarks: Optional[np.ndarray] = None

        if results.multi_hand_landmarks:
            hand_detected = True
            hand_landmarks = results.multi_hand_landmarks[0]
            current_landmarks = extract_landmarks(hand_landmarks)

            # Draw skeleton
            if mp_drawing and mp_drawing_styles:
                mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style()
                )

        # Handle recording trigger
        now = time.time()
        if is_recording and hand_detected and (now - last_capture_time >= capture_interval) and (current_landmarks is not None):
            last_capture_time = now
            captured_count += 1

            # Decide train vs val split
            is_val = (captured_count % int(1 / val_split) == 0) if val_split > 0 else False
            target_folder = val_dir if is_val else train_dir

            timestamp = int(time.time() * 1000)
            img_filename = f"{sanitized_name}_{timestamp}_{captured_count:04d}.jpg"
            npy_filename = f"{sanitized_name}_{timestamp}_{captured_count:04d}.npy"

            # Save ROI cropped hand image
            hand_crop = frame[roi_y1:roi_y2, roi_x1:roi_x2]
            if hand_crop.size > 0:
                cv2.imwrite(str(target_folder / img_filename), hand_crop)

            # Save 3D landmark array
            np.save(str(target_folder / npy_filename), current_landmarks)

            if captured_count >= num_samples:
                print(f"[Done] Reached target {num_samples} samples for '{sanitized_name}'!")
                is_recording = False

        # Visual UI Overlay on frame
        status_text = f"RECORDING ({captured_count}/{num_samples})" if is_recording else "PAUSED (Press 'c' to record)"
        status_color = (0, 255, 0) if is_recording else (0, 200, 255)
        cv2.putText(frame, f"Gesture: {sanitized_name}", (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(frame, status_text, (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
        cv2.putText(frame, "Hold hand inside ROI box. Slightly move/rotate hand for variation.", (20, h - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (220, 220, 220), 1)

        cv2.imshow("BridgeAble Data Collection", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key in [ord('c'), ord(' ')]:
            is_recording = not is_recording
            print(f"[{'RECORDING' if is_recording else 'PAUSED'}]")

    cap.release()
    cv2.destroyAllWindows()
    hands.close()
    print(f"Finished collecting {captured_count} samples for '{sanitized_name}'.")


def main() -> None:
    parser = argparse.ArgumentParser(description="BridgeAble Sign Language Data Collection")
    parser.add_argument("--gesture", type=str, default="", help="Gesture name to collect")
    parser.add_argument("--samples", type=int, default=60, help="Number of samples to collect per gesture")
    parser.add_argument("--val-split", type=float, default=0.2, help="Fraction for validation split (e.g. 0.2)")
    parser.add_argument("--data-dir", type=str, default="data", help="Root data directory")
    args = parser.parse_args()

    if args.gesture:
        collect_gesture_samples(args.gesture, args.samples, args.val_split, args.data_dir)
    else:
        while True:
            gesture_input = input("\nEnter gesture name to record (or 'q' to quit): ").strip()
            if not gesture_input or gesture_input.lower() == 'q':
                break
            collect_gesture_samples(gesture_input, args.samples, args.val_split, args.data_dir)


if __name__ == "__main__":
    main()
