"""
BridgeAble — Sign Gesture Model Training Pipeline
=================================================
Trains a classifier on collected hand landmark vectors (.npy) or image directories.
Saves the trained model to models/gesture_model.h5 with metadata and label maps.

Usage:
    python train/train_sign_model.py --dataset data/train --epochs 40
"""

import os
import json
import argparse
from pathlib import Path
import numpy as np

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("TensorFlow is required for training. Please install tensorflow in ai-module requirements.")


DEFAULT_MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "gesture_model.h5"
DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_landmark_dataset(data_dir: Path):
    """
    Loads landmark vectors from directory structure:
    data_dir/
      ├── hello/
      │   ├── 001.npy
      │   └── ...
      ├── yes/
      ...
    """
    X = []
    y = []
    label_names = []

    subdirs = [d for d in sorted(data_dir.iterdir()) if d.is_dir()]
    if not subdirs:
        raise ValueError(f"No gesture class folders found in {data_dir}")

    for idx, class_dir in enumerate(subdirs):
        label_names.append(class_dir.name.upper())
        files = list(class_dir.glob("*.npy"))
        for file_path in files:
            try:
                arr = np.load(file_path)
                # Landmark array is (21, 3) -> Flatten to 63
                flat = arr.reshape(-1)
                if flat.shape[0] == 63:
                    X.append(flat)
                    y.append(idx)
            except Exception as e:
                print(f"Skipping corrupted file {file_path}: {e}")

    if not X:
        raise ValueError(f"No valid .npy landmark files found in {data_dir}")

    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int32), label_names


def build_landmark_classifier(input_dim: int, num_classes: int):
    """Builds a multilayer perceptron classifier for 63D landmark vectors."""
    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(128, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(64, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        layers.Dense(32, activation="relu"),
        layers.Dense(num_classes, activation="softmax")
    ])

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    return model


def main():
    if not TF_AVAILABLE:
        print("TensorFlow not installed. Cannot proceed with training.")
        return

    parser = argparse.ArgumentParser(description="Train BridgeAble Sign Language Model")
    parser.add_argument("--dataset", type=str, default=str(DEFAULT_DATA_DIR / "train"), help="Dataset directory")
    parser.add_argument("--val-dataset", type=str, default=str(DEFAULT_DATA_DIR / "validation"), help="Validation directory")
    parser.add_argument("--epochs", type=int, default=40, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--output", type=str, default=str(DEFAULT_MODEL_PATH), help="Output model path (.h5)")
    args = parser.parse_args()

    train_path = Path(args.dataset)
    if not train_path.exists():
        print(f"Dataset path does not exist: {train_path}. Run collection/collect_data.py first!")
        return

    print(f"Loading training data from {train_path}...")
    try:
        X_train, y_train, labels = load_landmark_dataset(train_path)
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return

    print(f"Loaded {len(X_train)} samples across {len(labels)} classes: {labels}")

    val_path = Path(args.val_dataset)
    validation_data = None
    if val_path.exists() and any(val_path.iterdir()):
        try:
            X_val, y_val, _ = load_landmark_dataset(val_path)
            validation_data = (X_val, y_val)
            print(f"Loaded {len(X_val)} validation samples.")
        except Exception as e:
            print(f"Note: No validation set found ({e}), using 20% train split.")
            val_split = 0.2
    else:
        val_split = 0.2

    model = build_landmark_classifier(input_dim=63, num_classes=len(labels))
    model.summary()

    if validation_data:
        history = model.fit(
            X_train, y_train,
            epochs=args.epochs,
            batch_size=args.batch_size,
            validation_data=validation_data,
            verbose=1
        )
    else:
        history = model.fit(
            X_train, y_train,
            epochs=args.epochs,
            batch_size=args.batch_size,
            validation_split=0.2,
            verbose=1
        )

    out_file = Path(args.output)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    model.save(str(out_file))

    # Save metadata JSON
    meta = {
        "classes": labels,
        "input_dim": 63,
        "architecture": "landmark_dense_mlp",
        "sample_count": len(X_train)
    }
    meta_file = out_file.with_suffix(".json")
    meta_file.write_text(json.dumps(meta, indent=2))

    print(f"\n==================================================")
    print(f" Model saved successfully to: {out_file}")
    print(f" Metadata saved to: {meta_file}")
    print(f" Supported classes: {labels}")
    print(f"==================================================\n")


if __name__ == "__main__":
    main()
