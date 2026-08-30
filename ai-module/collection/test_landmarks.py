"""
BridgeAble - Phase 1: Computer Vision Module
===========================================
Purpose:
    - Open the webcam
    - Detect a hand using MediaPipe
    - Extract all 21 hand landmarks (x, y, z)
    - Draw the landmarks and skeleton on the live stream
    - Print landmark summaries to confirm the data shape

This script is a verification tool for the Phase 1 prototype.
It does not train or predict sign language; it only proves the
hand-tracking pipeline is functioning.

Run with:
    python collection/test_landmarks.py

Press 'q' to quit the window.
"""

from typing import Any, Dict, List
import cv2
import mediapipe as mp

mp_solutions: Any = getattr(mp, "solutions", None)
mp_hands = mp_solutions.hands if mp_solutions else None
mp_drawing = mp_solutions.drawing_utils if mp_solutions else None
mp_drawing_styles = mp_solutions.drawing_styles if mp_solutions else None


def extract_landmarks(hand_landmarks: Any) -> Dict[str, List[List[float]]]:
    """Return a compact landmark dictionary for downstream processing."""
    landmark_list: List[List[float]] = []
    for point in hand_landmarks.landmark:
        landmark_list.append([float(point.x), float(point.y), float(point.z)])
    return {"landmarks": landmark_list}


def main() -> None:
    if mp_hands is None:
        print("ERROR: MediaPipe Hands solution is not available.")
        return

    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.6,
        min_tracking_confidence=0.6,
    )

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("ERROR: Could not open webcam. Check that it is connected and not in use by another app.")
        return

    print("Webcam opened successfully.")
    print("Show your hand to the camera. Press 'q' to quit.\n")

    frame_count = 0

    while True:
        success, frame = cap.read()
        if not success:
            print("ERROR: Failed to read frame from webcam.")
            break

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                if mp_drawing and mp_drawing_styles:
                    mp_drawing.draw_landmarks(
                        frame,
                        hand_landmarks,
                        mp_hands.HAND_CONNECTIONS,
                        mp_drawing_styles.get_default_hand_landmarks_style(),
                        mp_drawing_styles.get_default_hand_connections_style(),
                    )

                output = extract_landmarks(hand_landmarks)
                frame_count += 1
                if frame_count % 15 == 0:
                    print(
                        f"Detected {len(output['landmarks'])} landmarks. "
                        f"First landmark (wrist): {output['landmarks'][0]}"
                    )

                cv2.putText(
                    frame,
                    f"Landmarks detected: {len(hand_landmarks.landmark)}",
                    (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 0),
                    2,
                )
        else:
            cv2.putText(
                frame,
                "No hand detected",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 0, 255),
                2,
            )

        cv2.imshow("BridgeAble - Phase 1: Hand Landmark Detection", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    hands.close()
    print("\nWebcam closed. Phase 1 test finished.")


if __name__ == "__main__":
    main()
