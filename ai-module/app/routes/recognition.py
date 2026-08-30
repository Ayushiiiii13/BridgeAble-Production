from fastapi import APIRouter, HTTPException
from app.models.schemas import PredictionRequest, PredictionResponse, LandmarkResponse
from app.predictor import predictor

router = APIRouter()


@router.post("/predict-sign", response_model=PredictionResponse)
async def predict_sign(request: PredictionRequest) -> PredictionResponse:
    """
    Primary API endpoint for real-time sign language recognition.
    Accepts webcam frame (base64 string) or 3D landmark array.
    """
    try:
        result = predictor.predict(
            image_data=request.image,
            landmarks=request.landmarks
        )
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict", response_model=PredictionResponse)
async def predict_sign_alias(request: PredictionRequest) -> PredictionResponse:
    """
    Alias endpoint for /predict-sign.
    """
    return await predict_sign(request)


@router.post("/recognize", response_model=PredictionResponse)
async def recognize_sign_alias(request: PredictionRequest) -> PredictionResponse:
    """
    Alias endpoint for /predict-sign.
    """
    return await predict_sign(request)


@router.post("/landmarks", response_model=LandmarkResponse)
async def extract_landmarks(request: PredictionRequest) -> LandmarkResponse:
    """
    Extracts 21 3D hand landmarks from a base64 webcam frame using MediaPipe.
    """
    if not request.image:
        raise HTTPException(status_code=400, detail="Image data is required")

    try:
        result = predictor.extract_landmarks(request.image)
        return LandmarkResponse(
            status=result["status"],
            hand_detected=result["hand_detected"],
            num_hands=result.get("num_hands", 0),
            landmarks=result.get("landmarks")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
