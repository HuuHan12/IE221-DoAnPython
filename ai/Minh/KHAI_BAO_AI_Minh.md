# BẢN KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI DECLARATION)

**Dự án:** Hệ thống nhận diện địa danh Việt Nam & Đo đạc sai số GIS (`IE221-DoAnPython`)  
**Thành viên thực hiện:** Đặng Quang Minh  
**Mã số sinh viên (MSSV):** 25410... *(Sinh viên điền MSSV cá nhân)*  
**Username Git/GitHub:** `dangquangminh123`  
**Email commit:** `90738364+dangquangminh123@users.noreply.github.com`  
**Ngày lập báo cáo:** 04/10/2026  
**Phạm vi phụ trách chính trong đồ án:**
- Phân tích và thiết kế cấu trúc luồng đi tổng thể của dự án (System Flow & User Journeys).
- Bố trí và chuẩn hóa cấu trúc thư mục mã nguồn phân hệ Web Frontend theo tiêu chuẩn Clean Architecture.


---

## 1. Công Cụ Trí Tuệ Nhân Tạo (AI) Đã Sử Dụng

1. **Công cụ AI chính hỗ trợ thiết kế kiến trúc và phát triển:**
   - **Tên công cụ:** OpenAI ChatGPT (phiên bản GPT-4o / GPT-4 của OpenAI).
   - **Hình thức sử dụng:** Nền tảng hội thoại trực tuyến (Web Interface - `chatgpt.com`).
   - **Vai trò:** Hỗ trợ tham vấn giải pháp kiến trúc phần mềm, tư vấn xây dựng cấu trúc luồng đi tổng thể của dự án (App Flow & User Experience), gợi ý phân bổ cấu trúc cây thư mục chuẩn mực (Modular Directory Organization) cho dự án Single Page Application (React + Vite + TypeScript), tư vấn quy chuẩn thiết kế tầng Service giao tiếp API và mô hình bảo vệ tuyến đường (Private Route Guard).

2. **Mô hình AI Lõi trong Sản phẩm (Product Core AI Model):**
   - **Tên mô hình/thư viện:** `geoclip-vietnam` (phiên bản `1.0.2`, phát triển dựa trên kiến trúc GeoCLIP kết hợp Vision Transformer và mạng mã hóa vị trí RFF Location Encoder).
   - **Vai trò trong sản phẩm:** Tiếp nhận hình ảnh do người dùng tải lên, trích xuất đặc trưng thị giác và định vị tọa độ địa danh trên bản đồ Việt Nam.

---

## 2. Mục Đích Sử Dụng AI & Phân Tích Chuyên Sâu Kiến Trúc Dự Án

Thành viên Đặng Quang Minh sử dụng công cụ **OpenAI ChatGPT** xuyên suốt giai đoạn khởi  với mục đích chính là **thiết kế cấu trúc luồng đi của toàn bộ dự án** và **bố trí các thư mục, tệp tin chuẩn hóa theo mô hình kiến trúc phân tầng**.

Dưới đây là nội dung phân tích chi tiết về luồng đi và kiến trúc dự án đã được định hình thông qua quá trình tham vấn ChatGPT:

### 2.1. Phân Tích Cấu Trúc Luồng Đi Của Dự Án (Project Flow Architecture)

Dự án được phân chia thành 3 phân vùng luồng nghiệp vụ liên hoàn, chặt chẽ:

#### A. Luồng Công Cộng & Trải Nghiệm Khách Vãng Lai (Public Client Flow)
```
[ Khách vãng lai truy cập: http://localhost:5173/ ]
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[ Trang chủ ClientHome ]    [ Khám phá địa danh /dia-danh ]
  - Hero giới thiệu           - Bộ lọc vùng miền (Bắc/Trung/Nam)
  - Thống kê nổi bật          - Thẻ địa danh & hình ảnh thực tế
  - Bài viết du lịch/công nghệ- Nút Yêu thích (Favorite)
        │                           │
        ├───────────────────────────┤
        ▼                           ▼
[ Bảng giá gói cước /bang-gia ] [ Giới thiệu /ve-du-an & Liên hệ /lien-he ]
  - Gói Free vs Pro             - Sứ mệnh AI & bảo tồn di sản
  - Khám phá tính năng nâng cao - Form liên hệ gửi trực tiếp API
        │
        ▼
[ Thử nghiệm Quét AI tại /dashboard/scan (Chế độ Khách) ]
  - Cho phép quét thử 1 ảnh miễn phí không cần đăng nhập
  - Hiển thị banner trạng thái "Chế độ trải nghiệm thử"
  - Khi quét xong hoặc hết lượt: Kích hoạt modal mời đăng nhập/đăng ký
```

#### B. Luồng Xác Thực & Quản Lý Phiên (Authentication & Session Guard Flow)
```
       ┌───────────────────────────────┐
       ▼                               ▼
[ Trang Đăng Ký /register ]    [ Trang Đăng Nhập /login ]
  - Validate form thời gian thực - Xác thực email & password
  - Kiểm tra độ dài mật khẩu     - Gọi loginUserApi -> Backend/Supabase
  - Xử lý xác nhận email nếu có  - Nhận access_token, refresh_token, user
       │                               │
       └──────────────┬────────────────┘
                      ▼
            [ Lưu Trữ & Đồng Bộ ]
              - localStorage.setItem("access_token")
              - localStorage.setItem("user_profile")
              - Phát window.dispatchEvent(new Event("auth-change"))
                      │
                      ▼
            [ PrivateRoute Guard ]
         /                          \
(Chưa đăng nhập)                  (Đã đăng nhập thành công)
       │                                      │
Chuyển hướng về /login              Cho phép truy cập các Route Dashboard:
kèm redirect URL                    - /dashboard (Tổng quan & Thống kê)
                                    - /dashboard/history (Lịch sử quét)
                                    - /dashboard/gallery (Kho ảnh cá nhân)
                                    - /dashboard/favorites (Địa danh đã lưu)
                                    - /dashboard/profile (Thông tin tài khoản)
                                    - /dashboard/notifications (Thông báo)
```

#### C. Luồng Dữ Liệu Động & Tầng Service (Dynamic Data Binding Flow)
Toàn bộ dữ liệu hiển thị trên các trang Dashboard và Client đều là **dữ liệu động 100%**, được gọi qua tầng Service giao tiếp với FastAPI Backend và cơ sở dữ liệu Supabase PostgreSQL:
```
[ Component UI (React) ]
      │  (Gọi action qua useEffect hoặc User Event)
      ▼
[ Service Layer (TypeScript) ]  <-- (mediaService, statisticsService, userService, ...)
      │  - Tự động lấy JWT Token từ localStorage gắn vào Bearer Header
      │  - Đóng gói Query Parameters / Form-data / Request Body
      │  - Xử lý Timeout (15s), Abort Controller
      ▼
[ Backend API (FastAPI) ]
      │  - Xác thực Token và phân quyền dữ liệu theo User ID
      │  - Truy vấn CSDL Supabase PostgreSQL
      ▼
[ Xử lý Kết Quả tại Service Layer ]
      │  - Phân tích Response JSON chuẩn
      │  - Xử lý lỗi tập trung bằng getApiErrorMessage()
      ▼
[ Đổ Dữ Liệu Lên Giao Diện (State Binding) ]
      │  - Tắt Loading Spinner Overlay
      │  - Render biểu đồ trực quan (Recharts, Donut, Line, Bar)
      │  - Hiển thị danh sách thẻ ảnh, bảng lịch sử có phân trang
      │  - Hiển thị Toast thông báo trạng thái thao tác thành công/thất bại
```

---

### 2.2. Thiết Kế & Bố Trí Thư Mục Dự Án Chuẩn Kiến Trúc (Directory Layout)

Dưới sự tham vấn của OpenAI ChatGPT, cấu trúc thư mục của phân hệ Web Frontend (`web/src`) được tổ chức theo mô hình **Feature-Based & Layered Modular Architecture** nhằm đảm bảo tính phân tách trách nhiệm (Separation of Concerns), dễ bảo trì và dễ mở rộng:

```
web/src/
├── assets/                  # Tài nguyên tĩnh nội bộ (vector icons, default avatars)
├── components/              # Các thành phần giao diện dùng chung và theo module
│   ├── client/              # Cụm thành phần giao diện công cộng
│   │   ├── ClientHeader.jsx # Header thanh điều hướng ngoài kèm trạng thái User
│   │   ├── ClientFooter.jsx # Chân trang công cộng hiển thị bản quyền, liên kết
│   │   └── ClientLayout.jsx # Khung bao bố cục cho toàn bộ Client Pages
│   ├── stats/               # Các biểu đồ & thẻ số liệu phân hệ Thống kê
│   │   ├── StatCard.jsx     # Thẻ hiển thị KPI tổng quan
│   │   ├── TimeFrequencyChart.jsx # Biểu đồ tần suất tìm kiếm theo thời gian
│   │   ├── TopLocationsChart.jsx  # Biểu đồ cột Top địa danh tìm kiếm
│   │   └── CategoryDonutChart.jsx # Biểu đồ tròn phân bố danh mục
│   ├── gallery/             # Thành phần thư viện ảnh cá nhân
│   │   ├── PhotoCard.jsx    # Thẻ ảnh có xem trước, nút tải, sửa ghi chú, xóa
│   │   ├── StorageProgressBar.jsx # Thanh dung lượng kho ảnh đám mây
│   │   └── ConfirmDeleteModal.jsx # Hộp thoại xác nhận xóa ảnh an toàn
│   ├── history/             # Thành phần lịch sử tìm kiếm
│   │   ├── HistoryTable.jsx       # Bảng danh sách lịch sử có phân trang
│   │   ├── HistoryFilterCard.jsx  # Bộ lọc lịch sử theo thời gian và phạm vi
│   │   └── HistoryDetailModal.jsx # Modal xem chi tiết kết quả dự đoán AI & GIS
│   ├── favorites/           # Thành phần địa danh yêu thích
│   │   ├── FavoriteCard.jsx       # Thẻ địa danh yêu thích kèm thao tác nhanh
│   │   └── VietnamInteractiveMap.jsx # Bản đồ số tương tác ghim các điểm yêu thích
│   ├── profile/             # Thành phần trang hồ sơ người dùng
│   │   ├── PersonalForm.jsx       # Form cập nhật họ tên, thông tin tài khoản
│   │   ├── PasswordForm.jsx       # Form đổi mật khẩu bảo mật
│   │   ├── Achievements.jsx       # Bảng tiến độ mở khóa danh hiệu thành tích
│   │   └── SubscriptionCard.jsx   # Thẻ thông tin gói cước dịch vụ
│   ├── payment/             # Thành phần thanh toán VietQR
│   │   └── PaymentQRModal.jsx     # Modal hiển thị mã VietQR động
│   ├── Header.jsx           # Header trang Dashboard kèm chuông thông báo & User dropdown
│   ├── Sidebar.jsx          # Thanh điều hướng bên trái trang Dashboard
│   ├── AuthCard.jsx         # Card khung đăng nhập / đăng ký chuẩn UX
│   └── PrivateRoute.jsx     # Thành phần bảo vệ route yêu cầu xác thực
├── pages/                   # Toàn bộ các trang (Views/Screens) của ứng dụng
│   ├── client/              # Các trang công cộng (Public Client Pages)
│   │   ├── ClientHome.jsx   # Trang chủ chính thức với Hero, Articles, Features
│   │   ├── ClientLandmarks.jsx # Trang danh mục khám phá toàn bộ địa danh
│   │   ├── ClientPricing.jsx   # Trang bảng giá và nâng cấp tài khoản
│   │   ├── ClientAbout.jsx     # Trang giới thiệu đồ án & công nghệ AI
│   │   └── ClientContact.jsx   # Trang liên hệ hỗ trợ trực tuyến
│   ├── Home.jsx             # Trang thao tác Quét AI Lõi trong Dashboard
│   ├── Statistics.jsx       # Trang Thống kê Quản trị & Báo cáo số liệu
│   ├── Gallery.jsx          # Trang Kho ảnh cá nhân trên Cloud Supabase
│   ├── Favorites.jsx        # Trang Quản lý địa danh yêu thích & Bản đồ ghim
│   ├── HistoryPage.jsx      # Trang Tra cứu lịch sử quét ảnh & đo đạc GIS
│   ├── Profile.jsx          # Trang Cài đặt tài khoản người dùng
│   ├── Notifications.jsx    # Trang Trung tâm thông báo hệ thống
│   ├── Login.jsx            # Trang Đăng nhập tài khoản
│   ├── Register.jsx         # Trang Đăng ký tài khoản mới
│   └── NotFound.jsx         # Trang báo lỗi 404 thân thiện
├── routes/                  # Quản lý định tuyến tập trung
│   └── AppRoutes.jsx        # Bảng khai báo Routes phân tách rõ Client vs Dashboard
├── service/                 # Tầng Service Layer giao tiếp Backend API (TypeScript)
│   ├── userService.ts       # Service Đăng nhập, Đăng ký, Cập nhật Hồ sơ, Đổi mật khẩu
│   ├── mediaService.ts      # Service Quản lý kho ảnh, upload, delete, update notes
│   ├── statisticsService.ts # Service Lấy số liệu thống kê, biểu đồ, xuất file Excel
│   ├── favoriteService.ts   # Service Quản lý danh sách địa danh yêu thích
│   ├── historyService.ts    # Service Lấy lịch sử tìm kiếm, lọc, xóa lịch sử
│   ├── notificationService.ts # Service Quản lý thông báo người dùng
│   ├── paymentService.ts    # Service Khởi tạo thanh toán VietQR, kiểm tra trạng thái
│   ├── contactService.ts    # Service Gửi phản hồi liên hệ về hệ thống
│   └── achievementService.ts# Service Lấy tiến độ mở khóa danh hiệu thành tích
├── css/                     # Toàn bộ bảng màu, phong cách CSS tùy biến hiện đại
│   ├── Client.css           # Toàn bộ CSS phong cách sang trọng cho trang Client (~2300 dòng)
│   ├── Statistics.css       # Giao diện trực quan hóa dữ liệu Dashboard
│   ├── Gallery.css          # Giao diện lưới ảnh Masonry / Grid hiện đại
│   ├── History.css          # Giao diện bảng biểu lịch sử chuyên nghiệp
│   ├── Favorites.css        # Giao diện thẻ yêu thích và bản đồ
│   ├── Profile.css          # Giao diện form cài đặt thông tin cá nhân
│   ├── Header.css           # Giao diện thanh Header và popup dropdown
│   ├── Sidebar.css          # Giao diện thanh Sidebar công thái học
│   ├── Login.css            # Hiệu ứng trang Đăng nhập
│   └── Register.css         # Hiệu ứng trang Đăng ký
├── hooks/                   # Custom Hooks tái sử dụng logic
│   └── usePredict.ts        # Hook điều phối luồng nhận diện ảnh và trắc địa GIS
├── App.jsx                  # Root Application Component
└── main.jsx                 # Điểm khởi đầu ứng dụng Vite/React
```

---

#### 🔹 Phiên 3: Thiết Kế Luồng Đổ Dữ Liệu Động (Dynamic Data Binding & Loading Overlay)

## 3. Bảng Kê Chi Tiết File và Code Đóng Góp của Thành Viên `dangquangminh123`

Toàn bộ các đóng góp mã nguồn dưới đây được xác thực 100% từ lịch sử Git của dự án (`git log --author="Minh"`):

### 3.1. Phân Hệ Giao Diện Người Dùng Công Cộng (Client Pages & Layout)

| Tệp / Nhóm tệp mã nguồn | Commit tiêu biểu | Nội dung đóng góp cụ thể |
| :--- | :--- | :--- |
| `web/src/pages/client/ClientHome.jsx` | `2687151`, `5de0bc6` | Xây dựng Trang chủ chính thức: Khối Hero Banner ấn tượng, thanh tìm kiếm nhanh, khối thống kê thành tựu, các bài viết cẩm nang địa danh kèm hình ảnh bản địa đặc sắc. |
| `web/src/pages/client/ClientLandmarks.jsx` | `2687151`, `5de0bc6` | Xây dựng Trang Khám phá Danh mục Địa danh Việt Nam: Phân loại theo 3 miền Bắc - Trung - Nam, tìm kiếm theo tên, bộ lọc danh mục và thẻ chi tiết địa danh. |
| `web/src/pages/client/ClientPricing.jsx` | `2687151`, `5de0bc6` | Xây dựng Trang Bảng giá dịch vụ: So sánh quyền lợi gói Cơ bản và Gói Pro, tích hợp nút chuyển hướng sang modal quét mã thanh toán VietQR. |
| `web/src/pages/client/ClientAbout.jsx` | `2687151`, `5de0bc6`, `cfc6523` | Xây dựng Trang Giới thiệu Dự án: Tôn vinh sứ mệnh ứng dụng Trí tuệ Nhân tạo vào việc bảo tồn và quảng bá di sản văn hóa, danh lam thắng cảnh Việt Nam. |
| `web/src/pages/client/ClientContact.jsx` | `2687151`, `5de0bc6` | Xây dựng Trang Liên hệ: Biểu mẫu gửi góp ý/hỗ trợ, liên kết mạng xã hội, tích hợp trực tiếp với API `POST /contact`. |
| `web/src/components/client/ClientHeader.jsx`, `ClientFooter.jsx`, `ClientLayout.jsx` | `2687151` | Thiết kế khung bố cục dùng chung cho toàn bộ các trang Client, hỗ trợ hiển thị avatar và menu người dùng khi đã đăng nhập. |
| `web/src/css/Client.css` | `2687151`, `5de0bc6` | Viết hơn 2,200 dòng CSS tùy biến cao cấp: Thiết kế hiện đại, bảng màu HSL hài hòa, hiệu ứng hover, glassmorphism và tương thích responsive hoàn hảo trên Mobile/Desktop. |

### 3.2. Phân Hệ Dashboard Quản Trị & Các Trang Chức Năng Nâng Cao

| Tệp / Nhóm tệp mã nguồn | Commit tiêu biểu | Nội dung đóng góp cụ thể |
| :--- | :--- | :--- |
| `web/src/components/Header.jsx`, `web/src/components/Sidebar.jsx` | `acd979f`, `2687151` | Thiết kế hệ thống điều hướng chính cho Dashboard: Thanh Sidebar công thái học, Header hiển thị thông tin người dùng, chuông thông báo và menu chuyển đổi trạng thái. |
| `web/src/pages/Statistics.jsx`, `web/src/components/stats/*` | `acd979f`, `479f14b` | Xây dựng Trang Thống kê Quản trị: Tích hợp 4 biểu đồ trực quan hóa dữ liệu (KPI Cards, Biểu đồ tần suất đường, Top 10 cột, Cơ cấu hình tròn) và nút Xuất báo cáo Excel. |
| `web/src/pages/Gallery.jsx`, `web/src/components/gallery/*` | `acd979f`, `479f14b` | Xây dựng Trang Kho ảnh cá nhân: Tải ảnh lên Supabase Storage, hiển thị thanh dung lượng, xem trước ảnh, cập nhật ghi chú và modal xác nhận xóa an toàn. |
| `web/src/pages/Favorites.jsx`, `web/src/components/favorites/*` | `185ac45` | Xây dựng Trang Địa danh yêu thích: Quản lý danh sách địa điểm đã lưu, bản đồ số tương tác Việt Nam (`VietnamInteractiveMap.jsx`) hiển thị vị trí các điểm yêu thích. |
| `web/src/pages/HistoryPage.jsx`, `web/src/components/history/*` | `185ac45`, `479f14b` | Xây dựng Trang Lịch sử tìm kiếm: Bảng dữ liệu có phân trang, bộ lọc theo ngày/phạm vi, modal xem lại chi tiết kết quả nhận diện AI và sai số trắc địa GIS. |
| `web/src/pages/Profile.jsx`, `web/src/components/profile/*` | `acd979f`, `479f14b` | Xây dựng Trang Hồ sơ cá nhân: Cập nhật thông tin họ tên, đổi mật khẩu bảo mật, xem tiến độ mở khóa danh hiệu thành tích và thông tin gói cước tài khoản. |
| `web/src/pages/Notifications.jsx` | `f2e83d2` | Xây dựng Trang Trung tâm thông báo: Hiển thị thông báo phê duyệt thanh toán, cập nhật trạng thái hệ thống, đánh dấu đã đọc và xóa thông báo. |
| `web/src/css/Statistics.css`, `Gallery.css`, `Favorites.css`, `History.css`, `Profile.css`, `Header.css`, `Sidebar.css` | `acd979f`, `185ac45` | Xây dựng hệ thống CSS đồng bộ cho toàn bộ phân hệ Dashboard, hiệu ứng chuyển động mượt mà và giao diện chuẩn UI/UX. |

### 3.3. Phân Hệ Xác Thực Người Dùng (Auth Flow)

| Tệp / Nhóm tệp mã nguồn | Commit tiêu biểu | Nội dung đóng góp cụ thể |
| :--- | :--- | :--- |
| `web/src/pages/Login.jsx`, `web/src/css/Login.css` | `479f14b` | Xây dựng Trang Đăng nhập: Giao diện thẩm mỹ cao, kiểm tra email/password, thông báo lỗi động, tự động chuyển tiếp về trang trước đó sau khi đăng nhập. |
| `web/src/pages/Register.jsx`, `web/src/css/Register.css` | `479f14b` | Xây dựng Trang Đăng ký: Kiểm soát tính hợp lệ form chặt chẽ (độ dài, ký tự, trùng khớp mật khẩu), xử lý phản hồi xác nhận email hoặc tạo tài khoản thành công. |
| `web/src/components/PrivateRoute.jsx` | `479f14b` | Xây dựng component bảo vệ tuyến đường, ngăn chặn người dùng chưa xác thực truy cập vào khu vực Dashboard nhạy cảm. |
| `app/api/users.py`, `app/core/security.py` | `6907da5` | Xây dựng cơ chế xác thực bền bỉ (resilient fallback), hỗ trợ dual-token JWT và đồng bộ Supabase Auth an toàn ở Backend. |

### 3.4. Tầng Dịch Vụ API & Đổ Dữ Liệu Động (Service Layer & Dynamic Data Binding)

| Tệp / Nhóm tệp mã nguồn | Commit tiêu biểu | Nội dung đóng góp cụ thể |
| :--- | :--- | :--- |
| `web/src/service/userService.ts` | `479f14b`, `78ab685` | Viết tầng giao tiếp API quản lý người dùng: Đăng ký, đăng nhập, lấy hồ sơ, cập nhật thông tin cá nhân, đổi mật khẩu, quản lý token trong `localStorage`. |
| `web/src/service/mediaService.ts` | `479f14b` | Viết tầng giao tiếp API kho ảnh cá nhân: Tải ảnh, lấy danh sách phân trang, sửa ghi chú, xóa ảnh và đồng bộ dung lượng lưu trữ. |
| `web/src/service/statisticsService.ts` | `479f14b` | Viết tầng giao tiếp API thống kê: Đóng gói các hàm gọi 4 endpoints thống kê và xử lý tải trực tiếp luồng nhị phân file Excel báo cáo. |
| `web/src/service/favoriteService.ts`, `contactService.ts`, `notificationService.ts`, `paymentService.ts`, `achievementService.ts` | `f2e83d2` | Chuẩn hóa toàn bộ các dịch vụ frontend sang TypeScript, xử lý đồng bộ dữ liệu thật 100% với Backend FastAPI. |

---

## 4. Cách Thức Kiểm Tra và Xác Thực Kết Quả

Toàn bộ các luồng giao diện và mã nguồn do thành viên Đặng Quang Minh triển khai đều trải qua quy trình kiểm thử nghiêm ngặt:

1. **Kiểm tra cú pháp và kiểu dữ liệu (TypeScript & Build Checking):**  
   Chạy lệnh `npm run build` tại thư mục `web/` để đảm bảo không có lỗi cú pháp TypeScript, toàn bộ các interface service đều tương thích và mã nguồn được đóng gói thành công mà không phát sinh bất kỳ warning/error nghiêm trọng nào.
2. **Kiểm tra luồng xác thực (Authentication Testing):**  
   - Thử nghiệm đăng ký tài khoản mới với các trường hợp mật khẩu yếu, không khớp, email trùng lặp.
   - Thử nghiệm đăng nhập đúng và sai mật khẩu, kiểm tra lưu trữ token trong `localStorage` và điều hướng bảo mật qua `PrivateRoute`.
3. **Kiểm tra đổ dữ liệu động (Dynamic Data Binding Verification):**  
   - Kiểm tra toàn bộ các trang `Statistics`, `Gallery`, `HistoryPage`, `Favorites`, `Profile`: Xác nhận dữ liệu hiển thị hoàn toàn từ CSDL Supabase thông qua API Backend, không có dữ liệu mẫu tĩnh (mock data).
   - Kiểm tra hiển thị lớp phủ `loading` khi đang kéo dữ liệu và thông báo lỗi rõ ràng khi ngắt kết nối backend.
4. **Kiểm tra giao diện đa thiết bị (Responsive & Cross-Browser Testing):**  
   Sử dụng Chrome DevTools kiểm tra hiển thị trên nhiều kích thước màn hình (Mobile 375px, Tablet 768px, Laptop 1366px, Desktop 1920px), đảm bảo bố cục không bị tràn, chữ đọc rõ ràng và hiệu ứng mượt mà.

---

## 5. Đạo Đức Học Thuật & Cam Kết Minh Bạch

- Thành viên **Đặng Quang Minh** cam đoan toàn bộ nội dung khai báo trên là hoàn toàn trung thực, phản ánh đúng đắn 100% quá trình làm việc và phạm vi đóng góp của bản thân dựa trên lịch sử commit Git.
- Việc sử dụng công cụ **OpenAI ChatGPT** được thực hiện công khai, minh bạch với mục đích chính là tham vấn phương án thiết kế luồng đi của dự án và tổ chức cấu trúc thư mục chuẩn mực.
- Toàn bộ giao diện người dùng, mã nguồn dịch vụ TypeScript, mã CSS và các chức năng tích hợp đều do thành viên tự thiết kế, lập trình và kiểm thử thực tế.
- Bản khai báo tuyệt đối không chứa bất kỳ mã bí mật, khóa API hay thông tin nhạy cảm nào của hệ thống.
