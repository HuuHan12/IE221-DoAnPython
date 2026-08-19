import os
import time
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from app.database.database import save_prediction
from app.utils.geoclip import predict_image, compute_gis_error, get_geoclip_service


router = APIRouter()


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 10 * 1024 * 1024


class DistanceRequest(BaseModel):
    lat1: float
    lon1: float
    lat2: float
    lon2: float


@router.post("/predict")
async def predict(
    image: UploadFile = File(...),
    top_k: int = Form(5),
    scope: str = Form("iconic"),
    ground_truth_lat: Optional[str] = Form(None),
    ground_truth_lon: Optional[str] = Form(None),
):
    """
    API endpoint nhận diện vị trí và địa danh Việt Nam từ ảnh bằng GeoCLIP AI model,
    trả về dữ liệu thực tế: thời gian xử lý, tổng số tọa độ trong gallery, danh sách Top-K và sai số GIS.
    """
    content_type = image.content_type or "image/jpeg"
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Chỉ hỗ trợ file ảnh định dạng JPG, PNG và WEBP."
        )

    image_data = await image.read()
    size_bytes = len(image_data)

    if size_bytes > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Kích thước ảnh không được vượt quá 10 MB."
        )

    if size_bytes == 0:
        raise HTTPException(
            status_code=400,
            detail="File ảnh tải lên bị rỗng."
        )

    top_k_clamped = max(1, min(10, int(top_k)))
    suffix = Path(image.filename or "image.jpg").suffix.lower() or ".jpg"
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(image_data)
            temp_path = temp_file.name

        # ĐO THỜI GIAN XỬ LÝ THỰC TẾ
        start_time = time.time()
        service = get_geoclip_service(scope=scope)
        total_gallery = len(service.gps_gallery) if hasattr(service, "gps_gallery") else 26353

        predictions = service.predict(temp_path, top_k=top_k_clamped)
        elapsed_seconds = round(time.time() - start_time, 4)

        if not predictions:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy địa danh phù hợp trong cơ sở dữ liệu."
            )

        best_prediction = predictions[0]
        landmark = best_prediction.get("name", "Địa danh không xác định")
        prob_percent = float(best_prediction.get("prob_percent", 0.0))
        pred_lat = float(best_prediction.get("lat", 0.0))
        pred_lon = float(best_prediction.get("lon", 0.0))
        confidence = prob_percent / 100.0

        # TÍNH TOÁN SAI SỐ GIS NẾU CÓ GROUND TRUTH
        gis_error = None
        if ground_truth_lat and ground_truth_lon:
            try:
                gt_lat_val = float(ground_truth_lat)
                gt_lon_val = float(ground_truth_lon)
                gis_error = compute_gis_error((gt_lat_val, gt_lon_val), (pred_lat, pred_lon))
                gis_error["ground_truth"] = {
                    "lat": gt_lat_val,
                    "lon": gt_lon_val,
                }
            except Exception as e:
                print(f"[GIS Error Warning] {e}")

        # Lưu lịch sử
        prediction_id = save_prediction(
            filename=image.filename or "upload.jpg",
            content_type=content_type,
            size_bytes=size_bytes,
            landmark=landmark,
            confidence=confidence
        )

        size_mb = size_bytes / (1024 * 1024)

        return {
            "id": prediction_id,
            "filename": image.filename or "upload.jpg",
            "content_type": content_type,
            "size_bytes": size_bytes,
            "size": f"{size_mb:.2f} MB",
            "scope": scope,
            "top_k": top_k_clamped,
            "landmark": landmark,
            "confidence": confidence,
            "prediction": best_prediction,
            "predictions": predictions,
            "gis_error": gis_error,
            "elapsed_seconds": elapsed_seconds,
            "total_gallery": total_gallery,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[Predict Error] {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Dự đoán AI thất bại: {str(e)}"
        )
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@router.post("/gis/distance")
async def calculate_distance_api(payload: DistanceRequest):
    try:
        return compute_gis_error((payload.lat1, payload.lon1), (payload.lat2, payload.lon2))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
