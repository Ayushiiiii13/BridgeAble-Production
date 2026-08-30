import argparse
import json
from pathlib import Path
from typing import Any
import cv2
import numpy as np

try:
    import mediapipe as mp
    mp_solutions: Any = getattr(mp, "solutions", None)
    mp_hands = mp_solutions.hands if mp_solutions else None
except ImportError as exc:
    raise SystemExit("MediaPipe is required. Install ai-module requirements first.") from exc


def extract_landmarks_from_image(image_path: Path) -> np.ndarray:
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError(f"Could not read image: {image_path}")

    if mp_hands is None:
        raise ValueError("MediaPipe Hands solution is not available")

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1)
    results = hands.process(rgb)

    if not results.multi_hand_landmarks:
        raise ValueError(f"No hand detected in image: {image_path}")

    landmarks = []
    for hand_landmarks in results.multi_hand_landmarks:
        for lm in hand_landmarks.landmark:
            landmarks.extend([lm.x, lm.y, lm.z])

    return np.asarray(landmarks, dtype=np.float32)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert image folders into MediaPipe landmark npy samples for training.")
    parser.add_argument("--source", required=True, help="Folder containing class folders with images.")
    parser.add_argument("--output", required=True, help="Target folder for saved numpy landmark samples.")
    args = parser.parse_args()

    source_root = Path(args.source)
    output_root = Path(args.output)
    output_root.mkdir(parents=True, exist_ok=True)

    for class_dir in sorted(source_root.iterdir()):
        if not class_dir.is_dir():
            continue

        class_output_dir = output_root / class_dir.name
        class_output_dir.mkdir(parents=True, exist_ok=True)

        for image_path in sorted(class_dir.iterdir()):
            if image_path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
                continue

            try:
                vec = extract_landmarks_from_image(image_path)
            except ValueError:
                continue

            sample_path = class_output_dir / f"{image_path.stem}.npy"
            np.save(sample_path, vec)
            print(f"Saved {sample_path}")

    metadata = {"dataset_dir": str(output_root), "note": "Each sample is a flattened 21-hand-landmark vector."}
    (output_root / "metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Dataset prepared at: {output_root}")


if __name__ == "__main__":
    main()
