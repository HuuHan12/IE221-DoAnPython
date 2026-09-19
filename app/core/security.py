import os
from types import SimpleNamespace
from typing import Optional
from fastapi import Header, HTTPException, Depends, status
from supabase import Client

from app.database.supabase import get_supabase_client, get_supabase_admin_client, DEV_USER_ID


def get_current_user(
    authorization: Optional[str] = Header(None)
):
    """
    Xác thực người dùng từ:
        Authorization: Bearer <access_token>
    Sau khi token hợp lệ, trả về thông tin user từ Supabase Auth.
    Chỉ fallback về dev user khi DEV_SKIP_SUPABASE_AUTH=true (dành riêng cho script test).
    """
    skip_auth = os.getenv("DEV_SKIP_SUPABASE_AUTH", "false").lower() == "true"
    if not authorization:
        if skip_auth and DEV_USER_ID:
            return SimpleNamespace(
                id=DEV_USER_ID,
                email="dev@landmark.local",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thiếu Authorization header"
        )

    parts = authorization.split()

    if len(parts) != 2 or parts[0].lower() != "bearer":
        if skip_auth and DEV_USER_ID:
            return SimpleNamespace(id=DEV_USER_ID, email="dev@landmark.local")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
        )

    token = parts[1]

    try:
        client: Client = get_supabase_client()
        response = client.auth.get_user(token)

        if response.user is None:
            if skip_auth and DEV_USER_ID:
                return SimpleNamespace(id=DEV_USER_ID, email="dev@landmark.local")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục."
            )

        return response.user

    except HTTPException:
        raise
    except Exception:
        if skip_auth and DEV_USER_ID:
            return SimpleNamespace(id=DEV_USER_ID, email="dev@landmark.local")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục."
        )


def get_user_subscription_info(user_id: str) -> dict:
    """
    Lấy thông tin gói cước và phân quyền role của user từ Supabase.
    """
    admin = get_supabase_admin_client()
    plan_code = "free"
    scan_limit = 10

    try:
        res = (
            admin.table("user_subscriptions")
            .select("*")
            .eq("user_id", str(user_id))
            .maybe_single()
            .execute()
        )
        if res and res.data:
            sub_status = res.data.get("status", "active")
            if sub_status == "active":
                plan_code = res.data.get("plan_code", "free")
    except Exception:
        plan_code = "free"

    try:
        p_res = (
            admin.table("subscription_plans")
            .select("scan_limit_per_day")
            .eq("code", plan_code)
            .maybe_single()
            .execute()
        )
        if p_res and p_res.data:
            scan_limit = p_res.data.get("scan_limit_per_day", 10 if plan_code == "free" else 500)
        else:
            scan_limit = 500 if plan_code in ["pro", "enterprise"] else 10
    except Exception:
        scan_limit = 500 if plan_code in ["pro", "enterprise"] else 10

    return {
        "plan_code": plan_code,
        "is_pro": plan_code in ["pro", "enterprise"],
        "scan_limit": scan_limit,
    }


def get_current_user_with_plan(current_user=Depends(get_current_user)):
    """
    Dependency trả về user kèm thông tin gói cước (plan_code, is_pro, scan_limit).
    """
    user_id = str(current_user.id)
    sub_info = get_user_subscription_info(user_id)
    return {
        "user": current_user,
        "user_id": user_id,
        "is_guest": False,
        "plan_code": sub_info["plan_code"],
        "is_pro": sub_info["is_pro"],
        "scan_limit": sub_info["scan_limit"],
    }


def get_optional_user_with_plan(
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Dependency xác thực linh hoạt:
    - Nếu có Bearer token hợp lệ: trả về thông tin user và gói cước (is_guest=False).
    - Nếu không có token hoặc token không hợp lệ: trả về đối tượng Guest (is_guest=True, scan_limit=1).
    """
    if not authorization:
        return {
            "user": None,
            "user_id": None,
            "is_guest": True,
            "plan_code": "guest",
            "is_pro": False,
            "scan_limit": 1,
        }

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return {
            "user": None,
            "user_id": None,
            "is_guest": True,
            "plan_code": "guest",
            "is_pro": False,
            "scan_limit": 1,
        }

    token = parts[1]
    try:
        client: Client = get_supabase_client()
        response = client.auth.get_user(token)
        if response.user is None:
            return {
                "user": None,
                "user_id": None,
                "is_guest": True,
                "plan_code": "guest",
                "is_pro": False,
                "scan_limit": 1,
            }

        user = response.user
        user_id = str(user.id)
        sub_info = get_user_subscription_info(user_id)
        return {
            "user": user,
            "user_id": user_id,
            "is_guest": False,
            "plan_code": sub_info["plan_code"],
            "is_pro": sub_info["is_pro"],
            "scan_limit": sub_info["scan_limit"],
        }
    except Exception:
        return {
            "user": None,
            "user_id": None,
            "is_guest": True,
            "plan_code": "guest",
            "is_pro": False,
            "scan_limit": 1,
        }
