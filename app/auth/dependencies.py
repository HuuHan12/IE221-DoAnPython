import os
from pathlib import Path
from types import SimpleNamespace

from dotenv import load_dotenv
from fastapi import Header, HTTPException

from supabase import create_client


BASE_DIR = Path(__file__).resolve().parents[1]

load_dotenv(BASE_DIR / ".env")


SUPABASE_URL = os.getenv("SUPABASE_URL")

SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")

DEV_USER_ID = os.getenv("DEV_USER_ID")


if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is not configured")


if not SUPABASE_SECRET_KEY:
    raise RuntimeError("SUPABASE_SECRET_KEY is not configured")


# Backend admin client.
#
# Secret key bypasses RLS.
# NEVER expose this client/key to frontend.
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
)


def get_supabase_client():
    return supabase


def get_current_user():
    """
    Temporary development user.

    Authentication has not been implemented yet.
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
