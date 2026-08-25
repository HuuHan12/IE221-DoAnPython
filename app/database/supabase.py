import os

from dotenv import load_dotenv
from supabase import Client, create_client


load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


if not SUPABASE_URL:
    raise RuntimeError("Thiếu SUPABASE_URL trong file .env")

if not SUPABASE_ANON_KEY:
    raise RuntimeError("Thiếu SUPABASE_ANON_KEY trong file .env")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "Thiếu SUPABASE_SERVICE_ROLE_KEY trong file .env"
    )


def get_supabase_client() -> Client:
    """
    Client dùng cho các thao tác thông thường và xác thực user.
    """
    return create_client(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    )


def get_supabase_admin_client() -> Client:
    """
    Client dùng cho backend để thao tác database/admin.

    SERVICE_ROLE_KEY phải được giữ bí mật và tuyệt đối
    không đưa vào frontend.
    """
    return create_client(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    )