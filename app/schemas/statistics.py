from typing import Optional
from pydantic import BaseModel, Field


# Cấu trúc dữ liệu cho từng thẻ KPI đơn lẻ
class KPICardItem(BaseModel):
    value: int = Field(..., description="Giá trị số liệu thực tế trong kỳ hiện tại")
    growth_percentage: float = Field(..., description="Phần trăm tăng/giảm so với kỳ trước")
    is_increase: bool = Field(..., description="True nếu tăng trưởng, False nếu sụt giảm")


# Cấu trúc dữ liệu tổng hợp cho cả 4 thẻ KPI trên Dashboard
class StatisticsOverviewData(BaseModel):
    total_scans: KPICardItem = Field(..., description="1. Tổng lượt quét ảnh địa danh")
    active_users: KPICardItem = Field(..., description="2. Số lượng người dùng hoạt động")
    total_searches: KPICardItem = Field(..., description="3. Tổng số lượt tìm kiếm")
    favorite_places: KPICardItem = Field(..., description="4. Số lượt lưu địa điểm yêu thích mới")


# Cấu trúc Response chuẩn trả về cho Frontend
class StatisticsOverviewResponse(BaseModel):
    status: str = Field(default="success", description="Trạng thái phản hồi (success/error)")
    data: StatisticsOverviewData


# Cấu trúc dữ liệu cho từng điểm trên biểu đồ đường
class SearchTrendItem(BaseModel):
    period: str = Field(..., description="Mốc thời gian (YYYY-MM-DD cho ngày, YYYY-Www cho tuần, YYYY-MM cho tháng)")
    total: int = Field(..., description="Tổng số lượt tìm kiếm trong mốc thời gian này")


# Cấu trúc Response trả về cho biểu đồ tần suất tìm kiếm theo thời gian
class SearchTrendsResponse(BaseModel):
    status: str = Field(default="success", description="Trạng thái phản hồi (success/error)")
    group_by: str = Field(default="day", description="Kiểu nhóm thời gian (day/week/month)")
    data: list[SearchTrendItem] = Field(..., description="Danh sách các điểm dữ liệu vẽ biểu đồ đường")


# Cấu trúc dữ liệu cho từng địa điểm trong Top địa điểm tìm kiếm
class TopPlaceItem(BaseModel):
    place_id: str = Field(..., description="ID định danh của địa danh (UUID)")
    name: str = Field(..., description="Tên địa danh")
    province: Optional[str] = Field(default=None, description="Tỉnh/Thành phố của địa danh")
    search_count: int = Field(..., description="Tổng số lượt tìm kiếm của địa danh này")


# Cấu trúc Response trả về cho Top địa điểm tìm kiếm
class TopPlacesResponse(BaseModel):
    status: str = Field(default="success", description="Trạng thái phản hồi (success/error)")
    total_places: int = Field(..., description="Số lượng địa điểm trả về")
    data: list[TopPlaceItem] = Field(..., description="Danh sách Top địa điểm được tìm kiếm nhiều nhất")


# Cấu trúc dữ liệu cho từng danh mục trong cơ cấu tìm kiếm
class CategoryDistributionItem(BaseModel):
    category_id: Optional[str] = Field(default=None, description="ID định danh của danh mục (UUID)")
    name: str = Field(..., description="Tên danh mục (Di tích lịch sử, Văn hóa, Kiến trúc...)")
    count: int = Field(..., description="Số lượt tìm kiếm thuộc danh mục này")
    percentage: float = Field(..., description="Tỷ lệ phần trăm đóng góp (%)")


# Cấu trúc Response trả về cho cơ cấu lượt tìm kiếm theo danh mục
class CategoryDistributionResponse(BaseModel):
    status: str = Field(default="success", description="Trạng thái phản hồi (success/error)")
    total_searches: int = Field(..., description="Tổng số lượt tìm kiếm có phân loại danh mục")
    data: list[CategoryDistributionItem] = Field(..., description="Danh sách phân bổ lượt tìm kiếm theo danh mục")
