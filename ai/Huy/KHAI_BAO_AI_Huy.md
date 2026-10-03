# BẢN KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO

**Dự án:** Hệ thống nhận diện địa danh Việt Nam & Đo đạc sai số GIS (`IE221-DoAnPython`)  
**Thành viên thực hiện:** Nguyễn Quang Huy  
**Mã số sinh viên (MSSV):** 25410228  
**Username Git/GitHub:** `QuangHuy`  
**Email commit:** `huynq201104@gmail.com`  
**Ngày lập báo cáo:** 03/10/2026  

---

## 1. Công Cụ AI Đã Sử Dụng

1. **Trợ lý lập trình AI (AI Coding Assistant):**
   - **Tên công cụ:** Trợ lý AI hỗ trợ lập trình (AI Coding Assistant)
   - **Môi trường hoạt động:** Tích hợp trực tiếp trong môi trường phát triển mã nguồn cục bộ (Local IDE).
   - **Vai trò:** Hỗ trợ tham vấn cú pháp tự động hóa Batch Script trên Windows, tra cứu cấu trúc TypeScript data model cho mock data, tham vấn kỹ thuật tối ưu hóa dung lượng hình ảnh tĩnh và biên soạn nội dung học thuật cho chuyên mục Blog giới thiệu công nghệ AI Geolocation / Vision Transformer.

2. **Mô hình AI Lõi trong Sản phẩm (Product Core AI Model):**
   - **Tên mô hình/thư viện:** `geoclip-vietnam` (phiên bản `1.0.2`, phát triển dựa trên kiến trúc GeoCLIP / OpenAI CLIP & RFF Location Encoder).
   - **Vai trò trong sản phẩm:** Mô hình AI thị giác máy tính nhận diện địa danh qua ảnh chụp thực tế. Thành viên `QuangHuy` trực tiếp chuẩn hóa tập ảnh tĩnh mẫu của các địa danh đặc trưng Việt Nam tương thích với đặc tả đầu vào của mô hình (tỉ lệ khung hình, độ sắc nét, nhận diện các đặc trưng kiến trúc và cảnh quan bản địa).

---

## 2. Mục Đích Sử Dụng AI

Dựa trên bằng chứng thực tế từ quá trình phát triển dự án và lịch sử Git commit (`fff399a`), AI được sử dụng với vai trò **tham vấn, hỏi đáp kỹ thuật (Technical Q&A / Consultation)** và hỗ trợ nâng cao trải nghiệm giao diện người dùng:

1. **Tham vấn thiết kế kịch bản tự động hóa môi trường Fullstack đa tiến trình (Automation Scripts):**
   - Tham vấn cú pháp Batch Script (`.bat`) trên hệ điều hành Windows để điều phối khởi chạy độc lập hai tiến trình: Backend FastAPI (Python) và Frontend Vite (React/Node.js).
   - Xây dựng cơ chế gọi script con an toàn bằng lệnh `start cmd /c`, thiết lập tiêu đề console (`title`), tự động kích hoạt môi trường ảo Python (`call .\.venv\Scripts\activate.bat`), và nạp tham số reload cho Uvicorn server (`python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`).
   - Đảm bảo script one-click (`run_all.bat`) giúp các thành viên nhóm và Giảng viên khi nghiệm thu đồ án có thể khởi chạy toàn bộ hệ thống ngay lập tức mà không cần gõ lệnh thủ công phức tạp qua dòng lệnh.

2. **Tham vấn tối ưu hóa tài nguyên số & Chuẩn hóa Asset địa danh Việt Nam (Asset Optimization & Management):**
   - Tham vấn các tiêu chuẩn kỹ thuật về dung lượng, độ phân giải và định dạng hình ảnh cho giao diện web hiện đại (cân đối giữa chất lượng thị giác cao và chỉ số LCP - Largest Contentful Paint của Core Web Vitals).
   - Thay thế hoàn toàn các liên kết ảnh trực tuyến Unsplash ngẫu nhiên, không ổn định (thường xuyên bị lỗi mạng hoặc độ trễ cao) bằng bộ sưu tập 12 địa danh biểu tượng của Việt Nam lưu trữ nội bộ tại `web/public/images/landmarks/` (Hà Long, Hồ Gươm, Đà Lạt, Chợ Bến Thành, Phố cổ Hội An, Đại Nội Huế, Chùa Thiên Mụ, Cầu Tràng Tiền, Bà Nà Hills, Ruộng bậc thang Sapa, Nha Trang).
   - Tối ưu hóa bộ ảnh blog chuyên sâu (`web/public/images/blog/`) phục vụ truyền thông trực quan cho các bài viết về công nghệ AI Geolocation và Vision Transformer (ViT).

3. **Tham vấn chuẩn hóa cấu trúc dữ liệu mô phỏng (Data Modeling & Mock Binding):**
   - Tham vấn cách tổ chức dữ liệu mock landmarks (`web/src/mocks/mockLandmarks.ts`) theo chuẩn TypeScript interface, ánh xạ chính xác các trường: tọa độ GPS (`coords`), địa chỉ hành chính (`address`), giờ hoạt động (`hours`), giá vé (`price`), đánh giá xếp hạng (`rating`), số lượt quét AI (`scannedCount`), và danh sách địa điểm lân cận (`nearby`).
   - Đảm bảo dữ liệu mô phỏng đồng bộ chặt chẽ với tập dữ liệu thực nghiệm `vietnam_landmarks.csv` của phân hệ Backend và API AI dự đoán.

4. **Tham vấn nội dung học thuật cho chuyên mục Blog Công nghệ AI:**
   - Tham vấn cách diễn đạt súc tích, chuẩn xác về mặt khoa học kỹ thuật để giải thích nguyên lý hoạt động của mô hình Vision Transformer (ViT) và GeoCLIP: cơ chế chia ảnh thành các "patch" không gian, trích xuất vector đặc trưng thị giác, và kỹ thuật so khớp cosine similarity với ma trận tọa độ địa lý.
   - Trực quan hóa các bài viết trên giao diện trang chủ (`ClientHome.jsx`) và trang giới thiệu (`ClientAbout.jsx`).

5. **Rà soát & Tinh chỉnh tính nhất quán giao diện người dùng (UI/UX Alignment):**
   - Tham vấn xử lý các vấn đề giao diện Responsive trên các trang Client: Trang chủ (`ClientHome.jsx`), Trang khám phá địa danh (`ClientLandmarks.jsx`), Trang địa điểm yêu thích (`Favorites.jsx`), và Trang giới thiệu (`ClientAbout.jsx`).
   - Đảm bảo các thẻ địa danh hiển thị hình ảnh bản địa sắc nét, không bị méo tỉ lệ khung hình (sử dụng `object-fit: cover`), và cập nhật mượt mà khi người dùng tương tác.

---

## 3. Bảng Kê Chi Tiết File/Code Liên Quan của Thành Viên `QuangHuy`

Toàn bộ các đóng góp mã nguồn dưới đây được xác thực trực tiếp từ lịch sử Git commit (`git show fff399a --stat`):

### 3.1. Phân hệ Kịch bản Tự động hóa (Automation & DevOps Scripts)

| Tệp mã nguồn | Hash Commit | Mục đích & Nội dung thực hiện |
| :--- | :--- | :--- |
| [`run_all.bat`](file:///D:/uit/ky3/lt_python/IE221-DoAnPython/run_all.bat) | `fff399a` | Script khởi chạy toàn bộ hệ thống fullstack: Tự động mở 2 cửa sổ cmd độc lập chạy song song `run_backend.bat` và `run_frontend.bat`, xuất thông báo hướng dẫn truy cập Web App (`http://localhost:5173`) và Swagger Docs (`http://localhost:8000/docs`). |
| [`run_backend.bat`](file:///D:/uit/ky3/lt_python/IE221-DoAnPython/run_backend.bat) | `fff399a` | Script khởi chạy Backend FastAPI: Tự động kích hoạt virtual environment `.venv`, chạy Uvicorn server tại `127.0.0.1:8000` với chế độ `--reload` để tự động cập nhật khi sửa mã nguồn. |
| [`run_frontend.bat`](file:///D:/uit/ky3/lt_python/IE221-DoAnPython/run_frontend.bat) | `fff399a` | Script khởi chạy Frontend React/Vite: Tự động chuyển vào thư mục `web/`, thực thi `npm run dev` tại `127.0.0.1:5173`. |

### 3.2. Hệ thống Tài nguyên Số & Hình ảnh Bản địa (Digital Assets)

| Tệp tài nguyên | Hash Commit | Mục đích & Nội dung thực hiện |
| :--- | :--- | :--- |
| [`web/public/images/landmarks/*`](file:///D:/uit/ky3/lt_python/IE221-DoAnPython/web/public/images/landmarks) | `fff399a` | Bộ sưu tập 12 hình ảnh độ phân giải cao của các địa danh đặc trưng Việt Nam: Bà Nà Hills, Cầu Tràng Tiền, Chợ Bến Thành, Đà Lạt, Đại Nội Huế, Vịnh Hạ Long, Hồ Gươm, Phố cổ Hội An (ngày & đêm), Bãi biển Nha Trang, Ruộng bậc thang Sapa, Chùa Thiên Mụ. |
| [`web/public/images/blog/*`](file:///D:/uit/ky3/lt_python/IE221-DoAnPython/web/public/images/blog) | `fff399a` | Bộ hình ảnh minh họa bài viết công nghệ: `about-hero-vietnam.jpg` (ảnh panorama Việt Nam), `ai-geolocation.jpg` (ảnh minh họa công nghệ định vị AI), `vision-transformer.jpg` (ảnh minh họa kiến trúc mạng nơ-ron ViT). |

### 3.3. Phân hệ Giao diện & Dữ liệu Frontend (React, JSX, TypeScript)

| Tệp mã nguồn | Hash Commit | Mục đích & Nội dung thực hiện |
| :--- | :--- | :--- |
| [`web/src/mocks/mockLandmarks.ts`](file:///D:/uit/ky3/lt_python/IE221-DoAnPython/web/src/mocks/mockLandmarks.ts) | `fff399a` | Cập nhật cấu trúc mock data chuẩn hóa, chuyển đổi toàn bộ đường dẫn ảnh từ URL ngoại tuyến sang static assets nội bộ (`/images/landmarks/*`), chuẩn hóa tên bài viết và tác giả. |
| [`web/src/pages/client/ClientLandmarks.jsx`](file:///D:/uit/ky3/lt_python/IE221-DoAnPython/web/src/pages/client/ClientLandmarks.jsx) | `fff399a` | Cập nhật đường dẫn ảnh `heroImg`, bộ sưu tập `gallery` và danh sách địa điểm lân cận `nearby` cho các địa danh tiêu biểu (Chùa Thiên Mụ, Vịnh Hạ Long...), đảm bảo trải nghiệm trực quan sống động. |
| [`web/src/pages/client/ClientHome.jsx`](file:///D:/uit/ky3/lt_python/IE221-DoAnPython/web/src/pages/client/ClientHome.jsx) | `fff399a` | Tích hợp ảnh blog minh họa công nghệ AI định vị địa lý (`/images/blog/ai-geolocation.jpg`) vào thẻ bài viết nổi bật (Featured Article Card) trên trang chủ. |
| [`web/src/pages/client/ClientAbout.jsx`](file:///D:/uit/ky3/lt_python/IE221-DoAnPython/web/src/pages/client/ClientAbout.jsx) | `fff399a` | Tích hợp ảnh banner `about-hero-vietnam.jpg` giới thiệu sứ mệnh dự án kết hợp AI với việc bảo tồn và quảng bá văn hóa du lịch Việt Nam. |
| [`web/src/pages/Favorites.jsx`](file:///D:/uit/ky3/lt_python/IE221-DoAnPython/web/src/pages/Favorites.jsx) | `fff399a` | Cập nhật đồng bộ đường dẫn ảnh nội bộ cho danh sách địa điểm yêu thích mặc định (Chợ Bến Thành, Hồ Gươm, Vịnh Hạ Long, Phố cổ Hội An), loại bỏ nguy cơ đứt gãy hình ảnh khi mất kết nối mạng bên ngoài. |

---

## 4. Cách Thức Kiểm Tra và Xác Thực Kết Quả (Verification Methods)

Thành viên `QuangHuy` đã thực hiện quy trình kiểm thử nghiêm ngặt đối với mọi sản phẩm mã nguồn và tài nguyên số do bản thân xây dựng:

1. **Kiểm thử tự động hóa kịch bản khởi chạy (Batch Scripts Testing):**
   - Thực thi `run_all.bat` trên môi trường Windows thực tế.
   - Xác nhận: Cả hai cửa sổ terminal mở lên đúng tiêu đề, Backend FastAPI lắng nghe ổn định tại `http://127.0.0.1:8000`, Swagger UI sẵn sàng tại `/docs`, và Vite Dev Server khởi động thành công tại `http://localhost:5173`.
   - Kiểm tra tính độc lập: Tắt một trong hai cửa sổ không làm ảnh hưởng hoặc làm sập tiến trình còn lại.

2. **Kiểm thử tải tài nguyên & Render hình ảnh (Asset Integrity & Performance Testing):**
   - Mở tab Network trên Chrome DevTools khi truy cập ứng dụng.
   - Xác minh toàn bộ các tệp ảnh tại `/images/landmarks/` và `/images/blog/` đều phản hồi mã trạng thái HTTP 200 OK, thời gian tải (load time) nhanh, không phát sinh bất kỳ lỗi 404 Not Found nào.
   - Kiểm tra hiển thị hình ảnh trên các độ phân giải màn hình khác nhau (Desktop, Tablet, Mobile) đảm bảo tính responsive, không vỡ khung hình nhờ thuộc tính CSS `object-fit: cover`.

3. **Kiểm thử liên kết dữ liệu Frontend (Data Binding & State Verification):**
   - Điều hướng qua lại giữa các trang: `ClientHome` $\rightarrow$ `ClientLandmarks` $\rightarrow$ `Favorites` $\rightarrow$ `ClientAbout`.
   - Xác nhận: Dữ liệu mô tả, thẻ tags, tọa độ GPS và hình ảnh tương ứng của từng địa danh hiển thị hoàn toàn khớp với nhau và đồng bộ chính xác với định dạng của phân hệ AI.

4. **Kiểm thử độ tương thích với mô hình AI `geoclip-vietnam`:**
   - Sử dụng các hình ảnh địa danh mẫu thực tế từ thư mục `web/public/images/landmarks/` để tải lên Form nhận diện AI (`POST /predict`).
   - Xác nhận: Mô hình trích xuất đặc trưng thị giác chuẩn xác và đưa ra dự đoán Top-1 đúng địa danh tương ứng với độ tin cậy cao (Confidence Score > 80%).

5. **Kiểm tra tính toàn vẹn Git và bảo toàn mã nguồn nhóm:**
   - Kiểm tra diff commit trước khi push lên nhánh `main`: Đảm bảo commit `fff399a` chỉ tập trung vào các asset hình ảnh, script khởi chạy và cập nhật đường dẫn hiển thị, không làm ảnh hưởng hay gây xung đột với code Backend/AI của các thành viên khác trong nhóm.

---

## 5. Đạo Đức Học Thuật & Cam Kết Độc Lập

- **Quyền tác giả và kiểm soát:** Toàn bộ kịch bản tự động hóa, cấu trúc quản lý tài nguyên số và các cập nhật mã nguồn giao diện đều do thành viên `QuangHuy` trực tiếp thiết kế, triển khai, rà soát và kiểm thử thực tế trên hệ thống. Trợ lý AI chỉ đóng vai trò hỗ trợ tham vấn kỹ thuật và gợi ý giải pháp tối ưu.
- **Tính trung thực và minh bạch:** Bản khai báo này phản ánh chính xác 100% phần việc của thành viên `Nguyễn Quang Huy` dựa trên lịch sử Git commit (`fff399a`) và cấu trúc tệp mã nguồn thực tế của dự án `IE221-DoAnPython`, không nhận vơ hoặc sao chép đóng góp của 4 thành viên còn lại trong nhóm.
- **Bảo mật và an toàn:** Bản khai báo không chứa bất kỳ thông tin nhạy cảm, token bí mật hay khóa API nào của hệ thống.
