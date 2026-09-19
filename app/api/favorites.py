from typing import Any, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.database.supabase import get_supabase_admin_client


router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"],
)


class AddFavoriteRequest(BaseModel):
    place_id: str = Field(..., description="UUID của địa danh cần thêm vào yêu thích")
    media_id: Optional[str] = Field(None, description="UUID của bức ảnh quét từ bảng media_files nếu có")


class FavoriteItemResponse(BaseModel):
    id: str
    place_id: str
    name: str
    shortName: str
    province: str
    country: Optional[str] = "Việt Nam"
    description: Optional[str] = None
    address: Optional[str] = None
    coords: dict
    url: str
    note: Optional[str] = None
    created_at: Optional[str] = None


class FavoritesListResponse(BaseModel):
    items: List[FavoriteItemResponse]
    total: int


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


@router.get("", response_model=FavoritesListResponse)
def get_user_favorites(current_user=Depends(get_current_user)):
    """
    Lấy toàn bộ danh sách địa điểm yêu thích của người dùng đang đăng nhập (user_id).
    Ưu tiên hiển thị chính xác ảnh do người dùng quét (media_id).
    """
    client = get_supabase_admin_client()
    user_id = str(current_user.id)

    try:
        # 1. Truy vấn các địa danh yêu thích của user_id hiện tại (kèm media_id)
        fav_response = _safe_execute(
            client.table("user_favorites")
            .select("id, place_id, media_id, display_order, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
        )
        fav_rows = fav_response.data or []
        if not fav_rows:
            return {"items": [], "total": 0}

        place_ids = [row["place_id"] for row in fav_rows if row.get("place_id")]
        if not place_ids:
            return {"items": [], "total": 0}

        # 2. Truy vấn thông tin chi tiết các địa danh từ bảng places
        places_response = _safe_execute(
            client.table("places")
            .select("id, name, description, province, country, latitude, longitude, address")
            .in_("id", place_ids)
        )
        places_by_id = {str(p["id"]): p for p in (places_response.data or [])}

        # 3. Lấy ảnh mẫu từ place_images (dùng làm fallback nếu địa danh không có media_id quét riêng)
        stock_images_res = _safe_execute(
            client.table("place_images")
            .select("place_id, media_id, is_primary")
            .in_("place_id", place_ids)
            .order("is_primary", desc=True)
        )
        stock_media_id_by_place: dict[str, str] = {}
        for img in (stock_images_res.data or []):
            stock_media_id_by_place.setdefault(str(img["place_id"]), str(img["media_id"]))

        # Tập hợp tất cả các media_id cần lấy URL từ bảng media_files
        all_media_ids = set()
        for fav in fav_rows:
            if fav.get("media_id"):
                all_media_ids.add(str(fav["media_id"]))
        all_media_ids.update(stock_media_id_by_place.values())

        media_url_by_id: dict[str, str] = {}
        if all_media_ids:
            media_response = _safe_execute(
                client.table("media_files")
                .select("id, file_url")
                .in_("id", list(all_media_ids))
            )
            media_url_by_id = {
                str(m["id"]): m["file_url"]
                for m in (media_response.data or [])
                if m.get("file_url")
            }

        # Fallback image dự phòng nếu địa danh chưa có ảnh trong media_files
        fallback_image = "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop"

        items: List[FavoriteItemResponse] = []
        for fav in fav_rows:
            p_id = str(fav["place_id"])
            place = places_by_id.get(p_id)
            if not place:
                continue

            # Ưu tiên 1: Bức ảnh thực tế người dùng đã quét (fav["media_id"])
            img_url = None
            if fav.get("media_id"):
                img_url = media_url_by_id.get(str(fav["media_id"]))

            # Ưu tiên 2: Ảnh chuẩn trong bảng place_images
            if not img_url:
                stock_m_id = stock_media_id_by_place.get(p_id)
                if stock_m_id:
                    img_url = media_url_by_id.get(stock_m_id)

            # Ưu tiên 3: Ảnh fallback chung
            if not img_url:
                img_url = fallback_image

            name = place.get("name") or "Địa danh chưa đặt tên"
            province = place.get("province") or "Việt Nam"
            lat = float(place["latitude"]) if place.get("latitude") is not None else 0.0
            lng = float(place["longitude"]) if place.get("longitude") is not None else 0.0

            items.append(
                FavoriteItemResponse(
                    id=str(fav["id"]),
                    place_id=p_id,
                    name=name,
                    shortName=name.split(" - ")[0],
                    province=province,
                    country=place.get("country") or "Việt Nam",
                    description=place.get("description") or "",
                    address=place.get("address") or "",
                    coords={"lat": lat, "lng": lng},
                    url=img_url,
                    note=name,
                    created_at=fav.get("created_at"),
                )
            )

        return {"items": items, "total": len(items)}

    except Exception as e:
        print(f"[Favorites Error] {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể kết nối đến cơ sở dữ liệu để tải danh sách yêu thích. Vui lòng bấm 'Thử lại'.",
        )


@router.post("", response_model=FavoriteItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_favorites(payload: AddFavoriteRequest, current_user=Depends(get_current_user)):
    """
    Thêm hoặc cập nhật địa danh vào danh sách yêu thích của người dùng.
    Lưu chính xác media_id của ảnh đã quét nếu được truyền lên.
    """
    client = get_supabase_admin_client()
    user_id = str(current_user.id)
    place_id = str(payload.place_id).strip()
    target_media_id = str(payload.media_id).strip() if payload.media_id else None

    # Kiểm tra địa danh có tồn tại trong bảng places không
    place_res = (
        client.table("places")
        .select("id, name, description, province, country, latitude, longitude, address")
        .eq("id", place_id)
        .maybe_single()
        .execute()
    )
    if not place_res or not place_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy địa danh cần thêm vào yêu thích.",
        )
    place = place_res.data

    # Nếu không truyền media_id (ví dụ từ cổng thông tin), tự động tìm ảnh quét gần nhất trong search_histories
    if not target_media_id:
        recent_scan = (
            client.table("search_histories")
            .select("input_media_id")
            .eq("user_id", user_id)
            .eq("place_id", place_id)
            .order("searched_at", desc=True)
            .limit(1)
            .execute()
        )
        if recent_scan.data and recent_scan.data[0].get("input_media_id"):
            target_media_id = str(recent_scan.data[0]["input_media_id"])

    # Kiểm tra xem đã có trong favorites của user này chưa
    existing = (
        client.table("user_favorites")
        .select("id, place_id, media_id, created_at")
        .eq("user_id", user_id)
        .eq("place_id", place_id)
        .maybe_single()
        .execute()
    )

    if existing and existing.data:
        fav_record = existing.data
        # Cập nhật media_id mới nhất nếu có
        if target_media_id and fav_record.get("media_id") != target_media_id:
            upd_res = (
                client.table("user_favorites")
                .update({"media_id": target_media_id})
                .eq("id", fav_record["id"])
                .execute()
            )
            if upd_res.data:
                fav_record = upd_res.data[0]
    else:
        insert_payload = {
            "user_id": user_id,
            "place_id": place_id,
            "display_order": 1,
        }
        if target_media_id:
            insert_payload["media_id"] = target_media_id

        insert_res = (
            client.table("user_favorites")
            .insert(insert_payload)
            .execute()
        )
        if not insert_res.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Không thể lưu địa danh vào danh sách yêu thích.",
            )
        fav_record = insert_res.data[0]

    # Lấy URL ảnh phản hồi: Ưu tiên media_id vừa lưu -> place_images -> fallback
    img_url = "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop"
    saved_media_id = fav_record.get("media_id") or target_media_id
    if saved_media_id:
        m_res = client.table("media_files").select("file_url").eq("id", saved_media_id).maybe_single().execute()
        if m_res and m_res.data and m_res.data.get("file_url"):
            img_url = m_res.data["file_url"]
    else:
        img_res = (
            client.table("place_images")
            .select("media_id")
            .eq("place_id", place_id)
            .order("is_primary", desc=True)
            .limit(1)
            .execute()
        )
        if img_res and img_res.data:
            m_id = str(img_res.data[0]["media_id"])
            m_res = client.table("media_files").select("file_url").eq("id", m_id).maybe_single().execute()
            if m_res and m_res.data and m_res.data.get("file_url"):
                img_url = m_res.data["file_url"]

    name = place.get("name") or "Địa danh chưa đặt tên"
    lat = float(place["latitude"]) if place.get("latitude") is not None else 0.0
    lng = float(place["longitude"]) if place.get("longitude") is not None else 0.0

    return FavoriteItemResponse(
        id=str(fav_record["id"]),
        place_id=place_id,
        name=name,
        shortName=name.split(" - ")[0],
        province=place.get("province") or "Việt Nam",
        country=place.get("country") or "Việt Nam",
        description=place.get("description") or "",
        address=place.get("address") or "",
        coords={"lat": lat, "lng": lng},
        url=img_url,
        note=name,
        created_at=fav_record.get("created_at"),
    )


@router.delete("/{target_id}")
def remove_from_favorites(target_id: str, current_user=Depends(get_current_user)):
    """
    Xóa địa danh khỏi danh sách yêu thích của người dùng hiện tại.
    Bảo mật: Chỉ cho phép xóa bản ghi thuộc về chính user_id của tài khoản đăng nhập.
    target_id có thể là place_id hoặc id của bảng user_favorites.
    """
    client = get_supabase_admin_client()
    user_id = str(current_user.id)
    tid = target_id.strip()

    # Thử xóa theo place_id trước
    delete_by_place = (
        client.table("user_favorites")
        .delete()
        .eq("user_id", user_id)
        .eq("place_id", tid)
        .execute()
    )

    if delete_by_place.data:
        return {"success": True, "message": "Đã xóa địa danh khỏi danh sách yêu thích."}

    # Nếu không khớp place_id, thử xóa theo favorite_id (id bản ghi)
    delete_by_id = (
        client.table("user_favorites")
        .delete()
        .eq("user_id", user_id)
        .eq("id", tid)
        .execute()
    )

    if delete_by_id.data:
        return {"success": True, "message": "Đã xóa địa danh khỏi danh sách yêu thích."}

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Không tìm thấy địa điểm yêu thích hoặc bạn không có quyền xóa.",
    )


@router.get("/check/{place_id}")
def check_is_favorite(place_id: str, current_user=Depends(get_current_user)):
    """
    Kiểm tra một địa danh cụ thể đã được người dùng này yêu thích hay chưa.
    """
    client = get_supabase_admin_client()
    user_id = str(current_user.id)

    res = (
        client.table("user_favorites")
        .select("id")
        .eq("user_id", user_id)
        .eq("place_id", place_id.strip())
        .maybe_single()
        .execute()
    )

    if res and res.data:
        return {"is_favorite": True, "favorite_id": str(res.data["id"])}
    return {"is_favorite": False, "favorite_id": None}