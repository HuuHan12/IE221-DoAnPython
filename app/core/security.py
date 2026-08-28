from fastapi import Header, HTTPException, status
from supabase import Client

from app.database.supabase import get_supabase_client


def get_current_user(
    authorization: str = Header(...)
):
    """
    Xác thực người dùng từ:

        Authorization: Bearer <access_token>

    Sau khi token hợp lệ, trả về thông tin user
    từ Supabase Auth.
    """

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thiếu Authorization header"
        )

    parts = authorization.split()

    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization phải có dạng Bearer <token>"
        )

    token = parts[1]

    try:
        client: Client = get_supabase_client()

        response = client.auth.get_user(token)

        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không hợp lệ"
            )

        return response.user

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn"
        )