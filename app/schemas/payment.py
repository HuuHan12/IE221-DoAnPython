from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field



# 1. PRICING PLANS SCHEMAS
class PricingPlanItem(BaseModel):
    code: str = Field(..., description="Mã định danh gói (free, pro, enterprise)")
    name: str = Field(..., description="Tên gói hiển thị (Free, Pro, Enterprise)")
    tagline: Optional[str] = Field(default=None, description="Mô tả ngắn đối tượng người dùng")
    price: int = Field(..., description="Giá tiền (0 cho gói Free/Enterprise)")
    currency: str = Field(default="VND", description="Đơn vị tiền tệ")
    formatted_price: str = Field(..., description="Chuỗi hiển thị giá tiền (0đ, 99.000đ, Liên hệ)")
    billing_period: str = Field(default="tháng", description="Chu kỳ tính phí")
    duration_days: int = Field(default=30, description="Thời hạn sử dụng tính theo ngày")
    scan_limit_per_day: int = Field(..., description="Giới hạn lượt quét ảnh mỗi ngày (-1 là không giới hạn)")
    max_resolution: Optional[str] = Field(default=None, description="Độ phân giải ảnh tối đa")
    gps_radius: Optional[str] = Field(default=None, description="Bán kính sai số định vị GPS")
    history_limit: Optional[int] = Field(default=None, description="Số lượng bản ghi lịch sử lưu trữ")
    features: List[str] = Field(default_factory=list, description="Danh sách các tính năng chi tiết")
    badge: Optional[str] = Field(default=None, description="Huy hiệu nổi bật (ví dụ: PHỔ BIẾN NHẤT)")
    is_active: bool = Field(default=True, description="Trạng thái mở bán gói")


class PricingPlansResponse(BaseModel):
    status: str = Field(default="success")
    total_plans: int
    data: List[PricingPlanItem]



# 2. thanh toán QR

class CreatePaymentQRRequest(BaseModel):
    plan_code: str = Field(default="pro", description="Mã gói cần đăng ký (mặc định: pro)")
    duration_months: int = Field(default=1, ge=1, le=12, description="Số tháng đăng ký (1 - 12)")


class BankInfo(BaseModel):
    bank_id: str = Field(..., description="Mã ngân hàng (ví dụ: TPB, VCB, MB)")
    bank_name: str = Field(..., description="Tên đầy đủ ngân hàng thụ hưởng")
    account_no: str = Field(..., description="Số tài khoản nhận tiền")
    account_name: str = Field(..., description="Tên chủ tài khoản nhận tiền")


class PaymentQRResponse(BaseModel):
    status: str = Field(default="success")
    order_code: str = Field(..., description="Mã đơn hàng duy nhất dùng để đối soát")
    plan_code: str = Field(..., description="Mã gói cước")
    plan_name: str = Field(..., description="Tên gói cước")
    amount: int = Field(..., description="Số tiền thanh toán")
    formatted_amount: str = Field(..., description="Số tiền đã định dạng (ví dụ: 99.000 đ)")
    currency: str = Field(default="VND", description="Đơn vị tiền tệ")
    qr_url: str = Field(..., description="Đường dẫn ảnh mã QR chuẩn VietQR Napas 247")
    bank_info: BankInfo = Field(..., description="Thông tin ngân hàng thụ hưởng")
    payment_content: str = Field(..., description="Nội dung chuyển khoản bắt buộc điền đúng")
    expires_at: str = Field(..., description="Thời điểm hết hạn đơn hàng (ISO 8601)")
    expires_in_seconds: int = Field(default=900, description="Số giây còn lại trước khi hết hạn (15 phút)")



# 3. trạng thái thanh toán & đăng ký
class PaymentStatusResponse(BaseModel):
    status: str = Field(default="success")
    order_code: str = Field(..., description="Mã đơn hàng")
    order_status: str = Field(..., description="Trạng thái: pending, completed, expired, cancelled")
    plan_code: str = Field(..., description="Mã gói cước")
    amount: int = Field(..., description="Số tiền thanh toán")
    is_completed: bool = Field(..., description="True nếu đã thanh toán thành công")
    completed_at: Optional[str] = Field(default=None, description="Thời điểm hoàn tất thanh toán")


class SimulatePaymentRequest(BaseModel):
    order_code: str = Field(..., description="Mã đơn hàng cần giả lập kích hoạt thành công")


class UserSubscriptionResponse(BaseModel):
    status: str = Field(default="success")
    user_id: str
    plan_code: str = Field(..., description="Mã gói hiện tại: free, pro, enterprise")
    plan_name: str = Field(..., description="Tên gói hiện tại")
    subscription_status: str = Field(..., description="Trạng thái gói: active, expired")
    scan_limit_per_day: int = Field(..., description="Giới hạn lượt quét / ngày của gói")
    start_date: Optional[str] = Field(default=None, description="Ngày bắt đầu kích hoạt")
    end_date: Optional[str] = Field(default=None, description="Ngày hết hạn gói")
    days_remaining: Optional[int] = Field(default=None, description="Số ngày sử dụng còn lại")
    is_active: bool = Field(default=True, description="Gói còn hiệu lực hay không")
