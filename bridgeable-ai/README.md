# BridgeAble — AI/CV Sign Recognition Module

Standalone Computer Vision + AI/ML module for the BridgeAble accessibility
platform. This module is self-contained and will later be integrated into
the React frontend by the rest of the team.

## Status: Phase 1 — Computer Vision (hand landmark detection)

Phase 1 proves that the webcam + MediaPipe pipeline correctly detects a hand
and extracts 21 landmarks in real time. No AI model is trained yet.

### Folder structure
```
bridgeable-ai/
├── data/
│   ├── raw/            # raw collected landmark sequences (Phase 2)
│   └── processed/       # normalized datasets (Phase 3)
├── collection/
│   └── test_landmarks.py   # Phase 1 script (this phase)
├── preprocessing/       # Phase 3
├── training/             # Phase 4-6
├── model/
│   ├── trained_model/    # saved Keras model (Phase 5)
│   └── tensorflowjs/     # exported web model (Phase 7)
├── inference/            # Phase 8-10 live prediction
├── requirements.txt
└── README.md
```

### Setup (Phase 1 only)

1. Install Python 3.9, 3.10, or 3.11 (MediaPipe does not yet support 3.12+).
2. Create and activate a virtual environment.
3. `pip install -r requirements.txt`
4. `python collection/test_landmarks.py`
5. Press `q` in the video window to quit.

See the full explanation in the chat response for expected behavior and
troubleshooting.
