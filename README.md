# IE221-DoAnPython

Yêu cầu app:

```
(.venv) [harch@archlinux IE221-DoAnPython]$ npm -v
11.11.0
(.venv) [harch@archlinux IE221-DoAnPython]$ node -v
v25.7.0
(.venv) [harch@archlinux IE221-DoAnPython]$ python --version
Python 3.14.3
```

Techstack:

- Python, sqlite, fastapi, react, vitejs

Start app:

1. cd vào `/app` chạy `python -m pip install -r requirements.txt`
2. chạy lệnh start app: `uvicorn app.main:app --reload`
3. xem swagger docs tại `http://127.0.0.1:8000/docs` sau khi start

Start web:

1. cd vào `/web`, chạy `npm install` trước
2. start web `npm run dev`

Web:

<img width="2560" height="1354" alt="image" src="https://github.com/user-attachments/assets/1f9f3a3c-b1c3-4630-a03d-7b7cf89decd5" />


# API Documentation

This document lists the backend API routes implemented under `app/api/`, with request parameters and response shapes (concise).

**Notes:**
- Many endpoints use Supabase; some admin/dev endpoints require `DEV_USER_ID` or use Dev auth. See `app/auth/dependencies.py` and environment variables (`DEV_SKIP_SUPABASE_AUTH`, `DEV_USER_ID`, `PUBLIC_UPLOAD_USER_ID`, `SUPABASE_BUCKET`).

---

## Hello

### GET /
- Path: `/`
- Auth: none
- Request: none
- Response: 200
  - `{ "message": "Hello, World!" }`

---

## Predict
Prefix: (root)

### POST /predict
- Path: `/predict`
- Auth: none
- Request: multipart/form-data
  - `image` (file, required) — allowed: `image/jpeg`, `image/png`, `image/webp`
  - `top_k` (form, optional) default `5`
  - `scope` (form, optional) default `iconic`
  - `ground_truth_lat` (form, optional)
  - `ground_truth_lon` (form, optional)
- Responses:
  - 200: prediction result
    - Keys: `id`, `filename`, `content_type`, `size_bytes`, `size` (human), `scope`, `top_k`, `landmark`, `confidence`, `prediction` (best), `predictions` (list), `gis_error` (object or null), `elapsed_seconds`, `total_gallery`
  - 400: validation errors (file type/size/empty)
  - 404: not found (no predictions)

### POST /gis/distance
- Path: `/gis/distance`
- Request (JSON): `{ lat1, lon1, lat2, lon2 }`
- Response 200: `{ "distance_km": float, "distance_meters": float }`

---

## Data Explorer
Prefix: `/data`

### GET /data/explorer
- Query: `scope` (default `iconic`)
- Response 200: overview object
  - Keys: `scope`, `file_name`, `title`, `subtitle`, `accuracy_target`, `badge_icon`, `total_records`, `columns` (list), `regions` (list), `categories` (list)

### GET /data/records
- Query params:
  - `scope` (default `iconic`)
  - `page` (int, default 1)
  - `page_size` (int, default 10, max 100)
  - `search` (optional)
- Response 200: paginated records
  - Keys: `scope`, `page`, `page_size`, `total_records`, `total_pages`, `records` (list of items)
  - Each record item: `{ index, lat, lon, name, category, province, description, gmaps_url }`

---

## GIS Measurements
Prefix: `/gis`

### POST /gis/calculate-error
- Request JSON: {
  - `ground_truth_lat`, `ground_truth_lon`, `predicted_lat`, `predicted_lon`, `predictions` (optional list)
}
- Response 200: object with detailed GIS error and benchmarks
  - Keys: `is_valid`, `ground_truth`, `prediction`, `distance_km`, `distance_meters`, `haversine_km`, `formatted_distance`, `bearing_degrees`, `bearing_compass`, `accuracy_benchmark`, `accuracy_label`, `accuracy_short_label`, `accuracy_icon`, `accuracy_level`, `top_k_distances` (list)

### POST /gis/select-location
- Request JSON: `{ selected_item: {...}, ground_truth?: {...} }`
- Response 200: `{ prediction: {...}, gis_error: {...} }`

---

## Media (Gallery)
Prefix: `/media`

> Note: current implementation expects `DEV_USER_ID` env var for the user context in Dev. Production uses Supabase auth and `user_id` from tokens.

### GET /media/
- Path: `/media/`
- Auth: uses `DEV_USER_ID` or Supabase client
- Request: none
- Response 200:
  - `{ items: [ { id, gallery_id, url, file_name, mime_type, size, storage_path, note, place_id, taken_at, created_at } ], count: int }

### POST /media/
- Path: `/media/`
- Request: multipart/form-data
  - `file` (file, required)
  - `note` (form, optional)
- Behavior:
  1. Upload file to Supabase Storage bucket (`SUPABASE_BUCKET`)
  2. Insert to `media_files` table
  3. Insert to `gallery_items` table linking media
- Response 200:
  - `{ "media": <media_row>, "gallery": <gallery_row>, "public_url": string }
  - `media` typical fields: `id, user_id, file_name, file_url, mime_type, file_size, storage_path, created_at`
  - `gallery` typical fields: `id, user_id, media_id, note, created_at`
- Errors: 400 validation, 500 upload/DB errors

### PUT /media/{media_id}
- Path param: `media_id` (uuid string)
- Request: form `note` (required)
- Auth: `DEV_USER_ID` / Supabase
- Response 200: `{ "gallery": <updated_gallery_row> }`

### DELETE /media/{media_id}
- Path param: `media_id`
- Behavior: delete gallery_item, media_files row, and storage object
- Response 200: `{ "deleted": True, "media_id": <id> }`

### GET /media/{media_id}/download
- Path param: `media_id`
- Behavior: create signed URL via Supabase Storage
- Response 200: `{ "download_url": string, "file_name": string, "expires_in": int }`

---

## Users
Prefix: `/users`

### POST /users/register
- Request JSON: `{ "email": string, "password": string, "full_name"?: string }
- Response 201: `{ message, user: { id, email } }`
- Notes: uses `supabase.auth.sign_up`; attempts to update `user_profiles.full_name` and falls back to direct Postgres update if needed.

### POST /users/login
- Request JSON: `{ "email": string, "password": string }`
- Response 200: `{ message, access_token, refresh_token, token_type: "bearer", user: { id, email } }`
- Notes: updates `users.last_login_at` (Supabase or Postgres fallback).

### GET /users/profile
- Auth: required (`get_current_user` dependency)
- Response 200: `{ user: {...}, profile: {...} }`
  - `user` fields: `id, email, status, last_login_at, created_at, updated_at`
  - `profile` fields: `id, user_id, full_name, avatar_media_id, created_at, updated_at`
- Implementation: tries Supabase first; on failure reads directly from Postgres.

### PUT /users/profile
- Auth: required
- Request JSON: `{ full_name?: string, avatar_media_id?: string }`
- Response 200: `{ message, profile }` where `profile` is the updated profile object.
- Validation: at least one field required.
- Fallback: tries Supabase update; on failure uses direct Postgres helper.

### POST /users/change-password
- Auth: required
- Request JSON: `{ new_password: string }`
- Response 200: `{ message }`
- Notes: uses `supabase.auth.update_user`.

---

## How to use this doc
- This is a concise reference; use the code in `app/api/*.py` for exact behavior and field names.
- For auth flows: check `app/auth/dependencies.py` for `get_current_user` behavior and `DEV_SKIP_SUPABASE_AUTH` dev-mode.
- For direct Postgres fallbacks and helpers see `app/database/pg.py`.

---

Generated on: 2026-08-23
