import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))
    MODEL_PATH: str = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "gesture_model.h5"))
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

