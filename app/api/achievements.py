import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.notifications import create_user_notification
from app.database.supabase import get_current_user, get_supabase_admin_client
from app.schemas.achievement import (
    AchievementItem,
    RecordCheckinResponse,
    UserAchievementsResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/achievements", tags=["Achievements"])

# Danh sách 7 danh hiệu
DEFAULT_ACHIEVEMENTS = [
    {
        "code": "STREAK_1",
        "name": "Kiên trì 1 ngày",
        "description": "Đăng nhập và check-in liên tục 1 ngày",
        "achievement_type": "streak",
        "target_value": 1,
    },
    {
        "code": "STREAK_7",
        "name": "Kiên trì 7 ngày",
        "description": "Đăng nhập và check-in liên tục 7 ngày",
        "achievement_type": "streak",
        "target_value": 7,
    },
    {
        "code": "STREAK_30",
        "name": "Kiên trì 30 ngày",
        "description": "Đăng nhập và check-in liên tục 30 ngày",
        "achievement_type": "streak",
        "target_value": 30,
    },
    {
        "code": "CHECKIN_50",
        "name": "Check-in 50 lần",
        "description": "Đạt tổng cộng 50 lượt check-in địa danh",
        "achievement_type": "count",
        "target_value": 50,
    },
    {
        "code": "CHECKIN_100",
        "name": "Check-in 100 lần",
        "description": "Đạt tổng cộng 100 lượt check-in địa danh",
        "achievement_type": "count",
        "target_value": 100,
    },
    {
        "code": "EXPLORER_10",
        "name": "Explorer",
        "description": "Khám phá 10 địa danh văn hóa lịch sử khác nhau",
        "achievement_type": "places",
        "target_value": 10,
    },
    {
        "code": "KING_WEEK",
        "name": "Vua check-in",
        "description": "Đạt top 1 người check-in nhiều nhất trong tuần",
        "achievement_type": "rank",
        "target_value": 1,
    },
]


def _ensure_achievements_exist(supabase) -> List[dict]:
    """Tự động kiểm tra và khởi tạo danh sách 7 danh hiệu chuẩn nếu chưa có."""
    try:
        res = supabase.table("achievements").select("*").eq("active", True).execute()
        existing = res.data or []
        if len(existing) >= len(DEFAULT_ACHIEVEMENTS):
            return existing

        # Nếu chưa đủ 7 huy hiệu, tự động seed danh sách mặc định
        existing_codes = {item["code"] for item in existing}
        to_insert = [
            ach for ach in DEFAULT_ACHIEVEMENTS if ach["code"] not in existing_codes
        ]
        if to_insert:
            supabase.table("achievements").insert(to_insert).execute()

        res_updated = supabase.table("achievements").select("*").eq("active", True).execute()
        return res_updated.data or []
    except Exception as e:
        logger.warning(f"Không thể tự động đồng bộ achievements: {str(e)}")
        return []



def sync_user_achievements(user_id: str, supabase=None) -> List[str]:
    """
    Tự động tổng hợp dữ liệu thực tế của user (search_histories, media_files, user_favorites)
    và tính toán đồng bộ tiến độ vào user_achievements.
    Trả về danh sách các code danh hiệu mới được mở khóa (nếu có).
    """
    if not supabase:
        supabase = get_supabase_admin_client()

    now_iso = datetime.now(timezone.utc).isoformat()
    newly_unlocked: List[str] = []

    try:
        achievements = _ensure_achievements_exist(supabase)

        # 1. Thu thập dữ liệu thực tế từ Supabase
        # a. Lịch sử tìm kiếm & địa danh
        hist_res = (
            supabase.table("search_histories")
            .select("id,place_id,searched_at")
            .eq("user_id", user_id)
            .execute()
        )
        histories = hist_res.data or []

        # Đếm lượt quét từ user_daily_scan_logs phòng trường hợp user xóa lịch sử
        try:
            scan_log_res = (
                supabase.table("user_daily_scan_logs")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            total_scan_logs = scan_log_res.count or 0
        except Exception:
            total_scan_logs = 0

        total_scans = max(len(histories), total_scan_logs)

        distinct_places = list(set(h["place_id"] for h in histories if h.get("place_id")))
        distinct_places_count = len(distinct_places)

        # b. Số ngày hoạt động (streak)
        active_dates = set()
        for h in histories:
            s_at = h.get("searched_at")
            if s_at:
                try:
                    active_dates.add(str(s_at)[:10])
                except Exception:
                    pass
        if total_scans > 0:
            active_dates.add(datetime.now(timezone.utc).strftime("%Y-%m-%d"))
        active_days_count = len(active_dates)

        # c. Ảnh đã tải lên
        try:
            media_res = (
                supabase.table("media_files")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            total_media = media_res.count or total_scans
        except Exception:
            total_media = total_scans

        # d. Địa danh yêu thích
        try:
            fav_res = (
                supabase.table("user_favorites")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            total_fav = fav_res.count or 0
        except Exception:
            total_fav = 0

        # 2. Lấy dữ liệu user_achievements hiện tại
        user_ach_res = (
            supabase.table("user_achievements")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        user_map = {row["achievement_id"]: row for row in (user_ach_res.data or [])}

        # 3. Tính toán tiến độ cho từng danh hiệu
        for ach in achievements:
            ach_id = str(ach["id"])
            code = ach.get("code", "")
            target = int(ach.get("target_value") or 1)
            a_type = ach.get("achievement_type", "")
            user_data = user_map.get(ach_id)

            already_unlocked = bool(user_data.get("unlocked_at")) if user_data else False
            existing_progress = int(user_data.get("progress", 0)) if user_data else 0

            # Tính toán progress thực tế
            calc_progress = 0
            if code == "FIRST_SCAN":
                calc_progress = total_scans
            elif code in ("FIVE_LANDMARKS", "EXPLORER_10"):
                calc_progress = distinct_places_count
            elif code == "PHOTO_MASTER":
                calc_progress = total_media
            elif code in ("STREAK_1", "STREAK_7", "STREAK_30"):
                calc_progress = active_days_count
            elif code in ("CHECKIN_50", "CHECKIN_100"):
                calc_progress = total_scans
            elif code == "TRIP_PLANNER":
                calc_progress = total_fav
            elif code == "HISTORY_BUFF":
                calc_progress = min(distinct_places_count, 3)
            elif code == "KING_WEEK":
                calc_progress = 1 if total_scans >= 5 else 0
            else:
                if a_type == "streak":
                    calc_progress = active_days_count
                elif a_type in ("places", "CHECKIN_COUNT"):
                    calc_progress = distinct_places_count
                elif a_type == "UPLOAD_COUNT":
                    calc_progress = total_media
                elif a_type == "TRIP_COUNT":
                    calc_progress = total_fav
                else:
                    calc_progress = total_scans

            # Không bao giờ giảm tiến độ nếu trước đó đã có số cao hơn
            new_progress = max(existing_progress, calc_progress)

            should_unlock = not already_unlocked and new_progress >= target
            unlocked_time = (
                user_data.get("unlocked_at")
                if already_unlocked
                else (now_iso if should_unlock else None)
            )

            # Upsert vào user_achievements
            supabase.table("user_achievements").upsert({
                "user_id": user_id,
                "achievement_id": ach_id,
                "progress": new_progress,
                "unlocked_at": unlocked_time,
            }, on_conflict="user_id,achievement_id").execute()

            if should_unlock:
                newly_unlocked.append(code)
                try:
                    create_user_notification(
                        user_id=user_id,
                        notif_type="achievement",
                        title=f"🏆 Mở khóa danh hiệu: {ach.get('name')}!",
                        content=f"Chúc mừng bạn đã đạt mốc {target} trong hành trình khám phá địa danh Việt Nam.",
                    )
                except Exception as notif_err:
                    logger.warning(f"Không thể tạo notification danh hiệu: {notif_err}")

    except Exception as e:
        logger.warning(f"Lỗi khi đồng bộ thành tích user {user_id}: {e}")

    return newly_unlocked


# 1. Lấy danh sách danh hiệu của User
@router.get(
    "/my",
    response_model=UserAchievementsResponse,
    summary="Danh sách danh hiệu và tiến độ thành tích",
    description="Truy vấn toàn bộ danh hiệu, tự động đồng bộ tiến độ thực tế từ lịch sử quét và trả về tỷ lệ hoàn thành.",
)
def get_my_achievements(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)
    supabase = get_supabase_admin_client()

    try:
        # Tự động đồng bộ tiến độ thực tế trước khi trả về
        sync_user_achievements(user_id=user_id, supabase=supabase)

        # 1. Lấy danh mục huy hiệu
        achievements = _ensure_achievements_exist(supabase)

        # 2. Lấy tiến độ của user hiện tại sau khi đã đồng bộ
        user_ach_res = (
            supabase.table("user_achievements")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )
        user_map = {row["achievement_id"]: row for row in (user_ach_res.data or [])}

        items: List[AchievementItem] = []
        unlocked_count = 0

        for ach in achievements:
            ach_id = str(ach["id"])
            target = int(ach.get("target_value") or 1)
            user_data = user_map.get(ach_id, {})

            progress = int(user_data.get("progress") or 0)
            unlocked_at = user_data.get("unlocked_at")
            is_unlocked = unlocked_at is not None or progress >= target

            if is_unlocked:
                unlocked_count += 1
                progress_percent = 100.0
            else:
                progress_percent = round(min(99.0, (progress / target) * 100.0), 1)

            items.append(
                AchievementItem(
                    id=ach_id,
                    code=ach.get("code", ""),
                    name=ach.get("name", ""),
                    description=ach.get("description"),
                    achievement_type=ach.get("achievement_type", "count"),
                    target_value=target,
                    progress=progress,
                    progress_percent=progress_percent,
                    is_unlocked=is_unlocked,
                    unlocked_at=str(unlocked_at) if unlocked_at else None,
                )
            )

        total = len(items)
        completion_rate = round((unlocked_count / total) * 100.0, 1) if total > 0 else 0.0

        return UserAchievementsResponse(
            status="success",
            total_achievements=total,
            unlocked_count=unlocked_count,
            completion_rate=completion_rate,
            data=items,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi truy vấn danh sách thành tích: {str(e)}",
        )


# 2. Ghi nhận checkin và tự động mở khóa huy hiệu
@router.post(
    "/record-checkin",
    response_model=RecordCheckinResponse,
    summary="Ghi nhận lượt check-in và tự động cộng dồn thành tích",
    description=(
        "Đồng bộ và cộng dồn số lần check-in cho người dùng. Nếu đạt mốc mục tiêu của huy hiệu, "
        "hệ thống sẽ mở khóa huy hiệu và tự động gửi thông báo chúc mừng vào Quả chuông."
    ),
)
def record_checkin(current_user=Depends(get_current_user)):
    user_id = str(current_user.id)
    supabase = get_supabase_admin_client()

    try:
        new_unlocked = sync_user_achievements(user_id=user_id, supabase=supabase)

        # Lấy tổng số lượt quét/check-in hiện tại
        user_ach_res = (
            supabase.table("user_achievements")
            .select("progress")
            .eq("user_id", user_id)
            .execute()
        )
        total_checkins = max([int(r.get("progress") or 0) for r in (user_ach_res.data or [])] or [1])

        message = (
            f"Ghi nhận check-in thành công! Đã mở khóa {len(new_unlocked)} danh hiệu mới."
            if new_unlocked
            else "Ghi nhận check-in thành công! Tiến độ đã được cộng dồn."
        )

        return RecordCheckinResponse(
            status="success",
            message=message,
            total_checkins=total_checkins,
            new_unlocked=new_unlocked,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi ghi nhận check-in thành tích: {str(e)}",
        )
