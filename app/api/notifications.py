import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database.supabase import get_current_user, get_supabase_admin_client
from app.schemas.notification import (
    MarkReadResponse,
    NotificationItem,
    NotificationListResponse,
    UnreadCountResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def create_user_notification(
    user_id: str,
    notif_type: str,
    title: str,
    content: Optional[str] = None,
) -> Optional[dict]:
    """
    Hàm tiện ích nội bộ để các API khác (như Payments, Contact) tự động
    gửi thông báo vào hòm thư của người dùng khi có sự kiện quan trọng.
    """
    supabase = get_supabase_admin_client()
    try:
        res = (
            supabase.table("user_notifications")
            .insert({
                "user_id": str(user_id),
                "type": notif_type,
                "title": title,
                "content": content,
                "is_read": False,
            })
            .execute()
        )
        if res.data:
            return res.data[0]
    except Exception as e:
        logger.error(f"Không thể tạo thông báo tự động cho user {user_id}: {str(e)}")
    return None



# 1. Số thông báo chưa đọc
@router.api_route(
    "/unread-count",
    methods=["GET", "POST"],
    response_model=UnreadCountResponse,
    summary="Đếm số lượng thông báo chưa đọc",
    description="Truy vấn số lượng thông báo chưa đọc của tài khoản để hiển thị badge đỏ trên Quả chuông ở Header.",
)
def get_unread_count(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)
    supabase = get_supabase_admin_client()

    try:
        response = (
            supabase.table("user_notifications")
            .select("id")
            .eq("user_id", user_id)
            .eq("is_read", False)
            .execute()
        )
        unread_count = len(response.data or [])
        return UnreadCountResponse(status="success", unread_count=unread_count)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi đếm số thông báo chưa đọc: {str(e)}",
        )



# 2. Danh sách thông báo
@router.get(
    "",
    response_model=NotificationListResponse,
    summary="Danh sách thông báo của người dùng",
    description="Lấy danh sách các thông báo mới nhất của tài khoản hiện tại kèm số lượng chưa đọc.",
)
def get_notifications(
    unread_only: bool = Query(
        default=False,
        description="Chỉ lấy danh sách các thông báo chưa đọc",
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Số lượng thông báo tối đa cần lấy",
    ),
    current_user=Depends(get_current_user),
):
    user_id = str(current_user.id)
    supabase = get_supabase_admin_client()

    try:
        # 1. Truy vấn danh sách thông báo
        query = (
            supabase.table("user_notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
        )

        if unread_only:
            query = query.eq("is_read", False)

        result = query.execute()
        rows = result.data or []

        # 2. Đếm tổng số thông báo chưa đọc
        unread_res = (
            supabase.table("user_notifications")
            .select("id")
            .eq("user_id", user_id)
            .eq("is_read", False)
            .execute()
        )
        unread_count = len(unread_res.data or [])

        # 3. Format dữ liệu trả về
        items = [
            NotificationItem(
                id=str(r.get("id")),
                user_id=str(r.get("user_id")),
                type=r.get("type", "system"),
                title=r.get("title", ""),
                content=r.get("content"),
                is_read=bool(r.get("is_read", False)),
                read_at=str(r.get("read_at")) if r.get("read_at") else None,
                created_at=str(r.get("created_at", "")),
            )
            for r in rows
        ]

        return NotificationListResponse(
            status="success",
            unread_count=unread_count,
            total=len(items),
            data=items,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi truy vấn danh sách thông báo: {str(e)}",
        )



# 3. Đánh dấu tất cả là đã đọc
@router.patch(
    "/read-all",
    response_model=MarkReadResponse,
    summary="Đánh dấu tất cả thông báo là đã đọc",
    description="Cập nhật toàn bộ thông báo chưa đọc của người dùng thành đã đọc.",
)
def mark_all_notifications_as_read(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)
    supabase = get_supabase_admin_client()
    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        supabase.table("user_notifications").update({
            "is_read": True,
            "read_at": now_iso,
        }).eq("user_id", user_id).eq("is_read", False).execute()

        return MarkReadResponse(
            status="success",
            message="Đã đánh dấu tất cả thông báo là đã đọc.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi cập nhật trạng thái thông báo: {str(e)}",
        )



# 4. Đánh dấu 1 thông báo cụ thể là đã đọc
@router.patch(
    "/{notification_id}/read",
    response_model=MarkReadResponse,
    summary="Đánh dấu một thông báo cụ thể là đã đọc",
    description="Cập nhật trạng thái của một thông báo xác định sang đã đọc khi người dùng bấm vào xem.",
)
def mark_notification_as_read(
    notification_id: str,
    current_user=Depends(get_current_user),
):
    user_id = str(current_user.id)
    supabase = get_supabase_admin_client()
    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        # Kiểm tra thông báo có tồn tại và thuộc sở hữu của người dùng hay không
        check_res = (
            supabase.table("user_notifications")
            .select("id")
            .eq("id", notification_id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )

        if not check_res or not check_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy thông báo hoặc bạn không có quyền truy cập.",
            )

        supabase.table("user_notifications").update({
            "is_read": True,
            "read_at": now_iso,
        }).eq("id", notification_id).execute()

        return MarkReadResponse(
            status="success",
            message="Đã đánh dấu thông báo là đã đọc.",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi cập nhật trạng thái thông báo: {str(e)}",
        )
