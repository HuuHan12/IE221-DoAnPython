# TÓM TẮT KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI SUMMARY)
*(Tài liệu tóm tắt đưa vào Báo cáo Đồ án Môn học)*

---

### 1. Thông Tin Thành Viên & Dự Án
- **Họ và tên:** Nguyễn Quang Huy
- **Mã số sinh viên (MSSV):** 25410228
- **Username Git / GitHub:** `QuangHuy`
- **Email commit:** `huynq201104@gmail.com`
- **Tên Đồ án:** Hệ thống nhận diện địa danh Việt Nam & Đo đạc sai số GIS (`IE221-DoAnPython`)
- **Vai trò trong nhóm:** Phụ trách Quản lý & Chuẩn hóa Hệ thống Tài nguyên số Địa danh Việt Nam, Xây dựng Kịch bản Tự động hóa Khởi chạy Hệ thống Fullstack (One-Click Automation Launch Scripts cho FastAPI & Vite), Đồng bộ hóa Mô hình Dữ liệu Mockup Địa danh với Phân hệ AI, và Tối ưu hóa Trực quan hóa Giao diện Người dùng trên các Trang Client (Home, Landmarks, About, Favorites).

---

### 2. Các Đóng Góp Mã Nguồn Chính Của Thành Viên `QuangHuy`
*(Được xác thực 100% qua lịch sử Git commit `fff399a` và các tệp mã nguồn của dự án)*

1. **Bộ Công Cụ Tự Động Hóa Khởi Chạy Hệ Thống Fullstack (DevOps & Automation Scripts):**
   - **Kịch bản khởi chạy tích hợp một chạm (`run_all.bat`):** Điều phối mở đồng thời hai cửa sổ dòng lệnh riêng biệt để chạy song song cả phân hệ Backend API và Frontend Web, tự động hiển thị thông tin điều hướng đến Web App (`http://localhost:5173`) và Swagger Documentation (`http://localhost:8000/docs`).
   - **Kịch bản khởi chạy Backend FastAPI (`run_backend.bat`):** Tự động kích hoạt môi trường ảo Python (`.venv`), nạp biến môi trường và chạy máy chủ Uvicorn server với cờ `--reload` hỗ trợ hot-reloading khi phát triển.
   - **Kịch bản khởi chạy Frontend React/Vite (`run_frontend.bat`):** Tự động chuyển vùng vào thư mục `web/` và kích hoạt máy chủ phát triển Vite với câu lệnh `npm run dev`.

2. **Hệ Thống Tài Nguyên Số & Chuẩn Hóa Hình Ảnh Bản Địa Việt Nam (Digital Assets Pipeline):**
   - **Bộ sưu tập 12 địa danh biểu tượng Việt Nam (`web/public/images/landmarks/*`):** Thu thập, chọn lọc và tối ưu hóa hình ảnh độ phân giải cao cho các danh thắng tiêu biểu trải dài khắp 3 miền (Hà Long, Hồ Gươm, Chùa Thiên Mụ, Cầu Tràng Tiền, Đại Nội Huế, Phố cổ Hội An ngày & đêm, Ruộng bậc thang Sapa, Bà Nà Hills, Đà Lạt, Chợ Bến Thành, Bãi biển Nha Trang).
   - **Bộ hình ảnh khoa học chuyên sâu (`web/public/images/blog/*`):** Cung cấp tư liệu trực quan chất lượng cao cho các bài viết học thuật về công nghệ AI Geolocation (`ai-geolocation.jpg`), kiến trúc Vision Transformer (`vision-transformer.jpg`), và toàn cảnh di sản Việt Nam (`about-hero-vietnam.jpg`).
   - Loại bỏ hoàn toàn sự phụ thuộc vào các liên kết ảnh Unsplash bên ngoài (vốn thiếu tính ổn định, dễ lỗi 404 khi không có mạng và không mang tính đặc thù bản địa Việt Nam), chuyển sang phục vụ 100% tài nguyên nội bộ với tốc độ tải trang tức thì.

3. **Đồng Bộ Hóa Dữ Liệu & Tối Ưu Hóa Giao Diện Phía Client (Frontend Data Binding & UI Polish):**
   - **Chuẩn hóa cấu trúc Mock Data (`web/src/mocks/mockLandmarks.ts`):** Ánh xạ chuẩn xác thông tin địa danh, tọa độ GPS, thời gian mở cửa, giá vé tham quan và liên kết ảnh tĩnh nội bộ; đồng bộ hóa thông tin tác giả và nội dung bài viết kỹ thuật.
   - **Tích hợp trang Danh mục Địa danh (`ClientLandmarks.jsx`):** Cập nhật hình ảnh đại diện (`heroImg`), bộ sưu tập ảnh trượt (`gallery`) và các địa điểm gợi ý lân cận (`nearby`) cho Chùa Thiên Mụ, Vịnh Hạ Long và các địa danh trọng điểm.
   - **Trực quan hóa Trang chủ (`ClientHome.jsx`):** Gắn kết hình ảnh minh họa công nghệ AI vào thẻ bài viết nổi bật, nâng cao tính chuyên nghiệp và tính tương tác của nền tảng.
   - **Nâng cấp trang Giới thiệu (`ClientAbout.jsx`):** Tích hợp banner ảnh toàn cảnh di sản Việt Nam, thể hiện rõ sứ mệnh kết hợp trí tuệ nhân tạo và công nghệ thông tin trong việc bảo tồn và quảng bá di sản văn hóa dân tộc.
   - **Đồng bộ hóa trang Địa điểm yêu thích (`Favorites.jsx`):** Đảm bảo danh sách các địa danh yêu thích mặc định hiển thị đồng nhất hình ảnh nội bộ sắc nét, mượt mà.

---

### 3. Tóm Lược Mức Độ & Tính Chất Sử Dụng AI

| Tiêu chí | Nội dung chi tiết |
| :--- | :--- |
| **Công cụ AI** | Trợ lý AI hỗ trợ lập trình (AI Coding Assistant) & Mô hình học sâu `geoclip-vietnam` v1.0.2 |
| **Tính chất sử dụng** | Đóng vai trò **Kênh tham vấn & hỏi đáp kỹ thuật (Technical Q&A / Consultation)** (tương tự như việc tra cứu tài liệu kỹ thuật của Microsoft/Batch script, tài liệu React/Vite, tra cứu hướng dẫn tối ưu Core Web Vitals trên MDN/web.dev hoặc trao đổi chuyên môn với người hướng dẫn). |
| **Các nhóm mục đích chính** | **1. Kịch bản tự động hóa môi trường (Batch Scripts):** Tham vấn cú pháp Shell/Batch script trên Windows (`start cmd /c`, `%~dp0`, quản lý tiến trình nền song song, kích hoạt virtualenv) giúp xây dựng bộ script one-click khởi chạy fullstack an toàn, không xung đột cổng.<br>**2. Quản lý tài nguyên số & Web Performance:** Tham vấn quy chuẩn kích thước, tỷ lệ khung hình, định dạng tệp và phương pháp tổ chức asset tĩnh trong thư mục `public/` của Vite nhằm tối ưu chỉ số LCP và tốc độ render trang.<br>**3. Chuẩn hóa Data Model & Mockup:** Tham vấn cấu trúc TypeScript interface cho dữ liệu địa danh (`mockLandmarks.ts`), đảm bảo tính tương thích với schema CSDL Backend và định dạng phản hồi của mô hình AI.<br>**4. Biên soạn nội dung Blog học thuật:** Tham vấn tóm tắt nguyên lý hoạt động của mạng Vision Transformer (ViT) và mô hình định vị GeoCLIP (cơ chế phân chia patch, embedding đặc trưng thị giác) để đưa vào các bài viết truyền thông công nghệ trên trang Client.<br>**5. Tinh chỉnh UI/UX & Responsive:** Tham vấn cách áp dụng CSS `object-fit: cover` và bố cục hiển thị thẻ địa danh đảm bảo ảnh không bị méo tỉ lệ trên đa dạng kích thước màn hình. |
| **Tỷ lệ đóng góp thực tế** | Toàn bộ các kịch bản tự động hóa, cấu trúc quản lý tài nguyên số, và 100% các cập nhật mã nguồn giao diện/dữ liệu do thành viên tự thiết kế, tự tích hợp và tự kiểm thử thực tế. AI chỉ đóng vai trò hỗ trợ tham vấn cú pháp và giải đáp thắc mắc kỹ thuật. |

---

### 4. Quy Trình Kiểm Thử & Đảm Bảo Chất Lượng

Mọi thành phần mã nguồn và tài nguyên số đều trải qua quy trình kiểm thử 5 bước nghiêm ngặt:
1. **Kiểm thử kịch bản tự động hóa (Scripts Execution Testing):** Chạy thực tế `run_all.bat`, kiểm tra cả hai cửa sổ dòng lệnh mở lên độc lập, Backend FastAPI lắng nghe tại port 8000 và Frontend Vite lắng nghe tại port 5173 mà không bị khóa tiến trình lẫn nhau.
2. **Kiểm tra tính toàn vẹn tài nguyên (Asset Integrity & HTTP 200):** Sử dụng Chrome DevTools Network Tab kiểm tra toàn bộ hình ảnh địa danh và blog trong thư mục `/images/`, xác nhận 100% trả về HTTP 200 OK với thời gian phản hồi tức thì, không tồn tại bất kỳ liên kết 404 nào.
3. **Kiểm thử liên kết dữ liệu giao diện (Data Binding & Responsive UI):** Kiểm tra hiển thị thực tế trên trình duyệt (`http://localhost:5173`), duyệt qua các trang `ClientHome`, `ClientLandmarks`, `Favorites` và `ClientAbout`, xác nhận hình ảnh hiển thị sắc nét, đúng tỷ lệ khung hình trên cả màn hình Desktop và Mobile.
4. **Kiểm thử độ tương thích với phân hệ AI:** Sử dụng các ảnh địa danh mẫu thực tế vừa cập nhật để gửi yêu cầu nhận diện tới API `POST /predict`, xác minh mô hình `geoclip-vietnam` nhận diện chuẩn xác địa danh tương ứng với độ tin cậy cao.
5. **Kiểm tra tính an toàn Git (Clean Commit & No Merge Conflict):** Rà soát lịch sử commit `fff399a` để đảm bảo không làm phát sinh xung đột với mã nguồn của các thành viên khác trong nhóm, bảo toàn nguyên vẹn tính ổn định của nhánh `main`.

---

### 5. Cam Kết Tính Độc Lập & Đạo Đức Học Thuật

- Thành viên `Nguyễn Quang Huy` cam đoan toàn bộ thông tin khai báo trên là trung thực, phản ánh chính xác quá trình làm việc của bản thân dựa trên lịch sử Git của dự án.
- Không có hành vi lạm dụng AI để sinh mã nguồn tự động không kiểm soát; không sao chép nguyên mẫu mã nguồn của người khác.
- Bản khai báo không chứa bất kỳ khóa bí mật hoặc thông tin bảo mật nào của hệ thống.
