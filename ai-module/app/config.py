import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
REPO_DIR = BASE_DIR.parent


def resolve_model_path() -> Path:
    """
    Robustly resolves the model path across development and production (Windows & Linux).
    1. Checks environment variable MODEL_PATH (handles relative paths by resolving against BASE_DIR and REPO_DIR).
    2. Searches known candidate locations for gesture_recognizer.task.
    3. Searches for custom .h5 / .keras models.
    4. Falls back to BASE_DIR / 'models' / 'gesture_recognizer.task'.
    """
    env_path = os.getenv("MODEL_PATH")
    if env_path and env_path.strip():
        clean_path = env_path.strip().strip("'\"")
        p = Path(clean_path)
        if p.is_absolute() and p.exists():
            return p
        # Check relative to BASE_DIR (ai-module/)
        if (BASE_DIR / p).exists():
            return (BASE_DIR / p).resolve()
        # Check relative to REPO_DIR (project root)
        if (REPO_DIR / p).exists():
            return (REPO_DIR / p).resolve()
        # Check relative to current working directory
        if p.exists():
            return p.resolve()

    # Search known candidate locations for gesture_recognizer.task
    candidates = [
        BASE_DIR / "models" / "gesture_recognizer.task",
        REPO_DIR / "ai-module" / "models" / "gesture_recognizer.task",
        REPO_DIR / "models" / "gesture_recognizer.task",
        Path.cwd() / "models" / "gesture_recognizer.task",
        Path.cwd() / "ai-module" / "models" / "gesture_recognizer.task",
        # Fallback to custom trained models if present
        BASE_DIR / "models" / "gesture_model.h5",
        BASE_DIR / "models" / "gesture_model.keras",
    ]
    for candidate in candidates:
        if candidate.exists() and candidate.is_file() and candidate.stat().st_size > 0:
            return candidate.resolve()

    # Default canonical location inside ai-module/models/
    return (BASE_DIR / "models" / "gesture_recognizer.task").resolve()


class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))
    MODEL_PATH: str = str(resolve_model_path())
    DEMO_MODE: bool = False
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.70"))

    # Predefined recognized gestures supported by geometric and landmark analysis
    SIGN_VOCABULARY = [
        "HELLO", "YES", "NO", "THANK YOU",
        "HELP", "STOP", "THUMBS UP", "PEACE", "OK", "I LOVE YOU"
    ]

    SIGN_TEXT_MAP = {
        "HELLO": "Hello",
        "YES": "Yes",
        "NO": "No",
        "THANK YOU": "Thank you",
        "HELP": "Help",
        "STOP": "Stop",
        "THUMBS UP": "Good / Approved",
        "PEACE": "Peace",
        "OK": "Okay / All good",
        "I LOVE YOU": "I love you"
    }

settings = Settings()

