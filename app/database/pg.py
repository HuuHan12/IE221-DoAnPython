import os
import psycopg

POSTGRES_URL = os.getenv("POSTGRES_URL")


def insert_media_file(user_id, file_name, file_url, mime_type, file_size, storage_path):
    """Insert a row into public.media_files and return the inserted row (id, created_at) if possible."""
    if not POSTGRES_URL:
        raise RuntimeError("POSTGRES_URL not configured in environment")

    insert_sql = (
        "INSERT INTO public.media_files (user_id, file_name, file_url, mime_type, file_size, storage_path) "
        "VALUES (%(user_id)s, %(file_name)s, %(file_url)s, %(mime_type)s, %(file_size)s, %(storage_path)s) "
        "RETURNING id, created_at"
    )
    params = {
        "user_id": user_id,
        "file_name": file_name,
        "file_url": file_url,
        "mime_type": mime_type,
        "file_size": file_size,
        "storage_path": storage_path,
    }

    # Open a short-lived connection for simplicity.
    with psycopg.connect(POSTGRES_URL, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(insert_sql, params)
            row = cur.fetchone()
            if row:
                return {"id": row[0], "created_at": row[1].isoformat() if row[1] is not None else None}

    return None


def update_user_profile(user_id, update_data: dict):
    """Update user_profiles for a given user_id. Returns updated row if possible."""
    if not POSTGRES_URL:
        raise RuntimeError("POSTGRES_URL not configured in environment")

    set_clauses = []
    params = {"user_id": user_id}
    i = 0
    for k, v in update_data.items():
        i += 1
        key = f"p{i}"
        set_clauses.append(f"{k} = %({key})s")
        params[key] = v

    if not set_clauses:
        return None

    sql = (
        "UPDATE public.user_profiles SET " + ", ".join(set_clauses) + " WHERE user_id = %(user_id)s RETURNING id, user_id, full_name, avatar_media_id, created_at, updated_at"
    )
    with psycopg.connect(POSTGRES_URL, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
            if row:
                return {
                    "id": row[0],
                    "user_id": row[1],
                    "full_name": row[2],
                    "avatar_media_id": row[3],
                    "created_at": row[4].isoformat() if row[4] is not None else None,
                    "updated_at": row[5].isoformat() if row[5] is not None else None,
                }
    return None


def update_user_last_login(user_id, timestamp_iso: str):
    """Update users.last_login_at for given user_id."""
    if not POSTGRES_URL:
        raise RuntimeError("POSTGRES_URL not configured in environment")

    sql = "UPDATE public.users SET last_login_at = %(ts)s WHERE id = %(user_id)s RETURNING id, last_login_at"
    params = {"ts": timestamp_iso, "user_id": user_id}
    with psycopg.connect(POSTGRES_URL, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
            if row:
                return {"id": row[0], "last_login_at": row[1].isoformat() if row[1] is not None else None}
    return None


def insert_gallery_item(user_id, media_id, note=None):
    """Insert into public.gallery_items and return inserted id and created_at."""
    if not POSTGRES_URL:
        raise RuntimeError("POSTGRES_URL not configured in environment")

    sql = (
        "INSERT INTO public.gallery_items (user_id, media_id, note) VALUES (%(user_id)s, %(media_id)s, %(note)s) RETURNING id, created_at"
    )
    params = {"user_id": user_id, "media_id": media_id, "note": note}
    with psycopg.connect(POSTGRES_URL, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
            if row:
                return {"id": row[0], "created_at": row[1].isoformat() if row[1] is not None else None}
    return None


def update_gallery_note(media_id, user_id, note):
    """Update note on gallery_items for a user's media and return number of rows updated."""
    if not POSTGRES_URL:
        raise RuntimeError("POSTGRES_URL not configured in environment")

    sql = "UPDATE public.gallery_items SET note = %(note)s WHERE media_id = %(media_id)s AND user_id = %(user_id)s RETURNING id"
    params = {"note": note, "media_id": media_id, "user_id": user_id}
    with psycopg.connect(POSTGRES_URL, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
            return 1 if row else 0


def delete_media_and_gallery(media_id, user_id):
    """Delete gallery_items and media_files for given media_id and user_id. Returns True if deleted."""
    if not POSTGRES_URL:
        raise RuntimeError("POSTGRES_URL not configured in environment")

    # Delete gallery items first (FK will cascade), then media_files
    del_gallery_sql = "DELETE FROM public.gallery_items WHERE media_id = %(media_id)s AND user_id = %(user_id)s"
    del_media_sql = "DELETE FROM public.media_files WHERE id = %(media_id)s AND user_id = %(user_id)s"
    params = {"media_id": media_id, "user_id": user_id}
    with psycopg.connect(POSTGRES_URL, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(del_gallery_sql, params)
            cur.execute(del_media_sql, params)
            # Check media deleted
            cur.execute("SELECT 1 FROM public.media_files WHERE id = %(media_id)s", {"media_id": media_id})
            row = cur.fetchone()
            return False if row else True


def list_gallery_items(user_id):
    """Return a list of gallery items joined with media_files for a user."""
    if not POSTGRES_URL:
        raise RuntimeError("POSTGRES_URL not configured in environment")

    sql = (
        "SELECT g.id as gallery_id, m.id as media_id, m.file_url, m.file_name, m.mime_type, m.file_size, g.note, g.created_at "
        "FROM public.gallery_items g JOIN public.media_files m ON g.media_id = m.id "
        "WHERE g.user_id = %(user_id)s ORDER BY g.created_at DESC"
    )
    params = {"user_id": user_id}
    items = []
    with psycopg.connect(POSTGRES_URL, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
            for r in rows:
                items.append({
                    "id": str(r[1]),
                    "gallery_id": str(r[0]),
                    "url": r[2],
                    "file_name": r[3],
                    "mime_type": r[4],
                    "size": r[5],
                    "note": r[6],
                    "created_at": r[7].isoformat() if r[7] is not None else None,
                })
    return items


def get_user_and_profile(user_id):
    """Return user and profile dicts by user_id using direct Postgres queries."""
    if not POSTGRES_URL:
        raise RuntimeError("POSTGRES_URL not configured in environment")

    user_sql = "SELECT id,email,status,last_login_at,created_at,updated_at FROM public.users WHERE id = %(user_id)s"
    profile_sql = "SELECT id,user_id,full_name,avatar_media_id,created_at,updated_at FROM public.user_profiles WHERE user_id = %(user_id)s"
    params = {"user_id": user_id}
    user = None
    profile = None
    with psycopg.connect(POSTGRES_URL, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute(user_sql, params)
            r = cur.fetchone()
            if r:
                user = {
                    "id": str(r[0]),
                    "email": r[1],
                    "status": r[2],
                    "last_login_at": r[3].isoformat() if r[3] is not None else None,
                    "created_at": r[4].isoformat() if r[4] is not None else None,
                    "updated_at": r[5].isoformat() if r[5] is not None else None,
                }
            cur.execute(profile_sql, params)
            r2 = cur.fetchone()
            if r2:
                profile = {
                    "id": str(r2[0]),
                    "user_id": str(r2[1]),
                    "full_name": r2[2],
                    "avatar_media_id": str(r2[3]) if r2[3] is not None else None,
                    "created_at": r2[4].isoformat() if r2[4] is not None else None,
                    "updated_at": r2[5].isoformat() if r2[5] is not None else None,
                }
    return user, profile
