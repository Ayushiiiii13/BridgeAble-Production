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
    # Startup: MediaPipe and models already loaded once into predictor singleton
    print("[BridgeAble AI] Service initialized and ready to receive gesture recognition frames.")
    yield
    # Shutdown
    if predictor.recognizer:
        predictor.recognizer.close()
        print("[BridgeAble AI] MediaPipe recognizer closed.")


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
    return {
        "service": "BridgeAble AI Module",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "model_loaded": predictor.model_loaded,
        "supported_signs": settings.SIGN_VOCABULARY
    }
