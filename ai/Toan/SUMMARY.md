# TÓM TẮT KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI SUMMARY)
*(Tài liệu tóm tắt đưa vào Báo cáo Đồ án Môn học)*

---

### 1. Thông Tin Thành Viên & Dự Án
- **Họ và tên:** Đặng Hữu Toàn
- **Username Git / GitHub:** `DHTHuuToan`
- **Tên Đồ án:** Hệ thống nhận diện địa danh Việt Nam & Đo đạc sai số GIS (`IE221-DoAnPython`)
- **Môi trường & Công nghệ:** Python 3.14.3 (Arch Linux), FastAPI, SQLite & PostgreSQL (Supabase), React (Node.js v25.7.0, npm 11.11.0), Vite.js.
- **Vai trò trong nhóm:** Phát triển Phân hệ Quản lý Tài khoản & Xác thực (Auth & User Management), Phân hệ Truyền thông & Thư viện ảnh (Media & Gallery Storage), Phân hệ Khám phá Dữ liệu (Data Explorer), Tích hợp giải pháp Dự đoán AI & Trắc địa GIS Backend.

---

### 2. Các Đóng Góp Mã Nguồn Chính Của Thành Viên `DHTHuuToan`
*(Được xác thực 100% qua lịch sử Git commit và tệp mã nguồn của dự án)*

1. **Phân hệ Quản lý Người dùng & Xác thực (Users & Auth - `app/api/users.py`):**
   - **Đăng ký tài khoản (`POST /users/register`):** Tích hợp Supabase Auth `sign_up`, tự động khởi tạo hồ sơ người dùng trong `user_profiles` và cơ chế fallback ghi trực tiếp CSDL.
   - **Đăng nhập & Cấp JWT (`POST /users/login`):** Xác thực thông tin, trả về cặp `access_token` và `refresh_token`, tự động cập nhật mốc thời gian `last_login_at`.
   - **Quản lý Hồ sơ cá nhân (`GET /users/profile`, `PUT /users/profile`):** Trích xuất thông tin người dùng hiện tại qua middleware `get_current_user`, cho phép cập nhật `full_name` và `avatar_media_id`.
   - **Đổi mật khẩu (`POST /users/change-password`):** Kết nối dịch vụ Supabase Auth cập nhật mật khẩu an toàn.
   - **Cơ chế Fallback CSDL Postgres (`app/database/pg.py`):** Xây dựng bộ truy vấn trực tiếp đến PostgreSQL khi các dịch vụ Supabase Auth API gặp sự cố hoặc gián đoạn kết nối.

2. **Phân hệ Quản lý Thư viện Truyền thông (Media & Gallery - `app/api/media.py`):**
   - **Tải lên tệp phương tiện (`POST /media/`):** Tiếp nhận dữ liệu dạng `multipart/form-data`, tải trực tiếp lên Supabase Storage Bucket (`SUPABASE_BUCKET`), ghi dữ liệu đồng thời vào 2 bảng `media_files` và `gallery_items`.
   - **Duyệt danh sách ảnh (`GET /media/`):** Trích xuất thư viện ảnh cá nhân theo `DEV_USER_ID` (Dev Mode) hoặc `user_id` từ Token xác thực.
   - **Cập nhật & Xóa phương tiện (`PUT /media/{media_id}`, `DELETE /media/{media_id}`):** Cho phép chỉnh sửa ghi chú ảnh, xóa triệt để liên kết trong CSDL và file lưu trữ trên Cloud Storage.
   - **Sinh đường dẫn tải xuống an toàn (`GET /media/{media_id}/download`):** Sinh URL có thời hạn (Signed URL) thông qua Supabase Storage API.

3. **Phân hệ Khám phá Tập Dữ liệu Địa danh (Data Explorer - `app/api/data.py`):**
   - **Xem tổng quan dữ liệu (`GET /data/explorer`):** Cung cấp thông tin cấu trúc bộ dữ liệu (scope, danh sách tỉnh thành, danh mục địa danh, chỉ tiêu độ chính xác).
   - **Truy vấn & Phân trang dữ liệu (`GET /data/records`):** Tìm kiếm và phân trang tập dữ liệu địa danh Việt Nam với các trường chi tiết (tọa độ GPS, tỉnh thành, mô tả, liên kết Google Maps).

4. **Tích hợp Lõi AI Core & Trắc địa GIS (`app/api/predict.py`, `app/api/gis.py`):**
   - **API Nhận diện hình ảnh (`POST /predict`):** Tiếp nhận ảnh (`jpeg`, `png`, `webp`), chuyển qua pipeline AI nhận diện Top-K địa danh và tính toán sai số GIS.
   - **API Đo đạc trắc địa (`POST /gis/distance`, `POST /gis/calculate-error`, `POST /gis/select-location`):** Tính toán khoảng cách Geodesic WGS-84, Haversine, góc phương vị Bearing và đánh giá chỉ số phân cấp độ chính xác Acc@K.

---

### 3. Tóm Lược Mức Độ & Tính Chất Sử Dụng AI

| Tiêu chí | Nội dung chi tiết |
| :--- | :--- |
| **Công cụ AI** | Trợ lý AI hỗ trợ lập trình (AI Coding Assistant) & Mô hình AI nhận diện hình ảnh địa danh |
| **Tính chất sử dụng** | Đóng vai trò **Kênh tham vấn & hỏi đáp kỹ thuật (Technical Q&A / Consultation)** |
| **Các nhóm mục đích chính** | **1. Cấu hình môi trường & Dependency:** Tương thích Python 3.14.3, FastAPI trên Arch Linux, cấu hình Supabase Auth và quản lý biến môi trường (`DEV_SKIP_SUPABASE_AUTH`, `DEV_USER_ID`).<br>**2. Thiết lập cơ chế Fallback CSDL:** Tham vấn thiết kế luồng dự phòng đọc/ghi trực tiếp PostgreSQL qua `app/database/pg.py` khi Supabase Client lỗi.<br>**3. Xử lý Upload & Storage Cloud:** Tham vấn kỹ thuật tải file multipart qua FastAPI `UploadFile` lên Supabase Bucket và sinh Signed URL.<br>**4. Debugging & Middleware Auth:** Sửa lỗi xử lý Token JWT, phân quyền truy cập người dùng trong `app/auth/dependencies.py`.<br>**5. Tối ưu thuật toán GIS:** Tham vấn các công thức toán học tính khoảng cách Haversine và Bearing angle. |
| **Tỷ lệ đóng góp thực tế** | Toàn bộ kiến trúc API, luồng xử lý xác thực, thao tác CSDL/Storage và 100% mã nguồn do thành viên tự thiết kế, triển khai và kiểm thử. AI chỉ đóng vai trò hỗ trợ tham vấn cú pháp và hướng dẫn sửa lỗi khi gặp vấn đề kỹ thuật. |

---

### 4. Quy Trình Kiểm Thử & Đảm Bảo Chất Lượng

Mọi nội dung có sự trợ giúp từ AI đều trải qua quy trình kiểm thử 5 bước nghiêm ngặt trước khi tích hợp:
1. **Kiểm tra biên dịch & Cú pháp (Static Checking):** Kiểm tra tương thích Python 3.14.3; kiểm tra build thành công Frontend React với Node v25.7.0 / npm 11.11.0.
2. **Kiểm tra Conflict Git:** Sử dụng lệnh `git grep` để đảm bảo sạch 100% conflict markers.
3. **Kiểm thử API độc lập (Swagger UI / Postman):** Truy cập `http://127.0.0.1:8000/docs` để kiểm thử toàn bộ các endpoints (Auth, Media, Data Explorer, Predict, GIS).
4. **Kiểm thử luồng Lưu trữ & Auth thực tế:** Kiểm tra luồng Đăng ký $\rightarrow$ Đăng nhập lấy Bearer Token $\rightarrow$ Upload ảnh lên Supabase Storage $\rightarrow$ Lấy Signed URL tải về.
5. **Kiểm thử tích hợp End-to-End Frontend & Backend:** Chạy Frontend React (`npm run dev`) kết nối API FastAPI (`uvicorn app.main:app --reload`), xác minh dữ liệu hiển thị chính xác trên giao diện Web.

---

### 5. Cam Kết Tính Độc Lập & Đạo Đức Học Thuật

- Thành viên `Đặng Hữu Toàn` (`DHTHuuToan`) cam đoan toàn bộ thông tin khai báo trên là trung thực, phản ánh chính xác quá trình làm việc của bản thân dựa trên lịch sử Git của dự án.
- Không có hành vi lạm dụng AI để sinh mã nguồn tự động không kiểm soát; không sao chép mã nguồn của người khác.
- Bản khai báo không chứa bất kỳ khóa bí mật (secret keys) hoặc thông tin bảo mật nào của hệ thống.