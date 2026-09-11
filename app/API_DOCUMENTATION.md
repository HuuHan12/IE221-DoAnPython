# API Documentation (auto-generated)

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

## Payments & Pricing (VietQR)
Prefix: `/payments`

### GET /payments/plans
- Auth: none
- Request: none
- Response 200:
  - `status`: `"success"`
  - `total_plans`: int
  - `data`: list of plan objects (`code`, `name`, `tagline`, `price`, `formatted_price`, `billing_period`, `scan_limit_per_day`, `features`, `badge`, `is_active`)

### POST /payments/create-qr
- Auth: optional / Bearer token (defaults to dev user in local)
- Request JSON:
  - `plan_code`: string (default `"pro"`)
  - `duration_months`: int (default `1`)
- Response 201:
  - `status`: `"success"`
  - `order_code`: string (e.g. `"PRO879124"`)
  - `plan_code`: `"pro"`
  - `plan_name`: `"Pro"`
  - `amount`: int (`99000`)
  - `formatted_amount`: `"99.000 đ"`
  - `currency`: `"VND"`
  - `qr_url`: string (VietQR Napas 247 image URL)
  - `bank_info`: `{ bank_id: "TPB", bank_name: "Ngân hàng TMCP Tiên Phong (TPBank)", account_no: "87971498888", account_name: "DOAN HUU HAN" }`
  - `payment_content`: string (e.g. `"PRO879124"`)
  - `expires_at`: ISO 8601 string
  - `expires_in_seconds`: int (`900`)

### GET /payments/status/{order_code}
- Path param: `order_code` (string)
- Auth: none
- Response 200:
  - `status`: `"success"`
  - `order_code`: string
  - `order_status`: `"pending"` | `"completed"` | `"expired"` | `"cancelled"`
  - `plan_code`: string
  - `amount`: int
  - `is_completed`: boolean
  - `completed_at`: string | null

### POST /payments/simulate-success
- Auth: none
- Request JSON: `{ "order_code": string }`
- Behavior: Marks order as `completed` and activates 30-day Pro subscription for user.
- Response 200: `{ status: "success", order_code, order_status: "completed", is_completed: true, completed_at }`

### GET /payments/my-subscription
- Auth: required / dev user
- Response 200:
  - `{ status: "success", user_id, plan_code, plan_name, subscription_status, scan_limit_per_day, start_date, end_date, days_remaining, is_active }`

---

## Contact & Support
Prefix: `/contact`

### GET /contact/subjects
- Path: `/contact/subjects`
- Auth: none (public)
- Response 200:
  - `status`: `"success"`
  - `subjects`: `["Tư vấn gói cước", "Báo lỗi kỹ thuật", "Hợp tác phát triển", "Góp ý tính năng", "Khác"]`

### POST /contact/submit
- Path: `/contact/submit`
- Auth: required (`get_current_user` — người dùng phải có tài khoản tồn tại trong `public.users`)
- Request JSON:
  - `full_name`: string (2-100 ký tự, required)
  - `email`: string (email format, required)
  - `subject`: string (chủ đề, required)
  - `phone`: string | null (tùy chọn)
  - `message`: string (5-3000 ký tự, required)
- Responses:
  - 201: `{ "status": "success", "message": "...", "data": { "id", "user_id", "full_name", "email", "phone", "subject", "message", "status", "created_at" } }`
  - 401: Unauthorized (Chưa đăng nhập hoặc tài khoản không tồn tại trong hệ thống)
  - 422: Validation error
- Behavior: Lưu bản ghi vào bảng `contact_messages` và tự động kích hoạt `BackgroundTasks` gửi thông báo chi tiết qua Telegram Bot.

---

## Notifications
Prefix: `/notifications`

### GET /notifications/unread-count
- Path: `/notifications/unread-count`
- Auth: required (`get_current_user`)
- Response 200:
  - `{ "status": "success", "unread_count": int }`
  - Mục đích: Dùng cho Header hiển thị chấm đỏ trên biểu tượng Quả chuông.

### GET /notifications
- Path: `/notifications`
- Auth: required (`get_current_user`)
- Query params:
  - `unread_only`: boolean (default `false`)
  - `limit`: int (default `20`, max `100`)
- Response 200:
  - `{ "status": "success", "unread_count": int, "total": int, "data": [ { "id", "user_id", "type", "title", "content", "is_read", "read_at", "created_at" } ] }`

### PATCH /notifications/{notification_id}/read
- Path: `/notifications/{notification_id}/read`
- Auth: required (`get_current_user`)
- Response 200:
  - `{ "status": "success", "message": "Đã đánh dấu thông báo là đã đọc." }`

### PATCH /notifications/read-all
- Path: `/notifications/read-all`
- Auth: required (`get_current_user`)
- Response 200:
  - `{ "status": "success", "message": "Đã đánh dấu tất cả thông báo là đã đọc." }`

---

## Achievements
Prefix: `/achievements`

### GET /achievements/my
- Path: `/achievements/my`
- Auth: required (`get_current_user`)
- Response 200:
  - `{ "status": "success", "total_achievements": int, "unlocked_count": int, "completion_rate": float, "data": [ { "id", "code", "name", "description", "achievement_type", "target_value", "progress", "progress_percent", "is_unlocked", "unlocked_at" } ] }`
  - Mục đích: Cung cấp toàn bộ 7 danh hiệu chuẩn, tính toán % tiến độ và trạng thái mở khóa cho trang Profile.

### POST /achievements/record-checkin
- Path: `/achievements/record-checkin`
- Auth: required (`get_current_user`)
- Response 200:
  - `{ "status": "success", "message": "...", "total_checkins": int, "new_unlocked": [ "STREAK_1", ... ] }`
  - Hành vi: Tự động tăng số lần check-in, mở khóa huy hiệu khi đạt mốc và kích hoạt thông báo quả chuông Header.

---

## How to use this doc
- This is a concise reference; use the code in `app/api/*.py` for exact behavior and field names.
- For auth flows: check `app/core/security.py` and `app/database/supabase.py` for `get_current_user`.
- For direct Postgres fallbacks and helpers see `app/database/pg.py`.

---

Generated on: 2026-09-11

