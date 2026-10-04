import asyncio
import html
import json
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
    token = str(os.getenv("TELEGRAM_BOT_TOKEN", TELEGRAM_BOT_TOKEN) or "").strip()
    admin_chat_id = str(os.getenv("TELEGRAM_CHAT_ID", TELEGRAM_CHAT_ID) or "").strip()

    if not token or not admin_chat_id:
        print("[Telegram Bot] Chưa cấu hình đầy đủ TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID. Listener sẽ không khởi chạy.")
        return

    base_url = f"https://api.telegram.org/bot{token}"
    print(f"[Telegram Bot] Khởi động Telegram Long Polling Listener cho Admin ID: {admin_chat_id}...")

    # Xóa cấu hình webhook cũ để Telegram mở toàn bộ kênh updates (bao gồm callback_query)
    try:
        async with httpx.AsyncClient(timeout=10.0) as init_client:
            del_res = await init_client.post(
                f"{base_url}/deleteWebhook",
                json={"drop_pending_updates": False}
            )
            print(f"[Telegram Bot] Đồng bộ kênh nhận tin Telegram: HTTP {del_res.status_code}")
    except Exception as e:
        print(f"[Telegram Bot] Cảnh báo khi reset webhook: {e}")

    offset = None

    async with httpx.AsyncClient(timeout=35.0) as client:
        while True:
            try:
                # Luôn khai báo rõ ràng allowed_updates để Telegram gửi sự kiện bấm nút (callback_query)
                params = {
                    "timeout": 20,
                    "allowed_updates": ["message", "callback_query"]
                }
                if offset:
                    params["offset"] = offset

                res = await client.post(f"{base_url}/getUpdates", json=params)
                if res.status_code != 200:
                    print(f"[Telegram Bot] getUpdates trả về HTTP {res.status_code}: {res.text[:100]}")
                    await asyncio.sleep(3)
                    continue

                data = res.json()
                updates = data.get("result", [])

                for update in updates:
                    offset = update["update_id"] + 1

                    # Xử lý khi Admin bấm nút inline (Callback Query)
                    if "callback_query" in update:
                        cb = update["callback_query"]
                        cb_id = cb.get("id")
                        from_user = cb.get("from", {})
                        from_user_id = str(from_user.get("id", "")).strip()
                        cb_data = cb.get("data", "")
                        msg = cb.get("message", {})
                        msg_id = msg.get("message_id")
                        msg_chat_id = str(msg.get("chat", {}).get("id", "")).strip()
                        orig_text = msg.get("text", "")

                        print(f"[Telegram Bot] Nhận callback '{cb_data}' từ User: {from_user_id} (Chat: {msg_chat_id})")

                        # Bảo mật: Chỉ Admin sở hữu TELEGRAM_CHAT_ID mới được quyền bấm duyệt
                        if from_user_id != admin_chat_id and msg_chat_id != admin_chat_id:
                            print(f"[Telegram Bot] Từ chối quyền duyệt: from={from_user_id}, chat={msg_chat_id} != admin={admin_chat_id}")
                            try:
                                await client.post(f"{base_url}/answerCallbackQuery", json={
                                    "callback_query_id": cb_id,
                                    "text": "⛔ Bạn không có quyền quản trị viên!",
                                    "show_alert": True,
                                })
                            except Exception as e:
                                logger.error(f"Lỗi answerCallbackQuery: {e}")
                            continue

                        now_vn = datetime.now(timezone(timedelta(hours=7))).strftime("%d/%m/%Y %H:%M:%S")

                        if cb_data.startswith("approve:"):
                            order_code = cb_data.split(":", 1)[1].strip()
                            print(f"[Telegram Bot] Đang thực thi phê duyệt đơn hàng: {order_code}...")
                            result = await asyncio.to_thread(execute_admin_approval, order_code)
                            print(f"[Telegram Bot] Kết quả phê duyệt {order_code}: {result}")

                            alert_text = (
                                f"✅ Đã phê duyệt đơn {order_code} thành công!"
                                if result.get("success")
                                else f"Lỗi: {result.get('message')}"
                            )

                            try:
                                await client.post(f"{base_url}/answerCallbackQuery", json={
                                    "callback_query_id": cb_id,
                                    "text": alert_text,
                                    "show_alert": True,
                                })
                            except Exception as e:
                                print(f"[Telegram Bot] Lỗi answerCallbackQuery: {e}")

                            if result.get("success"):
                                escaped_orig = html.escape(orig_text)
                                new_text = (
                                    f"{escaped_orig}\n\n"
                                    f"✅ <b>ĐÃ ĐƯỢC PHÊ DUYỆT BỞI ADMIN</b>\n"
                                    f"⏰ <i>Thời gian duyệt: {now_vn}</i>"
                                )
                                try:
                                    # Sửa tin nhắn và gỡ bỏ 2 nút bấm để không bấm trùng
                                    chat_target = int(msg_chat_id) if msg_chat_id.lstrip("-").isdigit() else msg_chat_id
                                    await client.post(f"{base_url}/editMessageText", json={
                                        "chat_id": chat_target,
                                        "message_id": msg_id,
                                        "text": new_text,
                                        "parse_mode": "HTML",
                                        "reply_markup": {"inline_keyboard": []},
                                    })
                                except Exception as e:
                                    print(f"[Telegram Bot] Lỗi editMessageText: {e}")

                        elif cb_data.startswith("reject:"):
                            order_code = cb_data.split(":", 1)[1].strip()
                            print(f"[Telegram Bot] Đang thực thi từ chối đơn hàng: {order_code}...")
                            result = await asyncio.to_thread(execute_admin_rejection, order_code)
                            print(f"[Telegram Bot] Kết quả từ chối {order_code}: {result}")

                            try:
                                await client.post(f"{base_url}/answerCallbackQuery", json={
                                    "callback_query_id": cb_id,
                                    "text": f"❌ Đã từ chối đơn hàng {order_code}.",
                                    "show_alert": True,
                                })
                            except Exception as e:
                                print(f"[Telegram Bot] Lỗi answerCallbackQuery: {e}")

                            escaped_orig = html.escape(orig_text)
                            new_text = (
                                f"{escaped_orig}\n\n"
                                f"❌ <b>ĐÃ TỪ CHỐI BỞI ADMIN</b>\n"
                                f"⏰ <i>Thời gian từ chối: {now_vn}</i>"
                            )
                            try:
                                chat_target = int(msg_chat_id) if msg_chat_id.lstrip("-").isdigit() else msg_chat_id
                                await client.post(f"{base_url}/editMessageText", json={
                                    "chat_id": chat_target,
                                    "message_id": msg_id,
                                    "text": new_text,
                                    "parse_mode": "HTML",
                                    "reply_markup": {"inline_keyboard": []},
                                })
                            except Exception as e:
                                print(f"[Telegram Bot] Lỗi editMessageText: {e}")

            except asyncio.CancelledError:
                print("[Telegram Bot] Listener nhận tín hiệu dừng.")
                break
            except httpx.TimeoutException:
                # Long polling timeout tự nhiên khi không có update mới
                continue
            except httpx.NetworkError as ne:
                print(f"[Telegram Bot] Gián đoạn mạng tới Telegram API: {ne}. Thử lại sau 3s...")
                await asyncio.sleep(3)
            except Exception as e:
                print(f"[Telegram Bot] Ngoại lệ trong vòng lặp Telegram listener: {e}")
                await asyncio.sleep(3)
