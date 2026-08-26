import os
import time
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.auth.dependencies import get_supabase_client


router = APIRouter(
    prefix="/media",
    tags=["Media"],
)


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 10 * 1024 * 1024

SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "uploads")
DEV_USER_ID = os.getenv("DEV_USER_ID")


def get_db():
    if not DEV_USER_ID:
        raise HTTPException(
            status_code=500,
            detail="DEV_USER_ID is not configured",
        )

    return get_supabase_client()


def validate_file(file: UploadFile, data: bytes):
    content_type = file.content_type or "application/octet-stream"

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type: {content_type}. "
                f"Allowed: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}"
            ),
        )

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Empty file",
        )

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 10 MB",
        )

    return content_type


def sanitize_filename(filename: str | None) -> str:
    filename = Path(filename or "upload.jpg").name

    # UUID prevents collisions and weird filenames
    extension = Path(filename).suffix.lower()

    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    if extension not in allowed_extensions:
        extension = ".jpg"

    return f"{uuid.uuid4().hex}{extension}"


def build_storage_path(filename: str) -> str:
    return f"{DEV_USER_ID}/{int(time.time())}_{filename}"


def get_public_url(client, bucket: str, storage_path: str) -> str:
    response = client.storage.from_(bucket).get_public_url(storage_path)

    if isinstance(response, dict):
        url = (
            response.get("publicUrl")
            or response.get("publicURL")
            or response.get("public_url")
        )

        if url:
            return url

    if hasattr(response, "public_url"):
        return response.public_url

    # Supabase public storage URL fallback
    return (
        f"{os.getenv('SUPABASE_URL')}/storage/v1/object/public/"
        f"{bucket}/{storage_path}"
    )


def remove_storage_file(client, bucket: str, storage_path: str):
    try:
        client.storage.from_(bucket).remove([storage_path])
    except Exception:
        pass


# ============================================================
# LIST
# ============================================================

@router.get("/")
def list_media():
    client = get_db()

    try:
        gallery_response = (
            client
            .table("gallery_items")
            .select(
                """
                id,
                media_id,
                note,
                place_id,
                taken_at,
                created_at,
                media_files (
                    id,
                    file_name,
                    file_url,
                    mime_type,
                    file_size,
                    storage_path,
                    created_at
                )
                """
            )
            .eq("user_id", DEV_USER_ID)
            .order("created_at", desc=True)
            .execute()
        )

        items = []

        for row in gallery_response.data or []:
            media = row.get("media_files") or {}

            items.append(
                {
                    "id": media.get("id"),
                    "gallery_id": row.get("id"),
                    "url": media.get("file_url"),
                    "file_name": media.get("file_name"),
                    "mime_type": media.get("mime_type"),
                    "size": media.get("file_size"),
                    "storage_path": media.get("storage_path"),
                    "note": row.get("note"),
                    "place_id": row.get("place_id"),
                    "taken_at": row.get("taken_at"),
                    "created_at": row.get("created_at"),
                }
            )

        return {
            "items": items,
            "count": len(items),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list media: {exc}",
        )


# ============================================================
# UPLOAD
# ============================================================

@router.post("/")
async def upload_media(
    file: UploadFile = File(...),
    note: str | None = Form(None),
):
    client = get_db()

    data = await file.read()
    content_type = validate_file(file, data)

    filename = sanitize_filename(file.filename)
    storage_path = build_storage_path(filename)

    storage_uploaded = False
    media_id = None

    try:
        # ----------------------------------------------------
        # 1. Upload to Supabase Storage
        # ----------------------------------------------------

        client.storage.from_(SUPABASE_BUCKET).upload(
            storage_path,
            data,
            {
                "content-type": content_type,
            },
        )

        storage_uploaded = True

        public_url = get_public_url(
            client,
            SUPABASE_BUCKET,
            storage_path,
        )

        # ----------------------------------------------------
        # 2. Insert media_files
        # ----------------------------------------------------

        media_insert = {
            "user_id": DEV_USER_ID,
            "file_name": file.filename or filename,
            "file_url": public_url,
            "mime_type": content_type,
            "file_size": len(data),
            "storage_path": storage_path,
        }

        media_response = (
            client
            .table("media_files")
            .insert(media_insert)
            .execute()
        )

        if not media_response.data:
            raise RuntimeError(
                "media_files insert returned no data"
            )

        media = media_response.data[0]
        media_id = media["id"]

        # ----------------------------------------------------
        # 3. Insert gallery_items
        # ----------------------------------------------------

        gallery_insert = {
            "user_id": DEV_USER_ID,
            "media_id": media_id,
            "note": note,
        }

        gallery_response = (
            client
            .table("gallery_items")
            .insert(gallery_insert)
            .execute()
        )

        if not gallery_response.data:
            raise RuntimeError(
                "gallery_items insert returned no data"
            )

        gallery = gallery_response.data[0]

        return {
            "media": media,
            "gallery": gallery,
            "public_url": public_url,
        }

    except Exception as exc:
        # DB failed after Storage succeeded.
        # Remove orphaned Storage object.
        if storage_uploaded:
            remove_storage_file(
                client,
                SUPABASE_BUCKET,
                storage_path,
            )

        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {exc}",
        )


# ============================================================
# UPDATE NOTE
# ============================================================

@router.put("/{media_id}")
def update_media_note(
    media_id: str,
    note: str | None = Form(None),
):
    if note is None:
        raise HTTPException(
            status_code=400,
            detail="note is required",
        )

    client = get_db()

    try:
        # Verify that this media belongs to DEV_USER_ID
        gallery_response = (
            client
            .table("gallery_items")
            .select("id, media_id")
            .eq("media_id", media_id)
            .eq("user_id", DEV_USER_ID)
            .maybe_single()
            .execute()
        )

        if not gallery_response.data:
            raise HTTPException(
                status_code=404,
                detail="Media not found",
            )

        gallery_id = gallery_response.data["id"]

        response = (
            client
            .table("gallery_items")
            .update(
                {
                    "note": note,
                }
            )
            .eq("id", gallery_id)
            .eq("user_id", DEV_USER_ID)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Gallery item not found",
            )

        return {
            "gallery": response.data[0],
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Update failed: {exc}",
        )


# ============================================================
# DELETE
# ============================================================

@router.delete("/{media_id}")
def delete_media(media_id: str):
    client = get_db()

    try:
        # ----------------------------------------------------
        # 1. Find media
        # ----------------------------------------------------

        media_response = (
            client
            .table("media_files")
            .select("id, storage_path")
            .eq("id", media_id)
            .eq("user_id", DEV_USER_ID)
            .maybe_single()
            .execute()
        )

        if not media_response.data:
            raise HTTPException(
                status_code=404,
                detail="Media not found",
            )

        media = media_response.data
        storage_path = media["storage_path"]

        # ----------------------------------------------------
        # 2. Delete gallery item
        # ----------------------------------------------------

        (
            client
            .table("gallery_items")
            .delete()
            .eq("media_id", media_id)
            .eq("user_id", DEV_USER_ID)
            .execute()
        )

        # ----------------------------------------------------
        # 3. Delete media record
        # ----------------------------------------------------

        (
            client
            .table("media_files")
            .delete()
            .eq("id", media_id)
            .eq("user_id", DEV_USER_ID)
            .execute()
        )

        # ----------------------------------------------------
        # 4. Delete Storage object
        # ----------------------------------------------------

        remove_storage_file(
            client,
            SUPABASE_BUCKET,
            storage_path,
        )

        return {
            "deleted": True,
            "media_id": media_id,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Delete failed: {exc}",
        )


# ============================================================
# DOWNLOAD
# ============================================================

@router.get("/{media_id}/download")
def download_media(media_id: str):
    client = get_db()

    try:
        media_response = (
            client
            .table("media_files")
            .select("id, storage_path, file_name")
            .eq("id", media_id)
            .eq("user_id", DEV_USER_ID)
            .maybe_single()
            .execute()
        )

        if not media_response.data:
            raise HTTPException(
                status_code=404,
                detail="Media not found",
            )

        media = media_response.data
        storage_path = media["storage_path"]

        signed_response = (
            client
            .storage
            .from_(SUPABASE_BUCKET)
            .create_signed_url(
                storage_path,
                3600,
            )
        )

        url = None

        if isinstance(signed_response, dict):
            url = (
                signed_response.get("signedURL")
                or signed_response.get("signedUrl")
                or signed_response.get("signed_url")
            )

        if not url and hasattr(signed_response, "signed_url"):
            url = signed_response.signed_url

        if not url:
            raise RuntimeError(
                "Could not create signed download URL"
            )

        return {
            "download_url": url,
            "file_name": media["file_name"],
            "expires_in": 3600,
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Download failed: {exc}",
        )