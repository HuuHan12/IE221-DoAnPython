from fastapi import APIRouter, UploadFile, File, HTTPException

from app.database.database import save_prediction

router = APIRouter()

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/predict")
async def predict(image: UploadFile = File(...)):

    # Validate file type
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed."
        )

    # Read image
    image_data = await image.read()

    # Get file size in bytes
    size_bytes = len(image_data)

    # Validate file size
    if size_bytes > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image size must not exceed 10 MB."
        )

    # TODO: Replace with real AI model
    landmark = "Vinh Ha Long"
    confidence = 0.94

    # Save to database
    prediction_id = save_prediction(
        filename=image.filename,
        content_type=image.content_type,
        size_bytes=size_bytes,
        landmark=landmark,
        confidence=confidence
    )

    # Convert to MB only for response
    size_mb = size_bytes / (1024 * 1024)

    return {
        "id": prediction_id,
        "filename": image.filename,
        "content_type": image.content_type,
        "size": f"{size_mb:.2f} MB",
        "landmark": landmark,
        "confidence": confidence
    }