import io
from datetime import date, datetime, time, timedelta
from typing import Optional, Tuple
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.core.security import get_current_user, get_current_user_with_plan
from app.database.supabase import get_supabase_admin_client
from app.schemas.statistics import (
    CategoryDistributionItem,
    CategoryDistributionResponse,
    KPICardItem,
    SearchTrendItem,
    SearchTrendsResponse,
    StatisticsOverviewData,
    StatisticsOverviewResponse,
    TopPlaceItem,
    TopPlacesResponse,
)

router = APIRouter(prefix="/statistics", tags=["Statistics"])


# Hàm kiểm tra và chuẩn hóa khoảng thời gian
def _validate_date_range(from_date: Optional[date], to_date: Optional[date]) -> Tuple[date, date]:
    today = date.today()

    # Kiểm tra thời gian kết thúc không được vượt quá ngày hiện tại
    if to_date is not None and to_date > today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lỗi tham số: Ngày kết thúc (to_date) không được vượt quá ngày hiện tại!"
        )

    # Gán giá trị mặc định nếu để trống
    if to_date is None:
        to_date = today
    if from_date is None:
        from_date = to_date - timedelta(days=29)

    # Kiểm tra ngày bắt đầu không lớn hơn ngày kết thúc
    if from_date > to_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Lỗi tham số: Ngày bắt đầu (from_date) không được lớn hơn ngày kết thúc (to_date)!"
        )
    return from_date, to_date


# Tính phần trăm tăng/giảm giữa kỳ hiện tại và kỳ trước
# Xử lý chống lỗi chia cho 0
def _calculate_growth(curr: int, prev: int) -> Tuple[float, bool]:
    if prev == 0:
        if curr > 0:
            return 100.0, True
        return 0.0, True

    diff = curr - prev
    pct = (diff / prev) * 100.0
    is_increase = pct >= 0
    return round(abs(pct), 1), is_increase


# 1. 4 thẻ số liệu tổng quan cá nhân
@router.get(
    "/overview",
    response_model=StatisticsOverviewResponse,
    summary="4 Thẻ số liệu tổng quan của người dùng",
    description="Tính toán 4 chỉ số KPI của người dùng hiện tại trong khoảng thời gian [from_date -> to_date] và % tăng/giảm so với kỳ trước."
)
async def get_overview(
    from_date: Optional[date] = Query(
        None, 
        description="Ngày bắt đầu (Định dạng YYYY-MM-DD). Mặc định: 30 ngày trước"
    ),
    from_date_hyphen: Optional[date] = Query(None, alias="from-date", include_in_schema=False),
    to_date: Optional[date] = Query(
        None, 
        description="Ngày kết thúc (Định dạng YYYY-MM-DD). Mặc định: Ngày hôm nay"
    ),
    to_date_hyphen: Optional[date] = Query(None, alias="to-date", include_in_schema=False),
    current_user=Depends(get_current_user),
):
    from_date = from_date or from_date_hyphen
    to_date = to_date or to_date_hyphen
    from_date, to_date = _validate_date_range(from_date, to_date)
    user_id = str(current_user.id)

    try:
        supabase = get_supabase_admin_client()

        curr_start_dt = datetime.combine(from_date, time.min)
        curr_end_dt = datetime.combine(to_date, time.max)
        curr_start_iso = curr_start_dt.isoformat()
        curr_end_iso = curr_end_dt.isoformat()

        # Xác định mốc thời gian kỳ trước đó (Cùng số ngày)
        total_days = (to_date - from_date).days + 1
        prev_start_dt = curr_start_dt - timedelta(days=total_days)
        prev_end_dt = curr_start_dt - timedelta(microseconds=1)
        prev_start_iso = prev_start_dt.isoformat()
        prev_end_iso = prev_end_dt.isoformat()

        # Truy vấn số liệu theo user_id
        # 1. Tổng lượt quét của user (tính từ bảng log tích lũy user_daily_scan_logs, không bị giảm khi xóa lịch sử)
        scans_curr = (
            supabase.table("user_daily_scan_logs")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("scanned_at", curr_start_iso)
            .lte("scanned_at", curr_end_iso)
            .execute()
        )
        scans_prev = (
            supabase.table("user_daily_scan_logs")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("scanned_at", prev_start_iso)
            .lte("scanned_at", prev_end_iso)
            .execute()
        )
        val_scans_curr = scans_curr.count or 0
        val_scans_prev = scans_prev.count or 0

        # 2. Số ngày người dùng có hoạt động tìm kiếm
        dates_curr = (
            supabase.table("search_histories")
            .select("searched_at")
            .eq("user_id", user_id)
            .gte("searched_at", curr_start_iso)
            .lte("searched_at", curr_end_iso)
            .execute()
        )
        distinct_users_curr = len({row["searched_at"][:10] for row in (dates_curr.data or []) if row.get("searched_at")})

        dates_prev = (
            supabase.table("search_histories")
            .select("searched_at")
            .eq("user_id", user_id)
            .gte("searched_at", prev_start_iso)
            .lte("searched_at", prev_end_iso)
            .execute()
        )
        distinct_users_prev = len({row["searched_at"][:10] for row in (dates_prev.data or []) if row.get("searched_at")})

        # 3. Tổng số lượt tìm kiếm của user
        searches_curr = (
            supabase.table("search_histories")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("searched_at", curr_start_iso)
            .lte("searched_at", curr_end_iso)
            .execute()
        )
        searches_prev = (
            supabase.table("search_histories")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("searched_at", prev_start_iso)
            .lte("searched_at", prev_end_iso)
            .execute()
        )
        val_searches_curr = searches_curr.count or 0
        val_searches_prev = searches_prev.count or 0

        # 4. Địa điểm yêu thích của user
        fav_curr = (
            supabase.table("user_favorites")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("created_at", curr_start_iso)
            .lte("created_at", curr_end_iso)
            .execute()
        )
        fav_prev = (
            supabase.table("user_favorites")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("created_at", prev_start_iso)
            .lte("created_at", prev_end_iso)
            .execute()
        )
        val_fav_curr = fav_curr.count or 0
        val_fav_prev = fav_prev.count or 0

        # Tính toán % tăng trưởng
        pct_scans, is_inc_scans = _calculate_growth(val_scans_curr, val_scans_prev)
        pct_users, is_inc_users = _calculate_growth(distinct_users_curr, distinct_users_prev)
        pct_searches, is_inc_searches = _calculate_growth(val_searches_curr, val_searches_prev)
        pct_fav, is_inc_fav = _calculate_growth(val_fav_curr, val_fav_prev)

        return StatisticsOverviewResponse(
            status="success",
            data=StatisticsOverviewData(
                total_scans=KPICardItem(
                    value=val_scans_curr,
                    growth_percentage=pct_scans,
                    is_increase=is_inc_scans,
                ),
                active_users=KPICardItem(
                    value=distinct_users_curr,
                    growth_percentage=pct_users,
                    is_increase=is_inc_users,
                ),
                total_searches=KPICardItem(
                    value=val_searches_curr,
                    growth_percentage=pct_searches,
                    is_increase=is_inc_searches,
                ),
                favorite_places=KPICardItem(
                    value=val_fav_curr,
                    growth_percentage=pct_fav,
                    is_increase=is_inc_fav,
                ),
            ),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi máy chủ khi truy vấn số liệu thống kê: {str(e)}"
        )


# 2. Biểu đồ tần suất tìm kiếm theo thời gian của user
@router.get(
    "/search-trends",
    response_model=SearchTrendsResponse,
    summary="Biểu đồ tần suất tìm kiếm của người dùng",
    description="Gom nhóm số lượng lượt tìm kiếm của người dùng theo ngày, tuần hoặc tháng."
)
async def get_search_trends(
    from_date: Optional[date] = Query(
        None, 
        description="Ngày bắt đầu (Định dạng YYYY-MM-DD). Mặc định: 30 ngày trước"
    ),
    from_date_hyphen: Optional[date] = Query(None, alias="from-date", include_in_schema=False),
    to_date: Optional[date] = Query(
        None, 
        description="Ngày kết thúc (Định dạng YYYY-MM-DD). Mặc định: Ngày hôm nay"
    ),
    to_date_hyphen: Optional[date] = Query(None, alias="to-date", include_in_schema=False),
    group_by: str = Query(
        "day",
        description="Kiểu gom nhóm thời gian: 'day' (theo ngày), 'week' (theo tuần), 'month' (theo tháng)"
    ),
    current_user=Depends(get_current_user),
):
    from_date = from_date or from_date_hyphen
    to_date = to_date or to_date_hyphen
    from_date, to_date = _validate_date_range(from_date, to_date)
    user_id = str(current_user.id)

    valid_groups = ["day", "week", "month"]
    if group_by not in valid_groups:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lỗi tham số: group_by chỉ nhận các giá trị: {', '.join(valid_groups)}"
        )

    try:
        supabase = get_supabase_admin_client()
        curr_start_dt = datetime.combine(from_date, time.min)
        curr_end_dt = datetime.combine(to_date, time.max)
        curr_start_iso = curr_start_dt.isoformat()
        curr_end_iso = curr_end_dt.isoformat()

        # Truy vấn danh sách searched_at từ search_histories của user
        res = (
            supabase.table("search_histories")
            .select("searched_at")
            .eq("user_id", user_id)
            .gte("searched_at", curr_start_iso)
            .lte("searched_at", curr_end_iso)
            .execute()
        )

        rows = res.data or []
        counts_map = {}
        if group_by == "day":
            curr = from_date
            while curr <= to_date:
                key = curr.strftime("%Y-%m-%d")
                counts_map[key] = 0
                curr += timedelta(days=1)
        elif group_by == "week":
            curr = from_date
            while curr <= to_date:
                year, week_num, _ = curr.isocalendar()
                key = f"{year}-W{week_num:02d}"
                if key not in counts_map:
                    counts_map[key] = 0
                curr += timedelta(days=7)
        elif group_by == "month":
            curr = from_date
            while curr <= to_date:
                key = curr.strftime("%Y-%m")
                if key not in counts_map:
                    counts_map[key] = 0
                next_month = curr.month + 1 if curr.month < 12 else 1
                next_year = curr.year if curr.month < 12 else curr.year + 1
                curr = date(next_year, next_month, 1)

        for row in rows:
            searched_at_raw = row.get("searched_at")
            if not searched_at_raw:
                continue
            dt = datetime.fromisoformat(searched_at_raw.replace("Z", "+00:00"))
            if group_by == "day":
                key = dt.strftime("%Y-%m-%d")
            elif group_by == "week":
                year, week_num, _ = dt.isocalendar()
                key = f"{year}-W{week_num:02d}"
            elif group_by == "month":
                key = dt.strftime("%Y-%m")

            if key in counts_map:
                counts_map[key] += 1
            else:
                counts_map[key] = 1

        trend_items = [
            SearchTrendItem(period=period, total=total)
            for period, total in sorted(counts_map.items())
        ]

        return SearchTrendsResponse(
            status="success",
            group_by=group_by,
            data=trend_items
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi máy chủ khi truy vấn dữ liệu biểu đồ: {str(e)}"
        )


# 3. TOP ĐỊA ĐIỂM NGƯỜI DÙNG TÌM KIẾM NHIỀU NHẤT
@router.get(
    "/top-places",
    response_model=TopPlacesResponse,
    summary="Top địa điểm người dùng tìm kiếm nhiều nhất",
    description="Lấy danh sách các địa danh có lượt tìm kiếm cao nhất của user trong khoảng thời gian"
)
async def get_top_places(
    from_date: Optional[date] = Query(
        None, 
        description="Ngày bắt đầu (Định dạng YYYY-MM-DD). Mặc định: 30 ngày trước"
    ),
    from_date_hyphen: Optional[date] = Query(None, alias="from-date", include_in_schema=False),
    to_date: Optional[date] = Query(
        None, 
        description="Ngày kết thúc (Định dạng YYYY-MM-DD). Mặc định: Ngày hôm nay"
    ),
    to_date_hyphen: Optional[date] = Query(None, alias="to-date", include_in_schema=False),
    limit: int = Query(
        10,
        ge=1,
        le=50,
        description="Số lượng địa điểm cần lấy (Mặc định: 10, tối đa: 50)"
    ),
    current_user=Depends(get_current_user),
):
    from_date = from_date or from_date_hyphen
    to_date = to_date or to_date_hyphen
    from_date, to_date = _validate_date_range(from_date, to_date)
    user_id = str(current_user.id)

    try:
        supabase = get_supabase_admin_client()

        curr_start_dt = datetime.combine(from_date, time.min)
        curr_end_dt = datetime.combine(to_date, time.max)
        curr_start_iso = curr_start_dt.isoformat()
        curr_end_iso = curr_end_dt.isoformat()

        # Truy vấn search_histories của riêng user kết hợp places
        res = (
            supabase.table("search_histories")
            .select("place_id, places(id, name, province)")
            .eq("user_id", user_id)
            .not_.is_("place_id", "null")
            .gte("searched_at", curr_start_iso)
            .lte("searched_at", curr_end_iso)
            .execute()
        )

        rows = res.data or []

        places_map = {}
        for row in rows:
            place_id = row.get("place_id")
            if not place_id:
                continue

            place_obj = row.get("places") or {}
            name = place_obj.get("name") or "Không xác định"
            province = place_obj.get("province")

            if place_id not in places_map:
                places_map[place_id] = {
                    "place_id": str(place_id),
                    "name": name,
                    "province": province,
                    "search_count": 0
                }
            places_map[place_id]["search_count"] += 1

        sorted_places = sorted(
            places_map.values(),
            key=lambda x: x["search_count"],
            reverse=True
        )[:limit]

        top_items = [TopPlaceItem(**item) for item in sorted_places]

        return TopPlacesResponse(
            status="success",
            total_places=len(top_items),
            data=top_items
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi máy chủ khi truy vấn top địa điểm: {str(e)}"
        )


# 4. Cơ cấu lượt tìm kiếm theo danh mục của user
@router.get(
    "/category-distribution",
    response_model=CategoryDistributionResponse,
    summary="Cơ cấu lượt tìm kiếm theo danh mục của người dùng",
    description="Lấy tỷ lệ phần trăm và số lượng tìm kiếm phân bổ theo từng danh mục địa danh của user trong khoảng thời gian"
)
async def get_category_distribution(
    from_date: Optional[date] = Query(
        None, 
        description="Ngày bắt đầu (Định dạng YYYY-MM-DD). Mặc định: 30 ngày trước"
    ),
    from_date_hyphen: Optional[date] = Query(None, alias="from-date", include_in_schema=False),
    to_date: Optional[date] = Query(
        None, 
        description="Ngày kết thúc (Định dạng YYYY-MM-DD). Mặc định: Ngày hôm nay"
    ),
    to_date_hyphen: Optional[date] = Query(None, alias="to-date", include_in_schema=False),
    current_user=Depends(get_current_user),
):
    from_date = from_date or from_date_hyphen
    to_date = to_date or to_date_hyphen
    from_date, to_date = _validate_date_range(from_date, to_date)
    user_id = str(current_user.id)

    try:
        supabase = get_supabase_admin_client()

        curr_start_dt = datetime.combine(from_date, time.min)
        curr_end_dt = datetime.combine(to_date, time.max)
        curr_start_iso = curr_start_dt.isoformat()
        curr_end_iso = curr_end_dt.isoformat()

        # Truy vấn search_histories của riêng user
        res = (
            supabase.table("search_histories")
            .select("place_id, places(id, category_id)")
            .eq("user_id", user_id)
            .not_.is_("place_id", "null")
            .gte("searched_at", curr_start_iso)
            .lte("searched_at", curr_end_iso)
            .execute()
        )

        rows = res.data or []

        categories_dict = {}
        try:
            cat_res = supabase.table("categories").select("id, name").execute()
            for c in (cat_res.data or []):
                categories_dict[str(c["id"])] = c.get("name") or "Khác"
        except Exception:
            pass

        categories_map = {}
        total_valid_searches = 0

        for row in rows:
            place_obj = row.get("places") or {}
            category_id = place_obj.get("category_id")
            
            cat_id_str = str(category_id) if category_id else None
            cat_name = categories_dict.get(cat_id_str, "Danh lam thắng cảnh" if cat_id_str else "Khác")
            key = cat_id_str or "uncategorized"

            if key not in categories_map:
                categories_map[key] = {
                    "category_id": cat_id_str,
                    "name": cat_name,
                    "count": 0,
                }
            categories_map[key]["count"] += 1
            total_valid_searches += 1

        dist_items = []
        for cat in categories_map.values():
            percentage = (
                round((cat["count"] / total_valid_searches) * 100.0, 1)
                if total_valid_searches > 0
                else 0.0
            )
            dist_items.append(
                CategoryDistributionItem(
                    category_id=cat["category_id"],
                    name=cat["name"],
                    count=cat["count"],
                    percentage=percentage,
                )
            )

        dist_items.sort(key=lambda x: x.count, reverse=True)

        return CategoryDistributionResponse(
            status="success",
            total_searches=total_valid_searches,
            data=dist_items
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi máy chủ khi truy vấn cơ cấu danh mục: {str(e)}"
        )


# 5. Xuất báo cáo (Role PRO được phép, FREE trả về 403 Forbidden)
@router.get(
    "/export",
    summary="Xuất báo cáo thống kê cá nhân (Chỉ dành cho tài khoản Pro)",
    description="Gom toàn bộ dữ liệu tổng hợp cá nhân của user theo khoảng thời gian để kết xuất ra file Excel (.xlsx) hoặc CSV. Yêu cầu gói Pro."
)
async def export_statistics_report(
    from_date: Optional[date] = Query(
        None, 
        description="Ngày bắt đầu (Định dạng YYYY-MM-DD). Mặc định: 30 ngày trước"
    ),
    from_date_hyphen: Optional[date] = Query(None, alias="from-date", include_in_schema=False),
    to_date: Optional[date] = Query(
        None, 
        description="Ngày kết thúc (Định dạng YYYY-MM-DD). Mặc định: Ngày hôm nay"
    ),
    to_date_hyphen: Optional[date] = Query(None, alias="to-date", include_in_schema=False),
    format: str = Query(
        "xlsx",
        description="Định dạng xuất file: 'xlsx' (Excel 4 Sheet) hoặc 'csv'"
    ),
    user_with_plan=Depends(get_current_user_with_plan),
):
    # Kiểm tra phân quyền: Chỉ Pro mới được xuất báo cáo
    if not user_with_plan.get("is_pro"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tính năng Xuất báo cáo (Export Excel/CSV) chỉ dành riêng cho tài khoản Pro. Vui lòng nâng cấp gói cước để sử dụng!"
        )

    from_date = from_date or from_date_hyphen
    to_date = to_date or to_date_hyphen
    from_date, to_date = _validate_date_range(from_date, to_date)
    current_user = user_with_plan["user"]

    try:
        # Thu thập dữ liệu của chính user
        overview_res = await get_overview(from_date=from_date, to_date=to_date, current_user=current_user)
        trends_res = await get_search_trends(from_date=from_date, to_date=to_date, group_by="day", current_user=current_user)
        places_res = await get_top_places(from_date=from_date, to_date=to_date, limit=20, current_user=current_user)
        categories_res = await get_category_distribution(from_date=from_date, to_date=to_date, current_user=current_user)

        kpi_data = overview_res.data
        df_overview = pd.DataFrame([
            {
                "Chỉ số KPI": "Tổng lượt quét ảnh địa danh",
                "Giá trị": kpi_data.total_scans.value,
                "Tăng trưởng so với kỳ trước (%)": f"{'+' if kpi_data.total_scans.is_increase else '-'}{kpi_data.total_scans.growth_percentage}%",
                "Xu hướng": "Tăng trưởng" if kpi_data.total_scans.is_increase else "Sụt giảm"
            },
            {
                "Chỉ số KPI": "Số ngày hoạt động",
                "Giá trị": kpi_data.active_users.value,
                "Tăng trưởng so với kỳ trước (%)": f"{'+' if kpi_data.active_users.is_increase else '-'}{kpi_data.active_users.growth_percentage}%",
                "Xu hướng": "Tăng trưởng" if kpi_data.active_users.is_increase else "Sụt giảm"
            },
            {
                "Chỉ số KPI": "Tổng số lượt tìm kiếm",
                "Giá trị": kpi_data.total_searches.value,
                "Tăng trưởng so với kỳ trước (%)": f"{'+' if kpi_data.total_searches.is_increase else '-'}{kpi_data.total_searches.growth_percentage}%",
                "Xu hướng": "Tăng trưởng" if kpi_data.total_searches.is_increase else "Sụt giảm"
            },
            {
                "Chỉ số KPI": "Địa điểm yêu thích",
                "Giá trị": kpi_data.favorite_places.value,
                "Tăng trưởng so với kỳ trước (%)": f"{'+' if kpi_data.favorite_places.is_increase else '-'}{kpi_data.favorite_places.growth_percentage}%",
                "Xu hướng": "Tăng trưởng" if kpi_data.favorite_places.is_increase else "Sụt giảm"
            },
        ])

        df_trends = pd.DataFrame([
            {
                "Mốc thời gian": item.period,
                "Số lượt tìm kiếm": item.total
            }
            for item in trends_res.data
        ])

        df_places = pd.DataFrame([
            {
                "Xếp hạng": idx + 1,
                "Tên địa danh": item.name,
                "Tỉnh/Thành phố": item.province or "Chưa cập nhật",
                "Số lượt tìm kiếm": item.search_count
            }
            for idx, item in enumerate(places_res.data)
        ])

        df_categories = pd.DataFrame([
            {
                "Tên danh mục": item.name,
                "Số lượt tìm kiếm": item.count,
                "Tỷ lệ đóng góp (%)": f"{item.percentage}%"
            }
            for item in categories_res.data
        ])

        output = io.BytesIO()

        if format.lower() == "csv":
            df_overview.to_csv(output, index=False, encoding="utf-8-sig")
            output.seek(0)
            filename = f"Bao_Cao_Ca_Nhan_{from_date}_{to_date}.csv"
            media_type = "text/csv; charset=utf-8"
        else:
            try:
                with pd.ExcelWriter(output, engine="openpyxl") as writer:
                    df_overview.to_excel(writer, sheet_name="1. Tổng quan KPI", index=False)
                    df_trends.to_excel(writer, sheet_name="2. Xu hướng tìm kiếm", index=False)
                    df_places.to_excel(writer, sheet_name="3. Top địa điểm", index=False)
                    df_categories.to_excel(writer, sheet_name="4. Cơ cấu danh mục", index=False)

                output.seek(0)
                filename = f"Bao_Cao_Ca_Nhan_{from_date}_{to_date}.xlsx"
                media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            except (ImportError, ModuleNotFoundError, Exception):
                output = io.BytesIO()
                df_overview.to_csv(output, index=False, encoding="utf-8-sig")
                output.seek(0)
                filename = f"Bao_Cao_Ca_Nhan_{from_date}_{to_date}.csv"
                media_type = "text/csv; charset=utf-8"

        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }

        return StreamingResponse(
            output,
            media_type=media_type,
            headers=headers
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi máy chủ khi xuất báo cáo thống kê: {str(e)}"
        )
