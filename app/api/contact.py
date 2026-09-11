import html
import logging
import os
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status

from app.database.supabase import get_current_user, get_supabase_admin_client
from app.schemas.contact import (
    ContactFormCreate,
    ContactMessageItem,
    ContactSubmitResponse,
    ContactSubjectsResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contact", tags=["Contact & Support"])

# Cấu hình Telegram Bot
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

# Danh mục các chủ đề hỗ trợ cho form liên hệ
CONTACT_SUBJECTS = [
    "Tư vấn gói cước",
    "Báo lỗi kỹ thuật",
    "Hợp tác phát triển",
    "Góp ý tính năng",
    "Khác",
]


async def _send_telegram_notification(
    full_name: str,
    email: str,
    phone: Optional[str],
    subject: str,
    message: str,
    user_id: str,
    message_id: str,
) -> None:
    """
    Gửi thông báo có lời nhắn mới về Telegram ở chế độ chạy ngầm (Background Task).
    Bọc try/except an toàn để không ảnh hưởng đến API nếu mạng bên thứ ba gặp sự cố.
    """
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.warning("TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID chưa được cấu hình.")
        return

    now_str = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M:%S UTC")
    phone_display = html.escape(phone) if phone else "<i>Không cung cấp</i>"

    text = (
        f"🔔 <b>CÓ LỜI NHẮN MỚI TỪ THÀNH VIÊN!</b>\n\n"
        f"👤 <b>Họ tên:</b> {html.escape(full_name)}\n"
        f"📧 <b>Email:</b> {html.escape(email)}\n"
        f"📞 <b>SĐT:</b> {phone_display}\n"
        f"📌 <b>Chủ đề:</b> {html.escape(subject)}\n"
        f"💬 <b>Nội dung:</b>\n"
        f"<i>{html.escape(message)}</i>\n\n"
        f"🆔 <b>User ID:</b> <code>{user_id}</code>\n"
        f"⏰ <b>Thời gian:</b> {now_str}\n"
        f"🔖 <b>Mã tin nhắn:</b> <code>{message_id}</code>"
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "HTML",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                logger.error(
                    f"Lỗi gửi tin nhắn Telegram: HTTP {response.status_code} - {response.text}"
                )
    except Exception as e:
        logger.error(f"Ngoại lệ khi gửi thông báo Telegram: {str(e)}")


# =============================================================
# 1. GET SUBJECTS (Danh sách chủ đề cho dropdown giao diện)
# =============================================================

@router.get(
    "/subjects",
    response_model=ContactSubjectsResponse,
    summary="Danh sách chủ đề liên hệ",
    description="Cung cấp danh sách các chủ đề cố định để Frontend hiển thị trong ô chọn (dropdown).",
)
def get_contact_subjects():
    return ContactSubjectsResponse(status="success", subjects=CONTACT_SUBJECTS)


# =============================================================
# 2. SUBMIT CONTACT FORM (Gửi lời nhắn - Yêu cầu đăng nhập)
# =============================================================

@router.post(
    "/submit",
    response_model=ContactSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Gửi lời nhắn liên hệ",
    description=(
        "Tiếp nhận lời nhắn từ người dùng đã đăng nhập, xác thực user_id trong cơ sở dữ liệu, "
        "lưu vào bảng contact_messages và gửi thông báo tức thì qua Telegram Bot."
    ),
)
def submit_contact_message(
    payload: ContactFormCreate,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
):
    # 1. Kiểm tra xác thực người dùng
    if not current_user or not getattr(current_user, "id", None):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu đăng nhập. Bạn phải có tài khoản để gửi liên hệ.",
        )

    user_id = str(current_user.id)
    supabase = get_supabase_admin_client()

    # 2. Kiểm tra tài khoản người dùng có tồn tại trong bảng public.users không
    try:
        user_query = (
            supabase.table("users")
            .select("id")
            .eq("id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi kiểm tra thông tin người dùng: {str(e)}",
        )

    if not user_query or not user_query.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu đăng nhập. Tài khoản của bạn không tồn tại trong hệ thống.",
        )

    # 3. Chuẩn bị bản ghi lưu vào Supabase
    record = {
        "user_id": user_id,
        "full_name": payload.full_name.strip(),
        "email": payload.email.strip().lower(),
        "phone": payload.phone.strip() if payload.phone else None,
        "subject": payload.subject.strip(),
        "message": payload.message.strip(),
        "status": "pending",
    }

    try:
        insert_res = supabase.table("contact_messages").insert(record).execute()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi lưu tin nhắn vào cơ sở dữ liệu: {str(e)}",
        )

    if not insert_res.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không nhận được dữ liệu phản hồi sau khi lưu lời nhắn.",
        )

    saved_item = insert_res.data[0]
    message_id = str(saved_item.get("id", ""))

    # 4. Kích hoạt tác vụ ngầm gửi tin nhắn qua Telegram Bot
    if TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID:
        background_tasks.add_task(
            _send_telegram_notification,
            full_name=payload.full_name.strip(),
            email=payload.email.strip().lower(),
            phone=payload.phone.strip() if payload.phone else None,
            subject=payload.subject.strip(),
            message=payload.message.strip(),
            user_id=user_id,
            message_id=message_id,
        )

    # 5. Phản hồi thành công ngay lập tức cho Frontend
    item_response = ContactMessageItem(
        id=message_id,
        user_id=saved_item.get("user_id", user_id),
        full_name=saved_item.get("full_name", payload.full_name),
        email=saved_item.get("email", payload.email),
        phone=saved_item.get("phone"),
        subject=saved_item.get("subject", payload.subject),
        message=saved_item.get("message", payload.message),
        status=saved_item.get("status", "pending"),
        created_at=str(saved_item.get("created_at", "")),
    )

    return ContactSubmitResponse(
        status="success",
        message="Gửi lời nhắn thành công! Nhóm dự án sẽ phản hồi cho bạn qua email sớm nhất.",
        data=item_response,
    )
