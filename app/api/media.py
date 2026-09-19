import os
import tempfile
import time
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from app.core.security import get_current_user
from app.database.supabase import SUPABASE_URL, get_supabase_admin_client
from app.utils.geoclip import predict_image


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
SIGNED_URL_EXPIRES_IN = 3600

SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "uploads")


def get_db():
    return get_supabase_admin_client()


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


def build_storage_path(filename: str, user_id: str) -> str:
    return f"{user_id}/{int(time.time())}_{filename}"


def _storage_response_value(response, *keys: str):
    """Return a value from the response shapes used by supabase-py."""

    if isinstance(response, dict):
        for key in keys:
            if key in response and response[key] is not None:
                value = response[key]
                return value

        nested = response.get("data")
        if isinstance(nested, dict):
            for key in keys:
                if key in nested and nested[key] is not None:
                    value = nested[key]
                    return value

    for key in keys:
        value = getattr(response, key, None)
        if value is not None:
            return value

    return None


def get_bucket_public(client, bucket: str) -> bool:
    """Read bucket visibility once and fail clearly when unavailable."""

    try:
        response = client.storage.get_bucket(bucket)
    except Exception as exc:
        raise RuntimeError(
            f"Unable to inspect Supabase Storage bucket '{bucket}': {exc}"
        ) from exc

    public = _storage_response_value(response, "public")
    if isinstance(public, str):
        public = public.strip().lower() in {"1", "true", "yes", "on"}

    if not isinstance(public, bool):
        raise RuntimeError(
            f"Supabase Storage bucket '{bucket}' did not return a public flag"
        )

    return public


def get_public_url(client, bucket: str, storage_path: str) -> str:
    """Build a public object URL from the Storage API response."""

    response = client.storage.from_(bucket).get_public_url(storage_path)
    url = _storage_response_value(
        response,
        "publicUrl",
        "publicURL",
        "public_url",
    )

    # Supabase versions differ: some return the URL directly as a string.
    if isinstance(response, str) and response.strip():
        url = response.strip()

    if url:
        return str(url)

    if SUPABASE_URL:
        return (
            f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/"
            f"{bucket}/{storage_path}"
        )

    raise RuntimeError(
        f"Supabase Storage did not return a public URL for '{storage_path}'"
    )


def get_signed_url(client, bucket: str, storage_path: str) -> str:
    """Create a short-lived URL for an object in a private bucket."""

    try:
        response = (
            client.storage.from_(bucket).create_signed_url(
                storage_path,
                SIGNED_URL_EXPIRES_IN,
            )
        )
    except Exception as exc:
        raise RuntimeError(
            f"Unable to create a signed URL for '{storage_path}': {exc}"
        ) from exc

    url = _storage_response_value(
        response,
        "signedURL",
        "signedUrl",
        "signed_url",
    )
    if not url:
        raise RuntimeError(
            f"Supabase Storage did not return a signed URL for '{storage_path}'"
        )

    return str(url)


def get_display_url(
    client,
    bucket: str,
    storage_path: str,
    bucket_public: bool | None = None,
) -> str:
    """Return a usable object URL without persisting private signed URLs."""

    if bucket_public is None:
        bucket_public = get_bucket_public(client, bucket)

    if bucket_public:
        return get_public_url(client, bucket, storage_path)

    return get_signed_url(client, bucket, storage_path)


def remove_storage_file(client, bucket: str, storage_path: str):
    try:
        client.storage.from_(bucket).remove([storage_path])
    except Exception:
        pass


def remove_media_record(client, media_id: str, user_id: str):
    """Best-effort cleanup that never hides the original upload error."""

    try:
        (
            client.table("media_files")
            .delete()
            .eq("id", media_id)
            .eq("user_id", user_id)
            .execute()
        )
    except Exception:
        pass


def find_place_id(client, landmark: str) -> str | None:
    exact_response = (
        client.table("places")
        .select("id")
        .ilike("name", landmark)
        .limit(1)
        .execute()
    )
    if exact_response.data:
        return str(exact_response.data[0]["id"])

    partial_response = (
        client.table("places")
        .select("id")
        .ilike("name", f"%{landmark}%")
        .limit(1)
        .execute()
    )
    if partial_response.data:
        return str(partial_response.data[0]["id"])
    return None


def recognize_place(
    client,
    data: bytes,
    original_filename: str | None,
    scope: str,
):
    suffix = Path(original_filename or "upload.jpg").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
        suffix = ".jpg"

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(data)
            temp_path = temp_file.name

        predictions = predict_image(temp_path, top_k=1, scope=scope)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Landmark recognition failed: {exc}",
        ) from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

    if not predictions:
        raise HTTPException(
            status_code=422,
            detail="No landmark was recognized from the uploaded image",
        )

    prediction = predictions[0]
    landmark = prediction.get("name")
    if not landmark:
        raise HTTPException(
            status_code=422,
            detail="The recognition result does not contain a landmark name",
        )

    place_id = find_place_id(client, landmark)
    if not place_id:
        raise HTTPException(
            status_code=422,
            detail=f"Recognized landmark is not available in places: {landmark}",
        )

    return {
        "place_id": place_id,
        "landmark": landmark,
        "confidence": float(prediction.get("prob_percent", 0.0)) / 100.0,
        "prediction": prediction,
    }


# ============================================================
# LIST
# ============================================================

@router.get("/")
def list_media(current_user=Depends(get_current_user)):
    client = get_db()
    user_id = str(current_user.id)

    try:
        bucket_public = get_bucket_public(client, SUPABASE_BUCKET)
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
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        items = []

        for row in gallery_response.data or []:
            media = row.get("media_files") or {}
            if isinstance(media, list):
                media = media[0] if media else {}

            storage_path = media.get("storage_path")
            if not storage_path:
                raise RuntimeError(
                    f"Gallery item {row.get('id', '<unknown>')} has no storage path"
                )

            display_url = get_display_url(
                client,
                SUPABASE_BUCKET,
                storage_path,
                bucket_public=bucket_public,
            )

            items.append(
                {
                    "id": media.get("id"),
                    "gallery_id": row.get("id"),
                    "url": display_url,
                    "file_url": display_url,
                    "file_name": media.get("file_name"),
                    "mime_type": media.get("mime_type"),
                    "size": media.get("file_size"),
                    "file_size": media.get("file_size"),
                    "storage_path": storage_path,
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
    scope: str = Form("iconic"),
    recognize: bool = Form(False),
    current_user=Depends(get_current_user),
):
    client = get_db()
    user_id = str(current_user.id)

    data = await file.read()
    content_type = validate_file(file, data)
    recognition = None
    if recognize:
        recognition = recognize_place(
            client,
            data,
            file.filename,
            scope,
        )

    filename = sanitize_filename(file.filename)
    storage_path = build_storage_path(filename, user_id)

    storage_uploaded = False
    media_id = None

    try:
        bucket_public = get_bucket_public(client, SUPABASE_BUCKET)

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

        display_url = get_display_url(
            client,
            SUPABASE_BUCKET,
            storage_path,
            bucket_public=bucket_public,
        )

        # ----------------------------------------------------
        # 2. Insert media_files
        # ----------------------------------------------------

        media_insert = {
            "user_id": user_id,
            "file_name": file.filename or filename,
            # Signed URLs expire; derive them from storage_path for private
            # buckets instead of persisting them in media_files.
            "file_url": display_url if bucket_public else None,
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
            "user_id": user_id,
            "media_id": media_id,
            "place_id": recognition["place_id"] if recognition else None,
            "note": note,
        }

        gallery_response = (
            client
            .table("gallery_items")
            .insert(gallery_insert)
            .execute()
        )

        if gallery_response is None or not gallery_response.data:
            raise RuntimeError(
                "gallery_items insert returned no data"
            )

        gallery = gallery_response.data[0]

        return {
            "media": media,
            "gallery": gallery,
            # Kept for frontend/backward compatibility. For a private bucket
            # this is a signed URL and is intentionally not stored in DB.
            "public_url": display_url,
            "recognition": recognition,
        }

    except HTTPException:
        if media_id:
            remove_media_record(client, media_id, user_id)
        if storage_uploaded:
            remove_storage_file(
                client,
                SUPABASE_BUCKET,
                storage_path,
            )
        raise

    except Exception as exc:
        # DB failed after Storage succeeded. Remove both potential orphans.
        if media_id:
            remove_media_record(client, media_id, user_id)
        if storage_uploaded:
            remove_storage_file(
                client,
                SUPABASE_BUCKET,
                storage_path,
            )

        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {exc}",
        ) from exc


# ============================================================
# UPDATE NOTE
# ============================================================

@router.put("/{media_id}")
def update_media_note(
    media_id: str,
    note: str | None = Form(None),
    current_user=Depends(get_current_user),
):
    if note is None:
        raise HTTPException(
            status_code=400,
            detail="note is required",
        )

    client = get_db()
    user_id = str(current_user.id)

    try:
        # Verify that this media belongs to user_id
        gallery_response = (
            client
            .table("gallery_items")
            .select("id, media_id")
            .eq("media_id", media_id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )

        if gallery_response is None or not gallery_response.data:
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
            .eq("user_id", user_id)
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
def delete_media(media_id: str, current_user=Depends(get_current_user)):
    client = get_db()
    user_id = str(current_user.id)

    try:
        # ----------------------------------------------------
        # 1. Find media
        # ----------------------------------------------------

        media_response = (
            client
            .table("media_files")
            .select("id, storage_path")
            .eq("id", media_id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )

        if media_response is None or not media_response.data:
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
            .eq("user_id", user_id)
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
            .eq("user_id", user_id)
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
def download_media(media_id: str, current_user=Depends(get_current_user)):
    client = get_db()
    user_id = str(current_user.id)

    try:
        media_response = (
            client
            .table("media_files")
            .select("id, storage_path, file_name")
            .eq("id", media_id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )

        if media_response is None or not media_response.data:
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

