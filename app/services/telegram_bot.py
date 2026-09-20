import asyncio
import html
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx
from dotenv import load_dotenv

load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env")))

logger = logging.getLogger(__name__)

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")



def _get_telegram_base_url() -> Optional[str]:
    token = os.getenv("TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN)
    if not token:
        return None
    return f"https://api.telegram.org/bot{token}"


async def send_payment_approval_request(
    order_code: str,
    user_email: str,
    amount: int,
    formatted_amount: str,
    plan_name: str,
    transaction_ref: str,
    user_id: str,
) -> bool:
    """
    Gửi tin nhắn thông báo kèm 2 nút bấm [Phê duyệt] và [Từ chối]
    đến Telegram của Admin khi người dùng gửi mã giao dịch.
    """
    base_url = _get_telegram_base_url()
    chat_id = os.getenv("TELEGRAM_CHAT_ID", TELEGRAM_CHAT_ID)

    if not base_url or not chat_id:
        logger.warning("TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID chưa được cấu hình.")
        return False

    now_str = datetime.now(timezone(timedelta(hours=7))).strftime("%d/%m/%Y %H:%M:%S (VN)")

    text = (
        f"🔔 <b>YÊU CẦU DUYỆT ĐƠN HÀNG GÓI {html.escape(plan_name.upper())}!</b>\n\n"
        f"👤 <b>Khách hàng:</b> {html.escape(user_email)}\n"
        f"📦 <b>Mã đơn hàng:</b> <code>{html.escape(order_code)}</code>\n"
        f"💰 <b>Số tiền:</b> <b>{html.escape(formatted_amount)}</b>\n"
        f"🧾 <b>Mã GD ngân hàng:</b> <code>{html.escape(transaction_ref)}</code>\n"
        f"🏦 <b>Tài khoản nhận:</b> TPBank - DOAN HUU HAN (87971498888)\n"
        f"🆔 <b>User ID:</b> <code>{html.escape(user_id)}</code>\n"
        f"⏰ <b>Thời gian gửi:</b> {now_str}\n\n"
        f"<i>Kiểm tra app ngân hàng TPBank, sau đó bấm phê duyệt bên dưới để kích hoạt gói Pro cho khách hàng ngay lập tức:</i>"
    )

    inline_keyboard = {
        "inline_keyboard": [
            [
                {
                    "text": "✅ Phê duyệt ngay",
                    "callback_data": f"approve:{order_code}",
                },
                {
                    "text": "❌ Từ chối",
                    "callback_data": f"reject:{order_code}",
                },
            ]
        ]
    }

    url = f"{base_url}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "reply_markup": inline_keyboard,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code == 200:
                logger.info(f"Đã gửi thông báo duyệt đơn {order_code} đến Telegram Admin.")
                return True
            else:
                logger.error(f"Lỗi gửi Telegram: HTTP {res.status_code} - {res.text}")
                return False
    except Exception as e:
        logger.error(f"Ngoại lệ khi gửi thông báo Telegram cho đơn {order_code}: {e}")
        return False


def execute_admin_approval(order_code: str) -> dict:
    """
    Thực hiện logic phê duyệt đơn hàng:
    - payment_orders status -> completed
    - user_subscriptions -> pro (30 ngày)
    - Gửi thông báo hòm thư cho khách
    """
    from app.database.supabase import get_supabase_admin_client

    supabase = get_supabase_admin_client()
    now_iso = datetime.now(timezone.utc).isoformat()

    order_res = (
        supabase.table("payment_orders")
        .select("*")
        .eq("order_code", order_code)
        .maybe_single()
        .execute()
    )

    if not order_res or not order_res.data:
        return {"success": False, "message": f"Không tìm thấy đơn hàng {order_code}"}

    order = order_res.data
    if order.get("status") == "completed":
        return {"success": True, "message": "Đơn hàng đã được duyệt trước đó.", "already": True}

    user_id = str(order["user_id"])
    plan_code = order["plan_code"]

    duration_days = 30
    try:
        p_res = (
            supabase.table("subscription_plans")
            .select("duration_days")
            .eq("code", plan_code)
            .maybe_single()
            .execute()
        )
        if p_res and p_res.data:
            duration_days = int(p_res.data.get("duration_days", 30))
    except Exception:
        pass

    end_date_iso = (datetime.now(timezone.utc) + timedelta(days=duration_days)).isoformat()

    # 1. Cập nhật payment_orders
    supabase.table("payment_orders").update({
        "status": "completed",
        "completed_at": now_iso,
        "updated_at": now_iso,
    }).eq("order_code", order_code).execute()

    # 2. Cập nhật user_subscriptions
    sub_data = {
        "user_id": user_id,
        "plan_code": plan_code,
        "status": "active",
        "start_date": now_iso,
        "end_date": end_date_iso,
        "last_order_id": order.get("id"),
        "updated_at": now_iso,
    }
    supabase.table("user_subscriptions").upsert(sub_data, on_conflict="user_id").execute()

    # 3. Gửi thông báo chúc mừng vào hòm thư
    try:
        from app.api.notifications import create_user_notification
        create_user_notification(
            user_id=user_id,
            notif_type="payment",
            title=f"Kích hoạt thành công gói {plan_code.upper()}!",
            content=f"Đơn hàng {order_code} đã được quản trị viên đối soát và kích hoạt thành công. Bạn có {duration_days} ngày sử dụng tính năng nâng cao.",
        )
    except Exception as e:
        logger.warning(f"Không thể tạo thông báo user: {e}")

    return {"success": True, "message": f"Kích hoạt thành công gói {plan_code.upper()} cho đơn {order_code}"}


def execute_admin_rejection(order_code: str) -> dict:
    """
    Thực hiện từ chối đơn hàng do mã giao dịch không hợp lệ.
    """
    from app.database.supabase import get_supabase_admin_client

    supabase = get_supabase_admin_client()
    now_iso = datetime.now(timezone.utc).isoformat()

    order_res = (
        supabase.table("payment_orders")
        .select("*")
        .eq("order_code", order_code)
        .maybe_single()
        .execute()
    )

    if not order_res or not order_res.data:
        return {"success": False, "message": f"Không tìm thấy đơn hàng {order_code}"}

    order = order_res.data
    user_id = str(order["user_id"])

    # Cập nhật payment_orders
    supabase.table("payment_orders").update({
        "status": "cancelled",
        "updated_at": now_iso,
    }).eq("order_code", order_code).execute()

    # Gửi thông báo từ chối
    try:
        from app.api.notifications import create_user_notification
        create_user_notification(
            user_id=user_id,
            notif_type="payment",
            title="Đơn hàng chưa được phê duyệt",
            content=f"Đơn hàng {order_code} không khớp với biến động số dư ngân hàng. Vui lòng kiểm tra lại mã giao dịch hoặc liên hệ hỗ trợ.",
        )
    except Exception as e:
        logger.warning(f"Không thể tạo thông báo user: {e}")

    return {"success": True, "message": f"Đã từ chối đơn hàng {order_code}"}


async def start_telegram_bot_listener():
    """
    Tác vụ chạy ngầm của FastAPI để liên tục lắng nghe tương tác nút bấm
    từ Telegram Bot của Admin thông qua cơ chế Long Polling (getUpdates).
    Chạy trực tiếp trên localhost, không cần cấu hình webhook hay domain công khai.
    """
    token = os.getenv("TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN)
    admin_chat_id = os.getenv("TELEGRAM_CHAT_ID", TELEGRAM_CHAT_ID)

    if not token or not admin_chat_id:
        logger.info("Telegram Bot chưa cấu hình đầy đủ token và chat_id. Listener sẽ không khởi chạy.")
        return

    base_url = f"https://api.telegram.org/bot{token}"
    logger.info("Khởi động Telegram Bot Long Polling Listener...")
    offset = None

    async with httpx.AsyncClient(timeout=35.0) as client:
        while True:
            try:
                params = {"timeout": 20}
                if offset:
                    params["offset"] = offset

                res = await client.get(f"{base_url}/getUpdates", params=params)
                if res.status_code != 200:
                    await asyncio.sleep(3)
                    continue

                data = res.json()
                updates = data.get("result", [])

                for update in updates:
                    offset = update["update_id"] + 1

                    # Xử lý khi Admin bấm nút inline (Callback Query)
                    if "callback_query" in update:
                        cb = update["callback_query"]
                        cb_id = cb["id"]
                        from_user_id = str(cb.get("from", {}).get("id"))
                        cb_data = cb.get("data", "")
                        msg = cb.get("message", {})
                        msg_id = msg.get("message_id")
                        msg_chat_id = msg.get("chat", {}).get("id")
                        orig_text = msg.get("text", "")

                        # Bảo mật: Chỉ Admin sở hữu TELEGRAM_CHAT_ID mới được quyền bấm duyệt
                        if str(from_user_id) != str(admin_chat_id) and str(msg_chat_id) != str(admin_chat_id):
                            await client.post(f"{base_url}/answerCallbackQuery", json={
                                "callback_query_id": cb_id,
                                "text": "⛔ Bạn không có quyền quản trị viên!",
                                "show_alert": True,
                            })
                            continue

                        now_vn = datetime.now(timezone(timedelta(hours=7))).strftime("%d/%m/%Y %H:%M:%S")

                        if cb_data.startswith("approve:"):
                            order_code = cb_data.split(":", 1)[1].strip()
                            result = execute_admin_approval(order_code)

                            alert_text = (
                                f"✅ Đã phê duyệt đơn {order_code} thành công!"
                                if result["success"]
                                else f"Lỗi: {result['message']}"
                            )

                            await client.post(f"{base_url}/answerCallbackQuery", json={
                                "callback_query_id": cb_id,
                                "text": alert_text,
                                "show_alert": True,
                            })

                            if result["success"]:
                                new_text = (
                                    f"{orig_text}\n\n"
                                    f"✅ <b>ĐÃ ĐƯỢC PHÊ DUYỆT BỞI ADMIN</b>\n"
                                    f"⏰ <i>Thời gian duyệt: {now_vn}</i>"
                                )
                                # Sửa tin nhắn và gỡ bỏ 2 nút bấm để không bấm trùng
                                await client.post(f"{base_url}/editMessageText", json={
                                    "chat_id": msg_chat_id,
                                    "message_id": msg_id,
                                    "text": new_text,
                                    "parse_mode": "HTML",
                                    "reply_markup": {"inline_keyboard": []},
                                })

                        elif cb_data.startswith("reject:"):
                            order_code = cb_data.split(":", 1)[1].strip()
                            result = execute_admin_rejection(order_code)

                            await client.post(f"{base_url}/answerCallbackQuery", json={
                                "callback_query_id": cb_id,
                                "text": f"❌ Đã từ chối đơn hàng {order_code}.",
                                "show_alert": True,
                            })

                            new_text = (
                                f"{orig_text}\n\n"
                                f"❌ <b>ĐÃ TỪ CHỐI BỞI ADMIN</b>\n"
                                f"⏰ <i>Thời gian từ chối: {now_vn}</i>"
                            )
                            await client.post(f"{base_url}/editMessageText", json={
                                "chat_id": msg_chat_id,
                                "message_id": msg_id,
                                "text": new_text,
                                "parse_mode": "HTML",
                                "reply_markup": {"inline_keyboard": []},
                            })

            except asyncio.CancelledError:
                logger.info("Telegram Bot listener nhận tín hiệu dừng.")
                break
            except Exception as e:
                logger.error(f"Lỗi trong vòng lặp Telegram listener: {e}")
                await asyncio.sleep(5)
