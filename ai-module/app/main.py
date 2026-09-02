"""
BridgeAble AI Module — Real-Time Sign Language Gesture Recognition Service
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes.recognition import router as recognition_router
from app.models.schemas import HealthResponse
from app.predictor import predictor


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Log model resolution and loading status
    print("=" * 60)
    print(f"[BridgeAble AI] Model Path Resolved: '{predictor.model_path}'")
    print(f"[BridgeAble AI] Model Loaded: {predictor.model_loaded} (type: {predictor.model_type})")
    if not predictor.model_loaded:
        print(f"[BridgeAble AI] WARNING: Model is not loaded. Reason: {predictor.load_error}")
    else:
        print("[BridgeAble AI] Service initialized and ready to receive gesture recognition frames.")
    print("=" * 60)
    yield
    # Shutdown
    if predictor.recognizer:
        try:
            predictor.recognizer.close()
            print("[BridgeAble AI] MediaPipe recognizer closed.")
        except Exception as e:
            print(f"[BridgeAble AI] Error closing recognizer: {e}")


app = FastAPI(
    title="BridgeAble AI Module",
    description="Real-Time Sign Language Recognition Service using MediaPipe and Machine Learning",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(recognition_router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint indicating AI status and loaded models."""
    return HealthResponse(
        status="ok",
        service="BridgeAble AI Module",
        demo_mode=False,
        model_loaded=predictor.model_loaded,
        supported_signs=settings.SIGN_VOCABULARY
    )


@app.get("/")
async def root():
    resp = {
        "service": "BridgeAble AI Module",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "model_loaded": predictor.model_loaded,
        "model_type": predictor.model_type,
        "model_path": predictor.model_path,
        "supported_signs": settings.SIGN_VOCABULARY
    }
    if not predictor.model_loaded and predictor.load_error:
        resp["load_error"] = predictor.load_error
    return resp
