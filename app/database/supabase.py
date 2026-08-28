import os
from pathlib import Path
from types import SimpleNamespace

from dotenv import load_dotenv
<<<<<<< HEAD
from supabase import create_client, Client


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")
=======
from fastapi import HTTPException
from supabase import Client, create_client


APP_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = APP_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(APP_DIR / ".env", override=True)


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = (
    os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("SUPABASE_PUBLISHABLE_KEY")
)
SUPABASE_SERVICE_ROLE_KEY = (
    os.getenv("SUPABASE_SECRET_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "uploads")
DEV_USER_ID = os.getenv("DEV_USER_ID")
>>>>>>> 52ea522f948309bb59e1c732478b6e3d0ff9ec4c


if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is not configured")

<<<<<<< HEAD
if not SUPABASE_KEY:
    raise RuntimeError(
        "Thiếu SUPABASE_PUBLISHABLE_KEY trong file .env"
    )


def get_supabase_client() -> Client:
    return create_client(
        SUPABASE_URL,
        SUPABASE_KEY
    )


def get_supabase_admin_client() -> Client:
    admin_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not admin_key:
        raise RuntimeError(
            "Thiếu SUPABASE_SERVICE_ROLE_KEY trong file .env"
        )

    return create_client(
        SUPABASE_URL,
        admin_key
    )
=======
if not SUPABASE_ANON_KEY:
    raise RuntimeError("SUPABASE_ANON_KEY is not configured")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY is not configured")


_anon_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
_admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Backwards-compatible name used by the existing users module.
supabase = _admin_client


def get_supabase_client() -> Client:
    """Return the public/anonymous client for authentication operations."""
    return _anon_client


def get_supabase_admin_client() -> Client:
    """Return the backend-only client that uses the service-role key."""
    return _admin_client


def get_current_user():
    """Return the temporary development user until bearer auth is enabled."""
    if not DEV_USER_ID:
        raise HTTPException(
            status_code=500,
            detail="DEV_USER_ID is not configured.",
        )

    return SimpleNamespace(
        id=DEV_USER_ID,
        email="dev@landmark.local",
    )
>>>>>>> 52ea522f948309bb59e1c732478b6e3d0ff9ec4c
