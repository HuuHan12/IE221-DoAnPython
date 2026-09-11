from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class ContactFormCreate(BaseModel):
    """Schema dữ liệu gửi lời nhắn liên hệ từ giao diện."""

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Họ và tên người gửi",
        examples=["Nguyễn Văn A"],
    )
    email: EmailStr = Field(
        ...,
        description="Email người gửi để nhóm dự án liên hệ lại",
        examples=["ban@email.com"],
    )
    subject: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Chủ đề lời nhắn",
        examples=["Báo lỗi kỹ thuật"],
    )
    phone: Optional[str] = Field(
        default=None,
        max_length=20,
        description="Số điện thoại liên hệ (không bắt buộc)",
        examples=["0935901051"],
    )
    message: str = Field(
        ...,
        min_length=5,
        max_length=3000,
        description="Nội dung lời nhắn chi tiết",
        examples=["Mô tả chi tiết vấn đề, kèm tên địa danh hoặc mã kết quả scan nếu có..."],
    )


class ContactMessageItem(BaseModel):
    """Schema thông tin lời nhắn đã được lưu trữ."""

    id: str
    user_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str
    status: str
    created_at: Optional[str] = None


class ContactSubmitResponse(BaseModel):
    """Schema phản hồi sau khi gửi lời nhắn thành công."""

    status: str = "success"
    message: str = "Gửi lời nhắn thành công! Nhóm dự án sẽ phản hồi cho bạn qua email sớm nhất."
    data: Optional[ContactMessageItem] = None


class ContactSubjectsResponse(BaseModel):
    """Schema trả về danh sách các chủ đề liên hệ."""

    status: str = "success"
    subjects: List[str]
