import math
from datetime import date, datetime, time, timedelta, timezone
from typing import Any
from uuid import UUID
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_user
from app.database.supabase import SUPABASE_BUCKET, get_supabase_admin_client
from app.schemas.history import (
    CreateSearchHistoryRequest,
    DeleteSearchHistoryResponse,
    SearchHistoryItem,
    SearchHistoryListResponse,
    SelectPredictionRequest,
)


router = APIRouter(prefix="/history", tags=["Search History"])
HISTORY_TIMEZONE = ZoneInfo("Asia/Ho_Chi_Minh")


def _serialize_id(value: UUID | str | None) -> str | None:
    return str(value) if value is not None else None


def _parse_searched_at(value: str | datetime) -> datetime:
    if isinstance(value, datetime):
        return value

    normalized = value.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def _location_text(place: dict[str, Any] | None) -> str:
    if not place:
        return "Không xác định"

    province = place.get("province")
    country = place.get("country")
    parts = [part for part in (province, country) if part]
    return ", ".join(parts) or place.get("address") or "Không xác định"


def _safe_execute(query, max_retries: int = 2, delay: float = 0.2):
    """Thực thi truy vấn Supabase PostgREST an toàn với cơ chế tự động retry khi gặp sự cố socket/mạng."""
    import time
    for attempt in range(max_retries):
        try:
            return query.execute()
        except Exception as err:
            if attempt == max_retries - 1:
                raise
            time.sleep(delay)


def _load_related_data(client, history_rows: list[dict[str, Any]]):
    place_ids = {row["place_id"] for row in history_rows if row.get("place_id")}
    input_media_ids = {
        row["input_media_id"] for row in history_rows if row.get("input_media_id")
    }

    places_by_id: dict[str, dict[str, Any]] = {}
    media_by_id: dict[str, dict[str, Any]] = {}
    place_image_media_id: dict[str, str] = {}

    if place_ids:
        places_response = _safe_execute(
            client.table("places")
            .select(
                "id,name,description,province,country,latitude,longitude,address"
            )
            .in_("id", list(place_ids))
        )
        places_by_id = {
            str(row["id"]): row for row in (places_response.data or [])
        }

        images_response = _safe_execute(
            client.table("place_images")
            .select("place_id,media_id,is_primary,display_order")
            .in_("place_id", list(place_ids))
            .order("is_primary", desc=True)
            .order("display_order")
        )
        for row in images_response.data or []:
            place_image_media_id.setdefault(
                str(row["place_id"]), str(row["media_id"])
            )

    all_media_ids = input_media_ids | set(place_image_media_id.values())
    if all_media_ids:
        media_response = _safe_execute(
            client.table("media_files")
            .select(
                "id,file_name,file_url,mime_type,file_size,storage_path,created_at"
            )
            .in_("id", list(all_media_ids))
        )
        media_by_id = {
            str(row["id"]): row for row in (media_response.data or [])
        }

    return places_by_id, media_by_id, place_image_media_id


def _build_history_items(client, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    places_by_id, media_by_id, place_image_media_id = _load_related_data(
        client, rows
    )
    items = []

    for row in rows:
        place_id = _serialize_id(row.get("place_id"))
        input_media_id = _serialize_id(row.get("input_media_id"))
        place = places_by_id.get(place_id) if place_id else None
        input_media = media_by_id.get(input_media_id) if input_media_id else None

        place_image = None
        if place_id and place_id in place_image_media_id:
            place_image = media_by_id.get(place_image_media_id[place_id])

        if place is not None:
            place = dict(place)
            place["image_url"] = (
                place_image.get("file_url") if place_image else None
            )

        searched_at = _parse_searched_at(row["searched_at"])
        local_searched_at = searched_at.astimezone(HISTORY_TIMEZONE)
        confidence_value = (
            float(row["confidence"]) if row.get("confidence") is not None else None
        )

        display_name = (
            row.get("predicted_name")
            or (place.get("name") if place else None)
            or (input_media.get("file_name") if input_media else None)
            or "Địa danh không xác định"
        )
        display_location = (
            row.get("predicted_province")
            or _location_text(place)
        )

        description = place.get("description") if place else None
        if not description and row.get("all_predictions"):
            preds = row.get("all_predictions")
            if isinstance(preds, list) and len(preds) > 0 and isinstance(preds[0], dict):
                description = preds[0].get("description")

        items.append(
            {
                "id": row["id"],
                "input_media_id": input_media_id,
                "place_id": place_id,
                "confidence_value": confidence_value,
                "search_type": row.get("search_type"),
                "searched_at": searched_at,
                "input_media": input_media,
                "place": place,
                "name": display_name,
                "location": display_location,
                "confidence": (
                    round(confidence_value * 100, 2)
                    if confidence_value is not None
                    else None
                ),
                "date": local_searched_at.strftime("%d/%m/%Y"),
                "time": local_searched_at.strftime("%H:%M"),
                "url": (
                    input_media.get("file_url")
                    if input_media and input_media.get("file_url")
                    else place.get("image_url") if place else None
                ),
                "description": description,
                "predicted_name": row.get("predicted_name"),
                "predicted_province": row.get("predicted_province"),
                "predicted_lat": row.get("predicted_lat"),
                "predicted_lon": row.get("predicted_lon"),
                "all_predictions": row.get("all_predictions"),
            }
        )

    return items


def _find_place_ids(client, search: str) -> list[str]:
    escaped = search.replace(",", "\\,")
    response = _safe_execute(
        client.table("places")
        .select("id")
        .or_(
            f"name.ilike.%{escaped}%,province.ilike.%{escaped}%,"
            f"country.ilike.%{escaped}%,address.ilike.%{escaped}%"
        )
    )
    return [str(row["id"]) for row in (response.data or [])]


def _history_query(
    client,
    user_id: str,
    search: str | None,
    place_ids: list[str] | None,
    start_date: date | None,
    end_date: date | None,
):
    query = (
        client.table("search_histories")
        .select(
            "id,input_media_id,place_id,confidence,search_type,searched_at,predicted_name,predicted_province,predicted_lat,predicted_lon,all_predictions",
            count="exact",
        )
        .eq("user_id", user_id)
        .eq("is_deleted", False)
    )

    if search and search.strip():
        term = search.strip().replace(",", "\\,")
        or_clauses = [
            f"predicted_name.ilike.%{term}%",
            f"predicted_province.ilike.%{term}%",
        ]
        if place_ids:
            or_clauses.append(f"place_id.in.({','.join(place_ids)})")
        query = query.or_(",".join(or_clauses))

    if start_date is not None:
        start = datetime.combine(start_date, time.min, tzinfo=HISTORY_TIMEZONE)
        query = query.gte("searched_at", start.astimezone(timezone.utc).isoformat())

    if end_date is not None:
        end_exclusive = datetime.combine(
            end_date + timedelta(days=1), time.min, tzinfo=HISTORY_TIMEZONE
        )
        query = query.lt(
            "searched_at", end_exclusive.astimezone(timezone.utc).isoformat()
        )

    return query


@router.get("", response_model=SearchHistoryListResponse)
def list_search_history(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    search: str | None = Query(default=None, max_length=255),
    start_date: date | None = None,
    end_date: date | None = None,
    current_user=Depends(get_current_user),
):
    if start_date and end_date and end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date must be greater than or equal to start_date",
        )

    client = get_supabase_admin_client()
    user_id = str(current_user.id)

    try:
        place_ids = None
        if search and search.strip():
            place_ids = _find_place_ids(client, search.strip())

        start = (page - 1) * page_size
        end = start + page_size - 1
        response = _safe_execute(
            _history_query(client, user_id, search, place_ids, start_date, end_date)
            .order("searched_at", desc=True)
            .range(start, end)
        )

        total_records = response.count or 0
        return {
            "items": _build_history_items(client, response.data or []),
            "page": page,
            "page_size": page_size,
            "total_records": total_records,
            "total_pages": math.ceil(total_records / page_size) if total_records > 0 else 0,
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list search history: {error}",
        )


@router.get("/{history_id}", response_model=SearchHistoryItem)
def get_search_history(
    history_id: UUID,
    current_user=Depends(get_current_user),
):
    client = get_supabase_admin_client()

    try:
        response = (
            client.table("search_histories")
            .select(
                "id,input_media_id,place_id,confidence,search_type,searched_at,predicted_name,predicted_province,predicted_lat,predicted_lon,all_predictions"
            )
            .eq("id", str(history_id))
            .eq("user_id", str(current_user.id))
            .eq("is_deleted", False)
            .maybe_single()
            .execute()
        )
        if response is None or not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Search history not found",
            )
        return _build_history_items(client, [response.data])[0]
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get search history: {error}",
        )


@router.patch("/{history_id}/select-prediction")
def select_history_prediction(
    history_id: UUID,
    payload: SelectPredictionRequest,
    current_user=Depends(get_current_user),
):
    """
    Cập nhật vị trí được người dùng lựa chọn trong Top-K dự đoán vào lịch sử tìm kiếm.
    """
    client = get_supabase_admin_client()
    user_id = str(current_user.id)

    # 1. Kiểm tra bản ghi tồn tại, thuộc về current_user và chưa bị xóa mềm
    existing = (
        client.table("search_histories")
        .select("id,user_id,all_predictions")
        .eq("id", str(history_id))
        .eq("user_id", user_id)
        .eq("is_deleted", False)
        .maybe_single()
        .execute()
    )
    if not existing or not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy lịch sử tìm kiếm hoặc bạn không có quyền cập nhật.",
        )

    confidence = payload.confidence
    if confidence is None and payload.prob_percent is not None:
        confidence = round(payload.prob_percent / 100.0, 4)

    update_data: dict[str, Any] = {
        "predicted_name": payload.name,
        "predicted_province": payload.province,
        "predicted_lat": payload.lat,
        "predicted_lon": payload.lon,
    }
    if confidence is not None:
        update_data["confidence"] = confidence

    # Thử tìm place_id tương ứng nếu có
    if payload.name:
        exact_place = (
            client.table("places")
            .select("id")
            .ilike("name", payload.name)
            .limit(1)
            .execute()
        )
        if exact_place.data:
            update_data["place_id"] = str(exact_place.data[0]["id"])

    response = (
        client.table("search_histories")
        .update(update_data)
        .eq("id", str(history_id))
        .eq("user_id", user_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể cập nhật địa điểm cho lịch sử tìm kiếm.",
        )

    updated_item = _build_history_items(client, response.data)[0]
    return {
        "success": True,
        "message": "Đã cập nhật vị trí trong lịch sử tìm kiếm thành công.",
        "item": updated_item,
    }


@router.post(
    "",
    response_model=SearchHistoryItem,
    status_code=status.HTTP_201_CREATED,
)
def create_search_history(
    payload: CreateSearchHistoryRequest,
    current_user=Depends(get_current_user),
):
    client = get_supabase_admin_client()
    user_id = str(current_user.id)

    try:
        if payload.input_media_id is not None:
            media_response = (
                client.table("media_files")
                .select("id")
                .eq("id", str(payload.input_media_id))
                .eq("user_id", user_id)
                .maybe_single()
                .execute()
            )
            if media_response is None or not media_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Input media not found",
                )

        if payload.place_id is not None:
            place_response = (
                client.table("places")
                .select("id")
                .eq("id", str(payload.place_id))
                .maybe_single()
                .execute()
            )
            if place_response is None or not place_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Place not found",
                )

        insert_data = {
            "user_id": user_id,
            "input_media_id": _serialize_id(payload.input_media_id),
            "place_id": _serialize_id(payload.place_id),
            "confidence": payload.confidence,
            "search_type": payload.search_type,
        }
        response = (
            client.table("search_histories")
            .insert(insert_data)
            .execute()
        )
        if not response.data:
            raise RuntimeError("search_histories insert returned no data")
        return _build_history_items(client, [response.data[0]])[0]
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create search history: {error}",
        )


@router.delete("/{history_id}", response_model=DeleteSearchHistoryResponse)
def delete_search_history(
    history_id: UUID,
    current_user=Depends(get_current_user),
):
    client = get_supabase_admin_client()
    user_id = str(current_user.id)

    try:
        # 1. Kiểm tra bản ghi lịch sử tồn tại, thuộc về user và chưa bị xóa mềm
        target = (
            client.table("search_histories")
            .select("id")
            .eq("id", str(history_id))
            .eq("user_id", user_id)
            .eq("is_deleted", False)
            .maybe_single()
            .execute()
        )
        if not target or not target.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Search history not found",
            )

        # 2. Xóa mềm (Soft Delete): Cập nhật is_deleted = True và deleted_at = now()
        # Toàn bộ dữ liệu trong search_histories, media_files và file ảnh Storage vẫn được lưu giữ nguyên vẹn trong DB
        now_iso = datetime.now(timezone.utc).isoformat()
        response = (
            client.table("search_histories")
            .update({
                "is_deleted": True,
                "deleted_at": now_iso,
            })
            .eq("id", str(history_id))
            .eq("user_id", user_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Search history not found",
            )

        return {"deleted": True, "history_id": history_id}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete search history: {error}",
        )
