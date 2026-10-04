# BẢN KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO

**Dự án:** Hệ thống nhận diện địa danh Việt Nam & đo đạc sai số GIS (`IE221-DoAnPython`)  
**Thành viên thực hiện:** Nguyễn Xuân Hảo  
**Mã số sinh viên (MSSV):** 25410200  
**Username Git/GitHub:** `xuaanhaor`  
**Email commit:** `eji0nkiz@gmail.com` / `84656943+xuaanhaor@users.noreply.github.com`  
**Ngày lập báo cáo:** 04/10/2026

---

## 1. Công Cụ AI Đã Sử Dụng

1. **Trợ lý lập trình AI (AI Coding Assistant):** Hỗ trợ tạo mã nguồn, giao diện, cấu trúc dữ liệu, tài liệu, tích hợp và sửa lỗi cho toàn bộ phần việc được ghi nhận dưới tài khoản Git `xuaanhaor` / `v3rnal`.
2. **Mô hình AI trong sản phẩm:** Thư viện `geoclip-vietnam` được tích hợp để dự đoán địa danh và tọa độ từ ảnh người dùng tải lên. Đây là thành phần chạy trong ứng dụng, bên cạnh trợ lý AI dùng trong quá trình phát triển.

---

## 2. Mục Đích Sử Dụng AI

Trong quá trình thực hiện các hạng mục thuộc phạm vi đóng góp của mình, thành viên sử dụng trợ lý AI xuyên suốt để hỗ trợ xây dựng mã nguồn, giao diện, tích hợp hệ thống và xử lý lỗi. Các nhóm prompt tiêu biểu được hệ thống hóa theo những phần việc ghi nhận trong lịch sử commit.

1. **Khởi tạo dự án và giao diện nhận diện ảnh:** “Tạo bộ khung FastAPI và React/Vite cho đồ án nhận diện địa danh Việt Nam. Thêm API dự đoán nhận ảnh, giao diện tải ảnh và hiển thị kết quả; cấu hình thư viện và hướng dẫn khởi chạy.”
2. **Tích hợp mô hình AI:** “Tích hợp `geoclip-vietnam` với dữ liệu địa danh trong `app/data/`, trả về kết quả Top-K gồm địa danh, độ tin cậy và tọa độ; xử lý ảnh đầu vào và sai số GIS khi có tọa độ thực tế.”
3. **Tài khoản người dùng:** “Tạo giao diện đăng ký, đăng nhập và API người dùng sử dụng Supabase Auth. Đồng bộ trạng thái đăng nhập, token, hồ sơ và thông báo lỗi giữa frontend với backend.”
4. **Cơ sở dữ liệu và thư viện ảnh:** “Thiết kế bảng dữ liệu liên quan đến người dùng, ảnh và địa danh. Xây dựng API cùng trang Gallery để tải ảnh lên Supabase Storage, liệt kê, sửa ghi chú, tải xuống và xóa ảnh theo quyền của từng tài khoản.”
5. **Lịch sử tìm kiếm:** “Lưu ảnh và kết quả dự đoán vào lịch sử của người dùng. Tạo API và trang lịch sử có lọc, phân trang, xem chi tiết, xóa mục và liên kết địa điểm yêu thích.”
6. **Rà soát tích hợp:** “Kiểm tra và sửa lỗi giữa luồng xác thực, Supabase, API dự đoán, Gallery và lịch sử tìm kiếm; chuẩn hóa phản hồi, xử lý các trường hợp lỗi và cập nhật tài liệu API.”

---

## 3. Bảng Kê Chi Tiết File/Code Liên Quan của Thành Viên `xuaanhaor` / `v3rnal`

Các tệp và commit dưới đây lấy từ lịch sử Git theo tên tác giả `xuaanhaor` / `v3rnal`. Commit merge chỉ phản ánh thao tác hợp nhất, không được tính là phần mã nguồn tự triển khai.

### 3.1. Khởi tạo hệ thống và tích hợp AI

| Tệp/nhóm tệp | Commit | Nội dung |
| :--- | :--- | :--- |
| `app/main.py`, `app/api/predict.py`, `app/database/database.py`, `web/src/App.jsx`, `web/src/App.css` | `1cff1df` | Bộ khung API dự đoán và giao diện tải ảnh ban đầu. |
| `app/requirements.txt`, `README.md`, `.gitignore` | `61e2deb`, `570d15e` | Khai báo thư viện, hướng dẫn môi trường và tệp loại trừ Git. |
| `app/utils/geoclip.py`, `app/api/predict.py`, `app/data/*` | `0f0f34e` | Tích hợp mô hình GeoCLIP và bộ dữ liệu địa danh. |

### 3.2. Tài khoản và giao diện xác thực

| Tệp/nhóm tệp | Commit | Nội dung |
| :--- | :--- | :--- |
| `web/src/pages/Login.jsx`, `web/src/pages/Register.jsx`, `web/src/components/AuthCard.jsx`, `web/src/components/Navbar.jsx`, `web/src/css/*` | `9e6bb05` | Giao diện đăng nhập, đăng ký và các thành phần liên quan. |
| `app/api/users.py`, `app/schemas/user.py`, `web/src/service/userService.ts`, `web/src/pages/Login.jsx`, `web/src/pages/Register.jsx` | `5b45de5` | Sửa luồng Supabase Auth, phản hồi API và kết nối biểu mẫu. |

### 3.3. Thư viện ảnh và lịch sử tìm kiếm

| Tệp/nhóm tệp | Commit | Nội dung |
| :--- | :--- | :--- |
| `app/api/media.py`, `app/database.sql`, `app/database/pg.py`, `app/api/users.py` | `90ba5f8`, `5fc205b` | API CRUD ảnh và phần dữ liệu hỗ trợ. Hai commit có nội dung chồng lặp nên được ghi chung. |
| `app/api/history.py`, `app/schemas/history.py`, `web/src/pages/HistoryPage.jsx`, `web/src/service/historyService.ts` | `d8edd5f` | Backend và frontend lịch sử tìm kiếm. |
| `app/api/predict.py`, `app/database/supabase.py`, `app/API_DOCUMENTATION.md` | `d8edd5f` | Đồng bộ dự đoán, kết nối Supabase và tài liệu API. |
| `web/src/pages/Gallery.jsx`, `web/src/components/gallery/*`, `web/src/service/mediaService.ts`, `app/api/media.py` | `5b45de5` | Sửa giao diện Gallery và API media. |

---

## 4. Cách Thức Kiểm Tra và Xác Thực Kết Quả

1. **Đối chiếu phạm vi đóng góp:** Xem các commit nêu ở Mục 3 và diff của từng commit để xác định tệp do `xuaanhaor` / `v3rnal` thay đổi.
2. **Kiểm tra backend:** Chạy FastAPI, mở Swagger tại `/docs`, thử API dự đoán, tài khoản, media và lịch sử với dữ liệu hợp lệ cũng như dữ liệu lỗi.
3. **Kiểm tra frontend:** Chạy ứng dụng Vite và thử các luồng tải ảnh, đăng ký/đăng nhập, Gallery và lịch sử; kiểm tra hiển thị sau khi thêm, sửa hoặc xóa dữ liệu.
4. **Kiểm tra phân quyền và dữ liệu:** Dùng hai tài khoản để xác nhận mỗi người chỉ xem và thao tác được với ảnh, lịch sử của mình; kiểm tra bản ghi và đối tượng Storage tương ứng trên Supabase.

---

## 5. Đạo Đức Học Thuật & Cam Kết Minh Bạch

- Thành viên khai báo việc sử dụng trợ lý AI xuyên suốt quá trình phát triển các hạng mục của mình, bao gồm xây dựng mã nguồn, giao diện, tích hợp và sửa lỗi.
- Danh sách prompt ở Mục 2 là bản tái dựng theo commit và mã nguồn, không được xác nhận là nguyên văn các prompt từng gửi cho AI.
- Tài liệu chỉ thống kê các phần việc tìm thấy trong commit của `xuaanhaor` / `v3rnal`, không nhận là tác giả phần việc của thành viên khác.
- Không đưa khóa API, token hay giá trị bí mật từ tệp cấu hình vào bản khai báo.
