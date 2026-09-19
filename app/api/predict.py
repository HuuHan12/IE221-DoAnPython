import os
import time
import tempfile
import uuid
from datetime import date, datetime, time as d_time
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status

from app.core.security import get_current_user_with_plan
from app.database.supabase import (
    SUPABASE_BUCKET,
    SUPABASE_URL,
    get_supabase_admin_client,
)
from app.utils.geoclip import predict_image, compute_gis_error, get_geoclip_service


router = APIRouter()


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 10 * 1024 * 1024


def _get_public_url(client, storage_path: str) -> str:
    response = client.storage.from_(SUPABASE_BUCKET).get_public_url(storage_path)
    if isinstance(response, str):
        return response
    if isinstance(response, dict):
        return (
            response.get("publicUrl")
            or response.get("publicURL")
            or response.get("public_url")
        )
    if hasattr(response, "public_url"):
        return response.public_url
    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{storage_path}"


def _find_or_create_place_id(
    client,
    landmark: str,
    province: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
) -> str | None:
    clean_name = landmark.strip()
    if not clean_name:
        return None

    # 1. Tìm kiếm chính xác
    exact_response = (
        client.table("places")
        .select("id")
        .ilike("name", clean_name)
        .limit(1)
        .execute()
    )
    if exact_response.data:
        return str(exact_response.data[0]["id"])

    # 2. Tìm kiếm gần đúng
    partial_response = (
        client.table("places")
        .select("id")
        .ilike("name", f"%{clean_name}%")
        .limit(1)
        .execute()
    )
    if partial_response.data:
        return str(partial_response.data[0]["id"])

    # 3. Tự động khởi tạo địa danh mới vào bảng places nếu chưa có
    try:
        new_place = {
            "name": clean_name,
            "province": province or "Việt Nam",
            "country": "Việt Nam",
            "latitude": lat if lat is not None else 0.0,
            "longitude": lon if lon is not None else 0.0,
            "description": f"Địa danh {clean_name} tại {province or 'Việt Nam'}.",
            "category_id": "0fd20aa7-7958-42e6-823e-49bbe92c3741",  # Check-in nổi tiếng
        }
        create_res = client.table("places").insert(new_place).execute()
        if create_res.data:
            return str(create_res.data[0]["id"])
    except Exception as create_err:
        print(f"[Auto-create Place Warning] Không thể tạo tự động địa danh '{clean_name}': {create_err}")

    return None


def _save_prediction_history(
    image_data: bytes,
    original_filename: str,
    content_type: str,
    landmark: str,
    confidence: float,
    user_id: str,
    predicted_name: Optional[str] = None,
    predicted_province: Optional[str] = None,
    predicted_lat: Optional[float] = None,
    predicted_lon: Optional[float] = None,
    all_predictions: Optional[list] = None,
) -> dict:
    client = get_supabase_admin_client()
    extension = Path(original_filename).suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".webp"}:
        extension = ".jpg"

    stored_filename = f"{uuid.uuid4().hex}{extension}"
    storage_path = f"{user_id}/history/{int(time.time())}_{stored_filename}"
    media_id = None
    storage_uploaded = False

    try:
        client.storage.from_(SUPABASE_BUCKET).upload(
            storage_path,
            image_data,
            {"content-type": content_type},
        )
        storage_uploaded = True
        public_url = _get_public_url(client, storage_path)

        media_response = (
            client.table("media_files")
            .insert(
                {
                    "user_id": user_id,
                    "file_name": original_filename,
                    "file_url": public_url,
                    "mime_type": content_type,
                    "file_size": len(image_data),
                    "storage_path": storage_path,
                }
            )
            .execute()
        )
        if not media_response.data:
            raise RuntimeError("media_files insert returned no data")
        media_id = str(media_response.data[0]["id"])

        place_id = _find_or_create_place_id(
            client=client,
            landmark=predicted_name or landmark,
            province=predicted_province,
            lat=predicted_lat,
            lon=predicted_lon,
        )
        history_response = (
            client.table("search_histories")
            .insert(
                {
                    "user_id": user_id,
                    "input_media_id": media_id,
                    "place_id": place_id,
                    "confidence": confidence,
                    "search_type": "image",
                    "predicted_name": predicted_name or landmark,
                    "predicted_province": predicted_province,
                    "predicted_lat": predicted_lat,
                    "predicted_lon": predicted_lon,
                    "all_predictions": all_predictions,
                }
            )
            .execute()
        )
        if not history_response.data:
            raise RuntimeError("search_histories insert returned no data")

        return {
            "history_id": str(history_response.data[0]["id"]),
            "input_media_id": media_id,
            "place_id": place_id,
        }
    except Exception:
        if media_id:
            (
                client.table("media_files")
                .delete()
                .eq("id", media_id)
                .eq("user_id", user_id)
                .execute()
            )
        if storage_uploaded:
            client.storage.from_(SUPABASE_BUCKET).remove([storage_path])
        raise


@router.post("/predict")
async def predict(
    image: UploadFile = File(...),
    top_k: int = Form(5),
    scope: str = Form("iconic"),
    ground_truth_lat: Optional[str] = Form(None),
    ground_truth_lon: Optional[str] = Form(None),
    user_with_plan=Depends(get_current_user_with_plan),
):
    """
    API endpoint nhận diện vị trí và địa danh Việt Nam từ ảnh bằng GeoCLIP AI model,
    trả về dữ liệu thực tế: thời gian xử lý, tổng số tọa độ trong gallery, danh sách Top-K và sai số GIS.
    Kiểm tra giới hạn số lượt quét trong ngày đối với tài khoản Free.
    """
    user_id = user_with_plan["user_id"]
    is_pro = user_with_plan["is_pro"]
    scan_limit = user_with_plan["scan_limit"]

    # Kiểm tra giới hạn lượt quét trong ngày đối với gói Free dựa trên bảng log bất biến
    if not is_pro and scan_limit > 0:
        today_start = datetime.combine(date.today(), d_time.min).isoformat()
        client = get_supabase_admin_client()
        today_scans = (
            client.table("user_daily_scan_logs")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("scanned_at", today_start)
            .execute()
        )
        count_today = today_scans.count or 0
        if count_today >= scan_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Bạn đã sử dụng hết {scan_limit} lượt quét ảnh miễn phí hôm nay. Vui lòng nâng cấp tài khoản Pro để quét không giới hạn!",
            )

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

        history = _save_prediction_history(
            image_data=image_data,
            original_filename=image.filename or "upload.jpg",
            content_type=content_type,
            landmark=landmark,
            confidence=confidence,
            user_id=user_id,
            predicted_name=best_prediction.get("name") or landmark,
            predicted_province=best_prediction.get("province"),
            predicted_lat=pred_lat,
            predicted_lon=pred_lon,
            all_predictions=predictions,
        )

        # Ghi nhận lượt quét vào bảng log bất biến (không bị xóa khi user xóa lịch sử tìm kiếm)
        try:
            admin_client = get_supabase_admin_client()
            admin_client.table("user_daily_scan_logs").insert({"user_id": user_id}).execute()
        except Exception as scan_log_err:
            print(f"[Scan Log Warning] Không thể ghi nhận user_daily_scan_logs: {scan_log_err}")

        size_mb = size_bytes / (1024 * 1024)

        return {
            "id": history["history_id"],
            "history_id": history["history_id"],
            "input_media_id": history["input_media_id"],
            "place_id": history["place_id"],
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
