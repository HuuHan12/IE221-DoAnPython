import os
from pathlib import Path
from types import SimpleNamespace
from typing import Optional

from dotenv import load_dotenv
from fastapi import HTTPException
from supabase import Client, ClientOptions, create_client


# ============================================================
# PROJECT ROOT
# ============================================================

APP_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = APP_DIR.parent

# .env chính:
# C:\IE221\IE221-DoAnPython\.env
ENV_PATH = PROJECT_ROOT / ".env"

load_dotenv(ENV_PATH)

# Cho phép fallback nếu vẫn còn .env trong app/
load_dotenv(APP_DIR / ".env", override=True)


# ============================================================
# SUPABASE CONFIG
# ============================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")

# Public key
SUPABASE_KEY = (
    os.getenv("SUPABASE_PUBLISHABLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
)

# Backend/admin key
SUPABASE_SERVICE_ROLE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_SECRET_KEY")
)

SUPABASE_BUCKET = os.getenv(
    "SUPABASE_BUCKET",
    "uploads"
)

DEV_USER_ID = os.getenv("DEV_USER_ID")


# ============================================================
# VALIDATE ENV
# ============================================================

if not SUPABASE_URL:
    raise RuntimeError(
        "Thiếu SUPABASE_URL trong file .env"
    )

if not SUPABASE_KEY:
    raise RuntimeError(
        "Thiếu SUPABASE_PUBLISHABLE_KEY hoặc "
        "SUPABASE_ANON_KEY trong file .env"
    )

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "Thiếu SUPABASE_SERVICE_ROLE_KEY hoặc "
        "SUPABASE_SECRET_KEY trong file .env"
    )


# ============================================================
# CLIENTS
# ============================================================

_admin_client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    options=ClientOptions(
        auto_refresh_token=False,
        persist_session=False,
        postgrest_client_timeout=15,
        storage_client_timeout=20,
    ),
)

# Backward-compatible name
supabase = _admin_client


# ============================================================
# PUBLIC CLIENT
# ============================================================

def get_supabase_client() -> Client:
    """
    Client dùng public/publishable key.
    Dùng cho các thao tác thông thường/authentication.

    Auth requests receive a fresh, non-persisted client so one user's
    sign-in/sign-up session cannot leak into another request.
    """
    return create_client(
        SUPABASE_URL,
        SUPABASE_KEY,
        options=ClientOptions(
            auto_refresh_token=False,
            persist_session=False,
            postgrest_client_timeout=15,
            storage_client_timeout=20,
        ),
    )


# ============================================================
# ADMIN CLIENT
# ============================================================

def get_supabase_admin_client() -> Client:
    """
    Client dùng SERVICE_ROLE_KEY.
    Chỉ sử dụng ở backend.
    """
    return _admin_client


# ============================================================
# AUTHENTICATED USER DEPENDENCY
# ============================================================

from fastapi import Header

def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Dependency xác thực người dùng qua JWT Bearer token từ Supabase Auth,
    với fallback sang DEV_USER_ID nếu không có header (môi trường dev).
    """
    from app.core.security import get_current_user as _sec_get_current_user
    return _sec_get_current_user(authorization=authorization)

