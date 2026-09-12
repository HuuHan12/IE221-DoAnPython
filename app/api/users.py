import logging
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import AuthApiError

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
    RegisterResponse,
    UpdateUserRequest,
    UserResponse,
)


logger = logging.getLogger(__name__)


_AUTH_CODE_DETAILS = {
    "invalid_credentials": (
        status.HTTP_401_UNAUTHORIZED,
        "Email hoặc mật khẩu không chính xác",
    ),
    "email_not_confirmed": (
        status.HTTP_403_FORBIDDEN,
        "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư trước khi đăng nhập",
    ),
    "email_exists": (
        status.HTTP_409_CONFLICT,
        "Email đã được đăng ký",
    ),
    "user_already_exists": (
        status.HTTP_409_CONFLICT,
        "Email đã được đăng ký",
    ),
    "identity_already_exists": (
        status.HTTP_409_CONFLICT,
        "Email đã được đăng ký",
    ),
    "phone_exists": (
        status.HTTP_409_CONFLICT,
        "Thông tin đăng ký đã tồn tại",
    ),
    "conflict": (
        status.HTTP_409_CONFLICT,
        "Thông tin tài khoản đã tồn tại",
    ),
    "email_conflict_identity_not_deletable": (
        status.HTTP_409_CONFLICT,
        "Email đã được liên kết với một tài khoản khác",
    ),
    "weak_password": (
        status.HTTP_400_BAD_REQUEST,
        "Mật khẩu chưa đáp ứng yêu cầu bảo mật",
    ),
    "validation_failed": (
        status.HTTP_400_BAD_REQUEST,
        "Thông tin Auth không hợp lệ",
    ),
    "email_address_invalid": (
        status.HTTP_400_BAD_REQUEST,
        "Địa chỉ email không hợp lệ",
    ),
    "email_address_not_authorized": (
        status.HTTP_400_BAD_REQUEST,
        "Địa chỉ email chưa được cho phép",
    ),
    "bad_json": (
        status.HTTP_400_BAD_REQUEST,
        "Dữ liệu gửi tới Auth không hợp lệ",
    ),
    "over_request_rate_limit": (
        status.HTTP_429_TOO_MANY_REQUESTS,
        "Bạn đã thử quá nhiều lần. Vui lòng chờ rồi thử lại",
    ),
    "over_email_send_rate_limit": (
        status.HTTP_429_TOO_MANY_REQUESTS,
        "Bạn đã yêu cầu quá nhiều email. Vui lòng chờ rồi thử lại",
    ),
    "over_sms_send_rate_limit": (
        status.HTTP_429_TOO_MANY_REQUESTS,
        "Bạn đã yêu cầu quá nhiều mã. Vui lòng chờ rồi thử lại",
    ),
    "signup_disabled": (
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "Dịch vụ đăng ký hiện không khả dụng",
    ),
    "provider_disabled": (
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "Nhà cung cấp Auth hiện không khả dụng",
    ),
    "email_provider_disabled": (
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "Dịch vụ email xác nhận hiện không khả dụng",
    ),
    "unexpected_failure": (
        status.HTTP_502_BAD_GATEWAY,
        "Dịch vụ Auth đang gặp sự cố. Vui lòng thử lại sau",
    ),
    "request_timeout": (
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "Dịch vụ Auth phản hồi quá lâu. Vui lòng thử lại sau",
    ),
    "hook_timeout": (
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "Dịch vụ Auth phản hồi quá lâu. Vui lòng thử lại sau",
    ),
    "hook_timeout_after_retry": (
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "Dịch vụ Auth phản hồi quá lâu. Vui lòng thử lại sau",
    ),
    "invalid_api_key": (
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "Cấu hình kết nối dịch vụ Auth không hợp lệ",
    ),
}


def _auth_error_code(error: Exception) -> str | None:
    code = getattr(error, "code", None)
    if code:
        return str(code).strip().lower().replace("-", "_").replace(" ", "_")

    message = str(getattr(error, "message", "") or error).lower()
    if "invalid login credentials" in message or "invalid credentials" in message:
        return "invalid_credentials"
    if "email not confirmed" in message:
        return "email_not_confirmed"
    if "already registered" in message or "already exists" in message:
        return "email_exists"
    return None


def auth_error_to_http_exception(error: Exception, operation: str = "Auth") -> HTTPException:
    """Translate Supabase Auth failures without exposing secrets or passwords."""

    code = _auth_error_code(error)
    provider_status = getattr(error, "status", None)
    try:
        provider_status = int(provider_status) if provider_status is not None else None
    except (TypeError, ValueError):
        provider_status = None

    logger.warning(
        "Supabase Auth %s failed type=%s code=%s status=%s provider_error=%s",
        operation,
        type(error).__name__,
        code,
        provider_status,
        isinstance(error, AuthApiError),
    )

    error_module = type(error).__module__.lower()
    error_text = str(getattr(error, "message", "") or error).lower()
    if (
        "api key" in error_text
        or "signature verification" in error_text
        or "invalid key" in error_text
        or "configuration" in error_text
        or "configured" in error_text
    ):
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cấu hình kết nối dịch vụ Auth không hợp lệ",
        )

    if (
        isinstance(error, (TimeoutError, ConnectionError, OSError))
        or error_module.startswith(("httpx", "httpcore"))
        or "timeout" in error_text
        or "connection" in error_text
    ):
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Không thể kết nối dịch vụ Auth. Vui lòng thử lại sau",
        )

    if code in _AUTH_CODE_DETAILS:
        http_status, detail = _AUTH_CODE_DETAILS[code]
        return HTTPException(status_code=http_status, detail=detail)

    if provider_status == status.HTTP_401_UNAUTHORIZED:
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Dịch vụ Auth từ chối xác thực cấu hình máy chủ",
        )
    if provider_status == status.HTTP_403_FORBIDDEN:
        return HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản chưa được phép đăng nhập",
        )
    if provider_status == status.HTTP_429_TOO_MANY_REQUESTS:
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Bạn đã thử quá nhiều lần. Vui lòng chờ rồi thử lại",
        )
    if provider_status is not None and provider_status >= 500:
        return HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Dịch vụ Auth đang gặp sự cố. Vui lòng thử lại sau",
        )

    if isinstance(error, AuthApiError) and provider_status in {
        status.HTTP_400_BAD_REQUEST,
        status.HTTP_422_UNPROCESSABLE_ENTITY,
    }:
        code_detail = f" ({code})" if code else ""
        return HTTPException(
            status_code=provider_status,
            detail=f"Yêu cầu Auth không hợp lệ{code_detail}",
        )

    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Dịch vụ Auth đang gặp sự cố. Vui lòng thử lại sau",
    )


def _database_error_to_http_exception(error: Exception, operation: str) -> HTTPException:
    """Return a safe, actionable error while retaining diagnostic log context."""

    code = str(getattr(error, "code", "") or "")
    error_text = str(getattr(error, "message", "") or error).lower()
    logger.error(
        "Supabase database %s failed type=%s code=%s",
        operation,
        type(error).__name__,
        code or None,
    )

    if code == "23505" or "duplicate key" in error_text or "unique constraint" in error_text:
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email đã được liên kết với một tài khoản khác",
        )

    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Không thể {operation}. Vui lòng thử lại sau",
    )


def _auth_user_metadata(auth_user) -> dict:
    metadata = getattr(auth_user, "user_metadata", None)
    if not isinstance(metadata, dict):
        metadata = getattr(auth_user, "raw_user_meta_data", None)
    return metadata if isinstance(metadata, dict) else {}


def _auth_user_full_name(auth_user) -> str | None:
    metadata = _auth_user_metadata(auth_user)
    full_name = metadata.get("full_name") or metadata.get("name")
    return str(full_name) if full_name is not None else None


def ensure_user_records(auth_user, full_name: str | None = None):
    """Create missing public records without overwriting existing user data."""

    auth_id = getattr(auth_user, "id", None)
    auth_email = getattr(auth_user, "email", None)
    if not auth_id or not auth_email:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Auth không trả về đủ thông tin người dùng",
        )

    try:
        user_id = UUID(str(auth_id))
    except (TypeError, ValueError) as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Auth trả về mã người dùng không hợp lệ",
        ) from error

    admin = get_supabase_admin_client()
    user_data = {
        "id": str(user_id),
        "email": str(auth_email),
        "status": "active",
    }
    try:
        admin.table("users").upsert(
            user_data,
            on_conflict="id",
            ignore_duplicates=True,
        ).execute()
    except Exception as error:
        raise _database_error_to_http_exception(error, "đồng bộ tài khoản người dùng") from error

    profile_data = {
        "user_id": str(user_id),
        "full_name": full_name if full_name is not None else _auth_user_full_name(auth_user),
    }
    try:
        admin.table("user_profiles").upsert(
            profile_data,
            on_conflict="user_id",
            ignore_duplicates=True,
        ).execute()
    except Exception as error:
        raise _database_error_to_http_exception(error, "đồng bộ hồ sơ người dùng") from error

    return build_user_response(user_id)


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

    try:
        user_result = (
            admin
            .table("users")
            .select("*")
            .eq("id", str(user_id))
            .maybe_single()
            .execute()
        )
    except Exception as error:
        raise _database_error_to_http_exception(error, "đọc dữ liệu người dùng") from error

    if user_result is None or not user_result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy người dùng"
        )

    try:
        profile_result = (
            admin
            .table("user_profiles")
            .select("*")
            .eq("user_id", str(user_id))
            .maybe_single()
            .execute()
        )
    except Exception as error:
        raise _database_error_to_http_exception(error, "đọc hồ sơ người dùng") from error

    data = dict(user_result.data)

    data["profile"] = profile_result.data if profile_result is not None else None

    return data


# ============================================================
# 1. REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED
)
def register(payload: RegisterRequest):
    """
    Đăng ký tài khoản mới.

    1. Tạo user trong Supabase Auth.
    2. Tạo record tương ứng trong public.users.
    3. Tạo user_profiles.
    """

    try:
        auth_client = get_supabase_client()
    except Exception as error:
        raise auth_error_to_http_exception(error, "khởi tạo đăng ký") from error

    try:
        auth_response = auth_client.auth.sign_up(
            {
                "email": payload.email,
                "password": payload.password,
                "options": {
                    "data": {
                        "full_name": payload.full_name,
                    }
                },
            }
        )

    except Exception as error:
        raise auth_error_to_http_exception(error, "đăng ký") from error

    auth_user = getattr(auth_response, "user", None)

    if auth_user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Không thể tạo tài khoản"
        )

    # Supabase can return an obfuscated existing account when email
    # confirmation is enabled. It must not be synced as a new account.
    if getattr(auth_user, "identities", None) == []:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email đã được đăng ký hoặc chưa thể tạo tài khoản mới",
        )

    try:
        user_data = ensure_user_records(auth_user, full_name=payload.full_name)
    except HTTPException as error:
        if error.status_code >= status.HTTP_500_INTERNAL_SERVER_ERROR:
            raise HTTPException(
                status_code=error.status_code,
                detail=(
                    f"{error.detail}. Auth có thể đã tạo tài khoản; "
                    "hãy xác nhận email rồi thử đăng nhập sau khi hệ thống ổn định"
                ),
            ) from error
        raise

    requires_email_confirmation = getattr(auth_response, "session", None) is None
    message = (
        "Đăng ký thành công. Vui lòng xác nhận email trước khi đăng nhập"
        if requires_email_confirmation
        else "Đăng ký tài khoản thành công"
    )

    return {
        **user_data,
        "message": message,
        "requires_email_confirmation": requires_email_confirmation,
    }


# ============================================================
# 2. LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=LoginResponse
)
def login(payload: LoginRequest):

    try:
        auth_client = get_supabase_client()
    except Exception as error:
        raise auth_error_to_http_exception(error, "khởi tạo đăng nhập") from error

    try:
        auth_response = auth_client.auth.sign_in_with_password(
            {
                "email": payload.email,
                "password": payload.password,
            }
        )

    except Exception as error:
        raise auth_error_to_http_exception(error, "đăng nhập") from error

    session = getattr(auth_response, "session", None)
    auth_user = getattr(auth_response, "user", None)

    if session is None or auth_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Đăng nhập thất bại"
        )

    access_token = getattr(session, "access_token", None)
    if not isinstance(access_token, str) or not access_token.strip():
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Dịch vụ Auth không trả về access token hợp lệ",
        )

    # Auth can succeed before a previous deployment has created public rows.
    # Ensure both records exist before updating or serializing the user.
    ensure_user_records(auth_user)

    now = datetime.now(timezone.utc).isoformat()

    try:
        admin = get_supabase_admin_client()
        admin.table("users").update(
            {
                "last_login_at": now,
            }
        ).eq(
            "id",
            str(auth_user.id)
        ).execute()
    except Exception as error:
        raise _database_error_to_http_exception(error, "cập nhật lần đăng nhập") from error

    user_data = build_user_response(UUID(str(auth_user.id)))

    return {
        "access_token": access_token,
        "refresh_token": getattr(session, "refresh_token", None),
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
