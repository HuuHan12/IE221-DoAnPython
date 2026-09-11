from typing import List, Optional
from pydantic import BaseModel, Field


class NotificationItem(BaseModel):
    """Schema chi tiết của một thông báo."""

    id: str
    user_id: str
    type: str = Field(
        ...,
        description="Loại thông báo: payment | contact | system | achievement",
        examples=["payment"],
    )
    title: str = Field(
        ...,
        description="Tiêu đề thông báo",
        examples=["Thanh toán thành công"],
    )
    content: Optional[str] = Field(
        default=None,
        description="Nội dung chi tiết của thông báo",
        examples=["Bạn đã kích hoạt thành công gói Pro (30 ngày)."],
    )
    is_read: bool = Field(
        default=False,
        description="Trạng thái đã đọc hay chưa",
    )
    read_at: Optional[str] = Field(
        default=None,
        description="Thời điểm người dùng đọc thông báo",
    )
    created_at: Optional[str] = Field(
        default=None,
        description="Thời điểm thông báo được tạo",
    )


class NotificationListResponse(BaseModel):
    """Schema danh sách thông báo kèm số lượng chưa đọc."""

    status: str = "success"
    unread_count: int = Field(
        ...,
        description="Số lượng thông báo chưa đọc",
    )
    total: int = Field(
        ...,
        description="Tổng số thông báo trả về",
    )
    data: List[NotificationItem] = Field(
        default_factory=list,
        description="Danh sách các thông báo",
    )


class UnreadCountResponse(BaseModel):
    """Schema số lượng thông báo chưa đọc (dành riêng cho Header)."""

    status: str = "success"
    unread_count: int = Field(
        ...,
        description="Số lượng thông báo chưa đọc",
        examples=[2],
    )


class MarkReadResponse(BaseModel):
    """Schema phản hồi sau khi đánh dấu đã đọc."""

    status: str = "success"
    message: str = "Đã cập nhật trạng thái thông báo thành công."
