from typing import List, Optional
from pydantic import BaseModel, Field


class AchievementItem(BaseModel):
    """Schema chi tiết của một danh hiệu/huy hiệu."""

    id: str
    code: str = Field(
        ...,
        description="Mã định danh duy nhất của huy hiệu",
        examples=["STREAK_7"],
    )
    name: str = Field(
        ...,
        description="Tên danh hiệu",
        examples=["Kiên trì 7 ngày"],
    )
    description: Optional[str] = Field(
        default=None,
        description="Mô tả điều kiện đạt danh hiệu",
        examples=["Đăng nhập và check-in liên tục 7 ngày"],
    )
    achievement_type: str = Field(
        ...,
        description="Loại thành tích: streak | count | places | rank",
        examples=["streak"],
    )
    target_value: int = Field(
        ...,
        description="Mốc giá trị cần đạt để mở khóa",
        examples=[7],
    )
    progress: int = Field(
        default=0,
        description="Tiến độ hiện tại của người dùng",
        examples=[3],
    )
    progress_percent: float = Field(
        default=0.0,
        description="Phần trăm tiến độ hoàn thành (0 - 100%)",
        examples=[42.9],
    )
    is_unlocked: bool = Field(
        default=False,
        description="Đã mở khóa hay chưa",
    )
    unlocked_at: Optional[str] = Field(
        default=None,
        description="Thời điểm mở khóa huy hiệu",
    )


class UserAchievementsResponse(BaseModel):
    """Schema danh sách huy hiệu và thống kê thành tích của user."""

    status: str = "success"
    total_achievements: int = Field(
        ...,
        description="Tổng số huy hiệu có trong hệ thống",
        examples=[7],
    )
    unlocked_count: int = Field(
        ...,
        description="Số lượng huy hiệu người dùng đã mở khóa",
        examples=[2],
    )
    completion_rate: float = Field(
        ...,
        description="Tỷ lệ hoàn thành tổng thể (%)",
        examples=[28.6],
    )
    data: List[AchievementItem] = Field(
        default_factory=list,
        description="Danh sách chi tiết 7 huy hiệu",
    )


class RecordCheckinResponse(BaseModel):
    """Schema phản hồi sau khi ghi nhận một lượt check-in mới."""

    status: str = "success"
    message: str
    total_checkins: int
    new_unlocked: List[str] = Field(
        default_factory=list,
        description="Danh sách mã các huy hiệu vừa mới được mở khóa (nếu có)",
    )
