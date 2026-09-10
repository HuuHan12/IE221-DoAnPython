import os
from pathlib import Path
from types import SimpleNamespace

from dotenv import load_dotenv
from fastapi import HTTPException
from supabase import Client, create_client


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

_anon_client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

_admin_client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
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
    """
    return _anon_client


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
# DEVELOPMENT USER
# ============================================================

def get_current_user():
    """
    Temporary development user.

    Sử dụng trong giai đoạn phát triển khi
    Bearer/JWT authentication chưa được hoàn thiện.
    """

    if not DEV_USER_ID:
        raise HTTPException(
            status_code=500,
            detail="DEV_USER_ID is not configured.",
        )

    return SimpleNamespace(
        id=DEV_USER_ID,
        email="dev@landmark.local",
    )