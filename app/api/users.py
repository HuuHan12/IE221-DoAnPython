from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.database.supabase import (
    get_supabase_admin_client,
    get_supabase_client,
)
from app.schemas.user import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RegisterRequest,
    UpdateUserRequest,
    UserResponse,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


def build_user_response(user_id: UUID):
    """
    Lấy users + user_profiles và trả về cấu trúc
    thống nhất cho API.
    """

    admin = get_supabase_admin_client()

    user_result = (
        admin
        .table("users")
        .select("*")
        .eq("id", str(user_id))
        .single()
        .execute()
    )

    if not user_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy người dùng"
        )

    profile_result = (
        admin
        .table("user_profiles")
        .select("*")
        .eq("user_id", str(user_id))
        .maybe_single()
        .execute()
    )

    data = user_result.data

    data["profile"] = profile_result.data

    return data


# ============================================================
# 1. REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(payload: RegisterRequest):
    """
    Đăng ký tài khoản mới.

    1. Tạo user trong Supabase Auth.
    2. Tạo record tương ứng trong public.users.
    3. Tạo user_profiles.
    """

    auth_client = get_supabase_client()
    admin = get_supabase_admin_client()

    try:
        auth_response = auth_client.auth.sign_up(
            {
                "email": payload.email,
                "password": payload.password,
            }
        )

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    auth_user = auth_response.user

    if auth_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể tạo tài khoản"
        )

    user_id = auth_user.id

    try:
        user_data = {
            "id": str(user_id),
            "email": payload.email,
            "status": "active",
        }

        admin.table("users").insert(
            user_data
        ).execute()

        profile_data = {
            "user_id": str(user_id),
            "full_name": payload.full_name,
        }

        admin.table("user_profiles").insert(
            profile_data
        ).execute()

    except Exception as error:
        # Nếu phần public.users/profile lỗi thì xóa
        # user Auth vừa tạo để tránh dữ liệu không đồng bộ.
        try:
            admin.auth.admin.delete_user(str(user_id))
        except Exception:
            pass

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể tạo dữ liệu người dùng: {error}"
        )

    return build_user_response(user_id)


# ============================================================
# 2. LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=LoginResponse
)
def login(payload: LoginRequest):

    auth_client = get_supabase_client()
    admin = get_supabase_admin_client()

    try:
        auth_response = auth_client.auth.sign_in_with_password(
            {
                "email": payload.email,
                "password": payload.password,
            }
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác"
        )

    session = auth_response.session
    auth_user = auth_response.user

    if session is None or auth_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Đăng nhập thất bại"
        )

    now = datetime.now(timezone.utc).isoformat()

    admin.table("users").update(
        {
            "last_login_at": now,
        }
    ).eq(
        "id",
        str(auth_user.id)
    ).execute()

    user_data = build_user_response(auth_user.id)

    return {
        "access_token": session.access_token,
        "refresh_token": session.refresh_token,
        "token_type": "bearer",
        "user": user_data,
    }


# ============================================================
# 3. GET CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user=Depends(get_current_user)
):

    return build_user_response(
        UUID(str(current_user.id))
    )


# ============================================================
# 4. UPDATE PERSONAL INFORMATION
# ============================================================

@router.put(
    "/me",
    response_model=UserResponse
)
def update_me(
    payload: UpdateUserRequest,
    current_user=Depends(get_current_user)
):

    user_id = UUID(str(current_user.id))

    admin = get_supabase_admin_client()

    # --------------------------------------------------------
    # Cập nhật users
    # --------------------------------------------------------

    if payload.email is not None:

        try:
            admin.auth.admin.update_user_by_id(
                str(user_id),
                {
                    "email": payload.email
                }
            )
        except Exception as error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Không thể cập nhật email: {error}"
            )

        admin.table("users").update(
            {
                "email": payload.email
            }
        ).eq(
            "id",
            str(user_id)
        ).execute()

    # --------------------------------------------------------
    # Cập nhật user_profiles
    # --------------------------------------------------------

    profile_update = {}

    if payload.full_name is not None:
        profile_update["full_name"] = payload.full_name

    if payload.avatar_media_id is not None:
        profile_update["avatar_media_id"] = str(
            payload.avatar_media_id
        )

    if profile_update:

        profile_update["updated_at"] = (
            datetime.now(timezone.utc).isoformat()
        )

        admin.table("user_profiles").update(
            profile_update
        ).eq(
            "user_id",
            str(user_id)
        ).execute()

    return build_user_response(user_id)


# ============================================================
# 5. CHANGE PASSWORD
# ============================================================

@router.put(
    "/change-password",
    response_model=MessageResponse
)
def change_password(
    payload: ChangePasswordRequest,
    current_user=Depends(get_current_user)
):

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới phải khác mật khẩu hiện tại"
        )

    user_id = UUID(str(current_user.id))

    admin = get_supabase_admin_client()
    auth_client = get_supabase_client()

    # --------------------------------------------------------
    # Lấy email của user
    # --------------------------------------------------------

    result = (
        admin
        .table("users")
        .select("email")
        .eq("id", str(user_id))
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy người dùng"
        )

    email = result.data["email"]

    # --------------------------------------------------------
    # Kiểm tra password hiện tại
    # --------------------------------------------------------

    try:
        auth_client.auth.sign_in_with_password(
            {
                "email": email,
                "password": payload.current_password,
            }
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không chính xác"
        )

    # --------------------------------------------------------
    # Đổi password
    # --------------------------------------------------------

    try:
        admin.auth.admin.update_user_by_id(
            str(user_id),
            {
                "password": payload.new_password
            }
        )

    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Không thể đổi mật khẩu: {error}"
        )

    return {
        "message": "Đổi mật khẩu thành công"
    }