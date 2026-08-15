import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.database.database import save_prediction
from app.utils.geoclip import predict_image


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

    # ==========================================
    # 2. Read image
    # ==========================================

    image_data = await image.read()

    size_bytes = len(image_data)

    # Validate file size
    if size_bytes > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image size must not exceed 10 MB."
        )

    if size_bytes == 0:
        raise HTTPException(
            status_code=400,
            detail="Image file is empty."
        )


    # Create temporary file to store the uploaded image
    suffix = Path(image.filename or "").suffix.lower()

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_file.write(image_data)
            temp_path = temp_file.name

        # AI prediction
        predictions = predict_image(
            temp_path,
            top_k=5
        )

        if not predictions:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy địa danh phù hợp."
            )

        # Get best prediction (top 1)
        best_prediction = predictions[0]

        landmark = best_prediction.get(
            "name",
            "Unknown"
        )

        prob_percent = float(
            best_prediction.get(
                "prob_percent",
                0
            )
        )

        # Database save confidence 0 -> 1
        confidence = prob_percent / 100

        # Save data to database
        prediction_id = save_prediction(
            filename=image.filename,
            content_type=image.content_type,
            size_bytes=size_bytes,
            landmark=landmark,
            confidence=confidence
        )

        size_mb = size_bytes / (1024 * 1024)

        return {
            "id": prediction_id,
            "filename": image.filename,
            "content_type": image.content_type,

            "size_bytes": size_bytes,
            "size": f"{size_mb:.2f} MB",

            "landmark": landmark,
            "confidence": confidence,

            "prediction": best_prediction,

            "predictions": predictions
        }

    except HTTPException:
        raise

    except Exception as e:
        print(f"[Predict Error] {e}")

        raise HTTPException(
            status_code=500,
            detail=f"AI prediction failed: {str(e)}"
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            