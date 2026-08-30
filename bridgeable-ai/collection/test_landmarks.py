"""
BridgeAble - Phase 1: Computer Vision Module
=============================================
Purpose:
    - Open the webcam
    - Detect a hand using MediaPipe
    - Extract all 21 hand landmarks (x, y, z)
    - Draw the landmarks + skeleton on the live video feed
    - Print the landmark dictionary to the terminal so you can
      confirm the data shape is correct

This file does NOT do any training or prediction yet.
It only proves that Computer Vision (Phase 1) is working correctly.

Run with:
    python collection/test_landmarks.py

Press 'q' to quit the window.
"""

import cv2
import mediapipe as mp
import json

# ----------------------------------------------------------------
# 1. Set up MediaPipe Hands
# ----------------------------------------------------------------
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# static_image_mode=False -> optimized for video/webcam streams
# max_num_hands=1         -> Phase 1 requirement: support one hand
# min_detection_confidence / min_tracking_confidence -> reliability thresholds
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6,
)


def extract_landmarks(hand_landmarks):
    """
    Converts MediaPipe's hand landmark object into the exact
    output format required by the project:

    {
        "landmarks": [
            [x, y, z],
            [x, y, z],
            ... (21 total)
        ]
    }

    x, y are normalized 0.0-1.0 relative to the image width/height.
    z is relative depth (smaller = closer to camera), also roughly
    normalized by MediaPipe.
    """
    landmark_list = []
    for lm in hand_landmarks.landmark:
        landmark_list.append([lm.x, lm.y, lm.z])

    return {"landmarks": landmark_list}


def main():
    cap = cv2.VideoCapture(0)  # 0 = default webcam

    if not cap.isOpened():
        print("ERROR: Could not open webcam. Check that it is connected "
              "and not being used by another application.")
        return

    print("Webcam opened successfully.")
    print("Show your hand to the camera. Press 'q' in the video window to quit.\n")

    frame_count = 0

    while True:
        success, frame = cap.read()
        if not success:
            print("ERROR: Failed to read frame from webcam.")
            break

        # Mirror the frame so movement feels natural (like a mirror)
        frame = cv2.flip(frame, 1)

        # MediaPipe expects RGB, OpenCV gives BGR -> convert
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Run hand detection
        results = hands.process(rgb_frame)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw the 21 landmark points + connecting skeleton lines
                mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style(),
                )

                # Build the required JSON-style output
                output = extract_landmarks(hand_landmarks)

                # Print every 15 frames so the terminal doesn't flood
                frame_count += 1
                if frame_count % 15 == 0:
                    num_points = len(output["landmarks"])
                    print(f"Detected {num_points} landmarks. "
                          f"First landmark (wrist): {output['landmarks'][0]}")
                    # Uncomment the next line if you want to see the full JSON:
                    # print(json.dumps(output, indent=2))

                # Show a confirmation label on screen
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

        # Press 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    hands.close()
    print("\nWebcam closed. Phase 1 test finished.")


if __name__ == "__main__":
    main()
