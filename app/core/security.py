import os
from types import SimpleNamespace
from uuid import UUID
import jwt
from fastapi import Header, HTTPException, status
from supabase import Client

from app.database.supabase import get_supabase_client

JWT_SECRET = os.getenv("JWT_SECRET", "landmark-super-secret-key-ie221-vietnam-2026-production")
JWT_ALGORITHM = "HS256"


def get_current_user(
    authorization: str = Header(...)
):
    """
    Xác thực người dùng từ:
        Authorization: Bearer <access_token>
    Hỗ trợ cả token từ Supabase Auth và Local JWT token.
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

    # 1. Thử xác thực qua Supabase Auth
    try:
        client: Client = get_supabase_client()
        response = client.auth.get_user(token)
        if response and response.user:
            return response.user
    except Exception:
        pass

    # 2. Thử giải mã qua Local JWT
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        if user_id:
            return SimpleNamespace(
                id=UUID(str(user_id)),
                email=email or "user@landmark.local",
                user_metadata={"full_name": payload.get("full_name", "")}
            )
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn"
    )