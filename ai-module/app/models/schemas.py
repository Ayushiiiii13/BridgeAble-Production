from pydantic import BaseModel
from typing import Optional, List, Any

class PredictionRequest(BaseModel):
    """Request model for gesture prediction."""
    image: Optional[str] = None  # Base64 encoded image
    landmarks: Optional[List[List[float]]] = None  # Pre-extracted landmarks

class PredictionResponse(BaseModel):
    """Response model for gesture prediction."""
    status: str = "success"
    hand_detected: bool = False
    sign: Optional[str] = None
    confidence: float = 0.0
    text: str = ""
    demo_mode: bool = False

class LandmarkResponse(BaseModel):
    """Response model for hand landmark extraction."""
    status: str
    hand_detected: bool
    num_hands: int
    landmarks: Optional[List[List[float]]] = None

class HealthResponse(BaseModel):
    """Health check response."""
    model_config = {'protected_namespaces': ()}

    status: str
    service: str
    demo_mode: bool
    model_loaded: bool
    supported_signs: List[str]


