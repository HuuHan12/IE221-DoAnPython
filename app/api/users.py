from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.auth.dependencies import supabase, get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ============================================================
# SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    new_password: str = Field(min_length=6)


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    avatar_media_id: Optional[str] = None


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register(data: RegisterRequest):
    try:
        response = supabase.auth.sign_up({
            "email": data.email,
            "password": data.password
        })

        if not response.user:
            raise HTTPException(
                status_code=400,
                detail="Không thể tạo tài khoản."
            )

        user = response.user

        # Trigger PostgreSQL sẽ tự tạo:
        # public.users
        # public.user_profiles

        if data.full_name:
            supabase.table("user_profiles").update({
                "full_name": data.full_name
            }).eq(
                "user_id", user.id
            ).execute()

        return {
            "message": "Đăng ký thành công.",
            "user": {
                "id": user.id,
                "email": user.email
            }
        }

    except HTTPException:
        raise

    except Exception as error:
        message = str(error)

        if "already registered" in message.lower():
            raise HTTPException(
                status_code=409,
                detail="Email đã được đăng ký."
            )

        raise HTTPException(
            status_code=400,
            detail=message
        )


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(data: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": data.email,
            "password": data.password
        })

        if not response.user or not response.session:
            raise HTTPException(
                status_code=401,
                detail="Email hoặc mật khẩu không đúng."
            )

        user = response.user
        session = response.session

        # Cập nhật last_login_at.
        supabase.table("users").update({
            "last_login_at": datetime.now(timezone.utc).isoformat()
        }).eq(
            "id", user.id
        ).execute()

        return {
            "message": "Đăng nhập thành công.",
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email
            }
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Email hoặc mật khẩu không đúng."
        )


# ============================================================
# GET PROFILE
# ============================================================

@router.get("/profile")
def get_profile(
    current_user=Depends(get_current_user)
):
    try:
        user_response = (
            supabase
            .table("users")
            .select(
                "id,email,status,last_login_at,created_at,updated_at"
            )
            .eq("id", current_user.id)
            .single()
            .execute()
        )

        profile_response = (
            supabase
            .table("user_profiles")
            .select(
                "id,user_id,full_name,avatar_media_id,"
                "created_at,updated_at"
            )
            .eq("user_id", current_user.id)
            .single()
            .execute()
        )

        return {
            "user": user_response.data,
            "profile": profile_response.data
        }

    except Exception as error:
        raise HTTPException(
            status_code=404,
            detail=f"Không tìm thấy thông tin người dùng: {error}"
        )


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put("/profile")
def update_profile(
    data: UpdateProfileRequest,
    current_user=Depends(get_current_user)
):
    try:
        update_data = {}

        if data.full_name is not None:
            update_data["full_name"] = data.full_name

        if data.avatar_media_id is not None:
            update_data["avatar_media_id"] = data.avatar_media_id

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="Không có thông tin nào để cập nhật."
            )

        response = (
            supabase
            .table("user_profiles")
            .update(update_data)
            .eq("user_id", current_user.id)
            .execute()
        )

        return {
            "message": "Cập nhật thông tin cá nhân thành công.",
            "profile": response.data[0] if response.data else None
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user=Depends(get_current_user)
):
    try:
        supabase.auth.update_user({
            "password": data.new_password
        })

        return {
            "message": "Đổi mật khẩu thành công."
        }

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Không thể đổi mật khẩu: {error}"
        )
