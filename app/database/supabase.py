import os

from dotenv import load_dotenv
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


if not SUPABASE_URL:
    raise RuntimeError("Thiếu SUPABASE_URL trong file .env")

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