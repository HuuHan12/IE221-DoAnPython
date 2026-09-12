import os
import random
import string
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database.supabase import get_current_user, get_supabase_admin_client
from app.schemas.payment import (
    BankInfo,
    CreatePaymentQRRequest,
    PaymentQRResponse,
    PaymentStatusResponse,
    PricingPlanItem,
    PricingPlansResponse,
    SimulatePaymentRequest,
    UserSubscriptionResponse,
)

router = APIRouter(prefix="/payments", tags=["Payments & Pricing"])

# Cấu hình thông tin ngân hàng thụ hưởng (TPBank)
BANK_ID = os.getenv("BANK_ID", "TPB")
BANK_NAME = os.getenv("BANK_NAME", "Ngân hàng TMCP Tiên Phong (TPBank)")
BANK_ACCOUNT_NO = os.getenv("BANK_ACCOUNT_NO", "87971498888")
BANK_ACCOUNT_NAME = os.getenv("BANK_ACCOUNT_NAME", "DOAN HUU HAN")
VIETQR_TEMPLATE = os.getenv("VIETQR_TEMPLATE", "compact2")


def _generate_order_code(plan_code: str = "PRO") -> str:
    """Sinh mã đơn hàng ngẫu nhiên ngắn gọn (ví dụ: PRO879124) làm nội dung chuyển khoản."""
    random_digits = "".join(random.choices(string.digits, k=6))
    prefix = plan_code.upper()[:3]
    return f"{prefix}{random_digits}"


def _build_vietqr_url(bank_id: str, account_no: str, amount: int, content: str, account_name: str) -> str:
    """Tạo link hình ảnh mã QR động theo chuẩn VietQR Napas 247."""
    encoded_content = urllib.parse.quote(content)
    encoded_name = urllib.parse.quote(account_name)
    return (
        f"https://img.vietqr.io/image/{bank_id}-{account_no}-{VIETQR_TEMPLATE}.png"
        f"?amount={amount}&addInfo={encoded_content}&accountName={encoded_name}"
    )



# 1. Lấy dữ liệu Bảng giá
@router.get(
    "/plans",
    response_model=PricingPlansResponse,
    summary="Danh sách các gói cước dịch vụ",
    description="Truy vấn bảng subscription_plans từ Supabase để lấy danh sách các gói Free, Pro, Enterprise.",
)
def get_pricing_plans():
    supabase = get_supabase_admin_client()

    try:
        response = (
            supabase.table("subscription_plans")
            .select("*")
            .eq("is_active", True)
            .order("price")
            .execute()
        )
        rows = response.data or []
        items = []

        for row in rows:
            price = int(row.get("price", 0))
            if price == 0 and row.get("code") == "enterprise":
                formatted_price = "Liên hệ"
            elif price > 0:
                formatted_price = f"{price:,}đ".replace(",", ".")
            else:
                formatted_price = "0đ"

            items.append(
                PricingPlanItem(
                    code=row["code"],
                    name=row["name"],
                    tagline=row.get("tagline"),
                    price=price,
                    currency=row.get("currency", "VND"),
                    formatted_price=formatted_price,
                    billing_period=row.get("billing_period", "tháng"),
                    duration_days=row.get("duration_days", 30),
                    scan_limit_per_day=row.get("scan_limit_per_day", 10),
                    max_resolution=row.get("max_resolution"),
                    gps_radius=row.get("gps_radius"),
                    history_limit=row.get("history_limit"),
                    features=row.get("features") or [],
                    badge=row.get("badge"),
                    is_active=row.get("is_active", True),
                )
            )

        return PricingPlansResponse(
            status="success",
            total_plans=len(items),
            data=items,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi truy vấn danh sách gói cước từ Supabase: {str(e)}",
        )



# 2. Tạo đơn hàng & sinh mã VietQR
@router.post(
    "/create-qr",
    response_model=PaymentQRResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo mã QR thanh toán gói cước",
    description="Tạo bản ghi vào payment_orders trên Supabase và sinh URL mã QR VietQR Napas 247.",
)
def create_payment_qr(
    payload: Optional[CreatePaymentQRRequest] = None,
    current_user=Depends(get_current_user),
):
    if payload is None:
        payload = CreatePaymentQRRequest()

    supabase = get_supabase_admin_client()
    plan_code = payload.plan_code.lower()

    # 1. Kiểm tra gói cước trong Supabase
    try:
        plan_res = (
            supabase.table("subscription_plans")
            .select("*")
            .eq("code", plan_code)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi kết nối Supabase: {str(e)}",
        )

    if not plan_res or not plan_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Gói cước '{payload.plan_code}' không tồn tại trong hệ thống.",
        )

    plan = plan_res.data
    price = int(plan.get("price", 0))

    if price <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gói Free hoặc Enterprise không yêu cầu thanh toán qua mã QR.",
        )

    # 2. Tính số tiền & sinh mã đơn hàng
    amount = price * payload.duration_months
    formatted_amount = f"{amount:,} đ".replace(",", ".")
    order_code = _generate_order_code(plan_code)
    payment_content = order_code

    # 3. Thời gian hết hạn (15 phút)
    now = datetime.now(timezone.utc)
    expires_at_iso = (now + timedelta(minutes=15)).isoformat()

    # 4. Sinh URL ảnh VietQR Napas 247
    qr_url = _build_vietqr_url(
        bank_id=BANK_ID,
        account_no=BANK_ACCOUNT_NO,
        amount=amount,
        content=payment_content,
        account_name=BANK_ACCOUNT_NAME,
    )

    # 5. Lưu đơn hàng vào bảng payment_orders trên Supabase
    order_insert = {
        "order_code": order_code,
        "user_id": str(current_user.id),
        "plan_code": plan_code,
        "amount": amount,
        "currency": "VND",
        "status": "pending",
        "payment_method": "vietqr",
        "bank_id": BANK_ID,
        "bank_account_no": BANK_ACCOUNT_NO,
        "bank_account_name": BANK_ACCOUNT_NAME,
        "payment_content": payment_content,
        "qr_url": qr_url,
        "expires_at": expires_at_iso,
    }

    try:
        order_res = supabase.table("payment_orders").insert(order_insert).execute()
        if not order_res.data:
            raise RuntimeError("Lưu đơn hàng vào Supabase không trả về dữ liệu")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tạo đơn hàng trên Supabase: {str(e)}",
        )

    bank_info = BankInfo(
        bank_id=BANK_ID,
        bank_name=BANK_NAME,
        account_no=BANK_ACCOUNT_NO,
        account_name=BANK_ACCOUNT_NAME,
    )

    return PaymentQRResponse(
        status="success",
        order_code=order_code,
        plan_code=plan_code,
        plan_name=plan.get("name", "Pro"),
        amount=amount,
        formatted_amount=formatted_amount,
        currency="VND",
        qr_url=qr_url,
        bank_info=bank_info,
        payment_content=payment_content,
        expires_at=expires_at_iso,
        expires_in_seconds=900,
    )


# 3. Kiểm tra trạng thái đơn
@router.get(
    "/status/{order_code}",
    response_model=PaymentStatusResponse,
    summary="Kiểm tra trạng thái thanh toán",
    description="Truy vấn Supabase kiểm tra đơn hàng đã hoàn tất (completed) hay chưa.",
)
def check_payment_status(order_code: str):
    supabase = get_supabase_admin_client()

    try:
        res = (
            supabase.table("payment_orders")
            .select("*")
            .eq("order_code", order_code)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi kết nối Supabase: {str(e)}",
        )

    if not res or not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy đơn hàng với mã: {order_code}",
        )

    order = res.data
    order_status = order.get("status", "pending")

    # Kiểm tra quá hạn 15 phút nếu vẫn đang pending
    if order_status == "pending":
        expires_at_raw = order.get("expires_at")
        if expires_at_raw:
            try:
                exp_dt = datetime.fromisoformat(expires_at_raw.replace("Z", "+00:00"))
                if datetime.now(timezone.utc) > exp_dt:
                    order_status = "expired"
            except Exception:
                pass

    return PaymentStatusResponse(
        status="success",
        order_code=order["order_code"],
        order_status=order_status,
        plan_code=order["plan_code"],
        amount=int(order["amount"]),
        is_completed=(order_status == "completed"),
        completed_at=order.get("completed_at"),
    )



# 4. Giả lập thanh toán
@router.post(
    "/simulate-success",
    response_model=PaymentStatusResponse,
    summary="Giả lập thanh toán thành công (Phục vụ Demo)",
    description="Cập nhật payment_orders sang 'completed' và kích hoạt gói cước trong user_subscriptions trên Supabase.",
)
def simulate_payment_success(
    payload: Optional[SimulatePaymentRequest] = None,
    order_code: Optional[str] = Query(None, description="Mã đơn hàng (nếu truyền trên URL)"),
):
    target_code = None
    if payload and payload.order_code:
        target_code = payload.order_code.strip()
    elif order_code:
        target_code = order_code.strip()

    if not target_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng cung cấp mã đơn hàng 'order_code' (ví dụ: PRO125419 trong JSON body hoặc ?order_code=PRO125419).",
        )

    supabase = get_supabase_admin_client()
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. Tìm đơn hàng
    try:
        order_res = (
            supabase.table("payment_orders")
            .select("*")
            .eq("order_code", target_code)
            .maybe_single()
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi kết nối Supabase: {str(e)}",
        )

    if not order_res or not order_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy đơn hàng với mã: {target_code}",
        )

    order = order_res.data
    user_id = str(order["user_id"])
    plan_code = order["plan_code"]

    # 2. Tìm thời hạn gói cước
    duration_days = 30
    try:
        plan_res = (
            supabase.table("subscription_plans")
            .select("duration_days")
            .eq("code", plan_code)
            .maybe_single()
            .execute()
        )
        if plan_res and plan_res.data:
            duration_days = int(plan_res.data.get("duration_days", 30))
    except Exception:
        pass

    end_date_iso = (datetime.now(timezone.utc) + timedelta(days=duration_days)).isoformat()

    # 3. Cập nhật trạng thái completed cho đơn hàng
    try:
        supabase.table("payment_orders").update({
            "status": "completed",
            "completed_at": now_iso,
            "updated_at": now_iso,
        }).eq("order_code", target_code).execute()

        # 4. Cập nhật hoặc thêm mới vào bảng user_subscriptions
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

        # Tự động gửi thông báo chúc mừng vào hòm thư người dùng
        try:
            from app.api.notifications import create_user_notification
            create_user_notification(
                user_id=user_id,
                notif_type="payment",
                title=f"Kích hoạt thành công gói {plan_code.upper()}!",
                content=f"Đơn hàng {target_code} đã hoàn tất. Bạn có {duration_days} ngày sử dụng các tính năng nâng cao.",
            )
        except Exception:
            pass

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi kích hoạt gói cước trên Supabase: {str(e)}",
        )


    return PaymentStatusResponse(
        status="success",
        order_code=target_code,
        order_status="completed",
        plan_code=plan_code,
        amount=int(order["amount"]),
        is_completed=True,
        completed_at=now_iso,
    )



# 5. Lấy gói cước hiện tại của user
@router.get(
    "/my-subscription",
    response_model=UserSubscriptionResponse,
    summary="Thông tin gói cước hiện tại của người dùng",
    description="Truy vấn user_subscriptions từ Supabase để lấy gói dịch vụ đang kích hoạt.",
)
def get_my_subscription(current_user=Depends(get_current_user)):
    supabase = get_supabase_admin_client()
    user_id_str = str(current_user.id)

    sub = None
    try:
        res = (
            supabase.table("user_subscriptions")
            .select("*")
            .eq("user_id", user_id_str)
            .maybe_single()
            .execute()
        )
        if res and res.data:
            sub = res.data
    except Exception:
        pass

    if sub:
        plan_code = sub.get("plan_code", "free")
        end_date_str = sub.get("end_date")
        days_remaining = None

        if end_date_str:
            try:
                end_dt = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
                delta = end_dt - datetime.now(timezone.utc)
                days_remaining = max(0, delta.days)
            except Exception:
                pass

        # Lấy thông tin scan limit của gói
        scan_limit = 500 if plan_code == "pro" else 10 if plan_code == "free" else -1
        try:
            p_res = (
                supabase.table("subscription_plans")
                .select("scan_limit_per_day, name")
                .eq("code", plan_code)
                .maybe_single()
                .execute()
            )
            if p_res and p_res.data:
                scan_limit = p_res.data.get("scan_limit_per_day", scan_limit)
                plan_name = p_res.data.get("name", plan_code.title())
            else:
                plan_name = plan_code.title()
        except Exception:
            plan_name = plan_code.title()

        return UserSubscriptionResponse(
            status="success",
            user_id=user_id_str,
            plan_code=plan_code,
            plan_name=plan_name,
            subscription_status=sub.get("status", "active"),
            scan_limit_per_day=scan_limit,
            start_date=sub.get("start_date"),
            end_date=end_date_str,
            days_remaining=days_remaining,
            is_active=sub.get("status") == "active" and (days_remaining is None or days_remaining > 0),
        )

    # Mặc định là gói Free
    return UserSubscriptionResponse(
        status="success",
        user_id=user_id_str,
        plan_code="free",
        plan_name="Free",
        subscription_status="active",
        scan_limit_per_day=10,
        start_date=None,
        end_date=None,
        days_remaining=None,
        is_active=True,
    )
