# BẢN KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO

**Dự án:** Hệ thống nhận diện địa danh Việt Nam & Đo đạc sai số GIS (`IE221-DoAnPython`)  
**Thành viên thực hiện:** Đặng Hữu Toàn  
**Username Git/GitHub:** `DHTHuuToan`  
**Ngày lập báo cáo:** 05/10/2026  

---

## 1. Công Cụ AI Đã Sử Dụng

1. **Trợ lý lập trình AI (AI Coding Assistant):**
   - **Tên công cụ:** Trợ lý AI hỗ trợ lập trình (AI Coding Assistant)
   - **Môi trường hoạt động:** Tích hợp trực tiếp trong môi trường phát triển mã nguồn cục bộ (IDE trên Arch Linux).
   - **Vai trò:** Hỗ trợ tham vấn kỹ thuật FastAPI/Python 3.14, tra cứu cú pháp thư viện Supabase/PostgreSQL, gợi ý phương án xây dựng cơ chế Fallback CSDL và rà soát lỗi logic (debugging).

2. **Mô hình AI Lõi trong Sản phẩm (Product Core AI Model):**
   - **Tên mô hình/thư viện:** Mô hình học sâu trích xuất đặc trưng thị giác và so khớp tọa độ địa danh Việt Nam.
   - **Vai trò trong sản phẩm:** Xử lý file ảnh đầu vào (`POST /predict`), so sánh vector đặc trưng và trả về danh sách Top-K địa danh dự đoán kèm độ tin cậy.

---

## 2. Mục Đích Sử Dụng AI

Dựa trên bằng chứng thực tế từ quá trình phát triển mã nguồn dự án, AI được sử dụng với vai trò **tham vấn, hỏi đáp kỹ thuật (Technical Q&A / Consultation)** và hỗ trợ tư duy kiến trúc:

1. **Tham vấn cấu hình môi trường & Thư viện phụ thuộc:**
   - Hướng dẫn cấu hình môi trường Python 3.14.3 trên Arch Linux, quản lý dependency trong `requirements.txt`, thiết lập môi trường ảo `.venv` và tích hợp FastAPI uvicorn server.

2. **Thiết lập kiến trúc Xác thực & Cơ chế Fallback PostgreSQL:**
   - Tham vấn thiết kế luồng Đăng ký/Đăng nhập qua Supabase Auth API (`app/api/users.py`), kết hợp cơ chế dự phòng (fallback) truy vấn trực tiếp PostgreSQL (`app/database/pg.py`) khi dịch vụ Cloud gặp sự cố gián đoạn.

3. **Tham vấn xử lý Tệp truyền thông & Cloud Storage:**
   - Hướng dẫn tiếp nhận file multipart `UploadFile` trong FastAPI, đẩy dữ liệu trực tiếp lên Supabase Bucket (`SUPABASE_BUCKET`), lưu trữ siêu dữ liệu vào bảng `media_files`/`gallery_items` và sinh Signed URL cho việc tải file.

4. **Debugging Auth Dependencies & Middleware:**
   - Phân tích và xử lý các lỗi liên quan đến HTTP 401/403 trong `app/auth/dependencies.py`, hỗ trợ cơ chế chế độ Dev (`DEV_SKIP_SUPABASE_AUTH`, `DEV_USER_ID`) giúp việc kiểm thử cục bộ diễn ra thuận tiện.

5. **Tham vấn thuật toán Trắc địa GIS:**
   - Chuẩn hóa các công thức tính khoảng cách mặt cầu Haversine, khoảng cách Geodesic WGS-84, tính góc phương vị Bearing và chuẩn hóa định dạng kết quả đo đạc sai số GIS cho `POST /gis/calculate-error`.

---

## 3. Một Số Câu Prompt Tiêu Biểu và Quy Trình Tương Tác

### 🔹 Prompt Mẫu 1: Về Thiết Kế Luồng Fallback CSDL Cho User Profile
> **Câu Prompt của DHTHuuToan:**  
> *"Dự án FastAPI của tôi dùng Supabase Auth để quản lý user. Tuy nhiên đôi khi mạng kết nối đến Supabase Auth API bị timeout. Làm sao để viết một cơ chế fallback tự động chuyển sang đọc/ghi trực tiếp vào CSDL PostgreSQL qua helper `app/database/pg.py` nếu Supabase API thất bại?"*  
> 
> **Phản hồi từ AI:**  
> - Đề xuất bọc các lời gọi `supabase.auth` và `supabase.table` trong khối `try...except`.  
> - Khi bắt được ngoại lệ kết nối hoặc API Error, hệ thống sẽ tự động gọi các hàm truy vấn trực tiếp trong `app/database/pg.py` với câu lệnh SQL được chuẩn bị sẵn (`SELECT`, `UPDATE user_profiles`).  
> 
> **Cách kiểm chứng & thực thi của DHTHuuToan:**  
> - Tự tay hiện thực khối `try...except` trong `GET /users/profile` và `PUT /users/profile`.  
> - Kiểm thử bằng cách ngắt kết nối Internet/chặn domain Supabase Auth và xác nhận API vẫn trả về thông tin user profile chính xác từ PostgreSQL fallback.

---

### 🔹 Prompt Mẫu 2: Về Tải File Multipart & Lưu Storage Supabase
> **Câu Prompt của DHTHuuToan:**  
> *"Tôi cần viết endpoint `POST /media/` nhận file ảnh từ client, lưu file vào Supabase Storage Bucket đồng thời ghi 1 record vào `media_files` và 1 record vào `gallery_items`. Hãy hướng dẫn cách cấu hình `UploadFile` trong FastAPI và xử lý mã lỗi 400/500 phù hợp."*  
> 
> **Phản hồi từ AI:**  
> - Hướng dẫn định nghĩa tham số `file: UploadFile = File(...)`.  
> - Hướng dẫn đọc nội dung file dưới dạng `bytes`, gọi `supabase.storage.from_(BUCKET).upload(...)` và ghi dữ liệu tương ứng vào bảng CSDL.  
> 
> **Cách kiểm chứng & thực thi của DHTHuuToan:**  
> - Viết mã nguồn cho `app/api/media.py`.  
> - Sử dụng Postman gửi request `multipart/form-data` kèm file ảnh thật, kiểm tra Dashboard Supabase xác nhận file đã xuất hiện trên Bucket và 2 bảng CSDL đã được chèn bản ghi mới.

---

## 4. Bảng Kê Chi Tiết File/Code Đóng Góp của Thành Viên `DHTHuuToan`

### 4.1. Phân hệ Backend (FastAPI, Python)

| Tệp mã nguồn | Mục đích & Nội dung thực hiện |
| :--- | :--- |
| [`app/api/users.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/users.py) | Xây dựng 5 endpoints quản lý người dùng (`register`, `login`, `profile` GET/PUT, `change-password`), tích hợp Supabase Auth và PostgreSQL fallback |
| [`app/api/media.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/media.py) | Xây dựng 5 endpoints quản lý tệp truyền thông (Upload, List, Update note, Delete, Signed Download URL) kết nối Supabase Storage |
| [`app/api/data.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/data.py) | Xây dựng 2 endpoints khám phá tập dữ liệu địa danh (`/data/explorer`, `/data/records`) |
| [`app/api/predict.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/predict.py) | Endpoint `POST /predict`: Nhận diện hình ảnh địa danh, tính toán danh sách Top-K và thời gian phản hồi |
| [`app/api/gis.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/gis.py) | Các endpoints tính toán trắc địa: `distance`, `calculate-error`, `select-location` |
| [`app/auth/dependencies.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/auth/dependencies.py) | Xây dựng middleware xác thực JWT Token `get_current_user`, hỗ trợ cờ bỏ qua xác thực trong môi trường Dev (`DEV_SKIP_SUPABASE_AUTH`) |
| [`app/database/pg.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/database/pg.py) | Các hàm helper truy vấn CSDL PostgreSQL trực tiếp làm kênh dự phòng cho Supabase Client |
| [`app/main.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/main.py) | Cấu hình FastAPI ứng dụng, đăng ký các API router và thiết lập CORS Middleware |

### 4.2. Phân hệ Frontend & Cấu hình (React, Vite)

| Tệp mã nguồn | Mục đích & Nội dung thực hiện |
| :--- | :--- |
| [`web/src/pages/*`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/pages) | Giao diện các trang Quản lý người dùng, Thư viện ảnh cá nhân và Khám phá dữ liệu |
| [`web/src/service/*`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/service) | Tích hợp Axios Client gọi các API Auth, Media, Predict và GIS Backend |
| [`requirements.txt`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/requirements.txt) | Khai báo các thư viện phụ thuộc Backend (`fastapi`, `uvicorn`, `supabase`, `pydantic`...) |

---

## 5. Cách Thức Kiểm Tra và Xác Thực Kết Quả (Verification Methods)

1. **Kiểm tra biên dịch & Cú pháp tĩnh:**
   - Kiểm tra mã nguồn Python 3.14.3 sạch lỗi cú pháp.
   - Đảm bảo Frontend React build thành công bằng npm:
     ```bash
     npm run build
     ```
   - Đạt kết quả build sạch không chứa lỗi TypeScript hay JSX syntax.

2. **Kiểm tra xung đột Git:**
   - Quét tìm kiếm toàn bộ repository để đảm bảo không còn ký tự xung đột merge:
     ```bash
     git grep "<<<<<<<"
     ```

3. **Kiểm thử API Backend độc lập qua Swagger UI:**
   - Mở giao diện Swagger Docs (`http://127.0.0.1:8000/docs`) và tiến hành kiểm thử các chuỗi tác vụ:
     - `POST /users/register`: Đăng ký tài khoản mới $\rightarrow$ Xác nhận HTTP 201.
     - `POST /users/login`: Đăng nhập $\rightarrow$ Trả về Token $\rightarrow$ Gắn vào Authorize Header.
     - `GET /users/profile`: Trích xuất thông tin hồ sơ $\rightarrow$ HTTP 200.
     - `POST /media/`: Upload file ảnh $\rightarrow$ Kiểm tra file xuất hiện trên Supabase Storage.

4. **Kiểm thử giao diện & Tích hợp hệ thống (End-to-End Testing):**
   - Chạy đồng thời hệ thống trên máy cục bộ:
     - Backend: `uvicorn app.main:app --reload` (Cổng 8000)
     - Frontend: `npm run dev` (Cổng 5173)
   - Thực hiện toàn bộ luồng sử dụng của người dùng từ giao diện Web: Đăng ký/Đăng nhập $\rightarrow$ Khám phá dữ liệu $\rightarrow$ Tải ảnh lên thư viện $\rightarrow$ Chạy dự đoán AI địa danh $\rightarrow$ Xem kết quả sai số trắc địa GIS trên bản đồ.

---

## 6. Đạo Đức Học Thuật & Cam Kết Độc Lập

- **Quyền tác giả và kiểm soát:** Mọi đoạn code được gợi ý từ trợ lý AI đều được thành viên `DHTHuuToan` trực tiếp đọc hiểu, tùy chỉnh, tích hợp và kiểm thử thực tế.
- **Không nhận vơ / Trung thực:** Báo cáo phản ánh đúng 100% phạm vi công việc của bản thân dựa trên mã nguồn thực tế và lịch sử Git commit của dự án.
- **Bảo mật:** Không chứa bất kỳ khóa bí mật (API Keys/Secret Tokens) nào trong báo cáo.