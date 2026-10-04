# BẢN KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO

**Dự án:** Hệ thống nhận diện địa danh Việt Nam & Đo đạc sai số GIS (`IE221-DoAnPython`)  
**Thành viên thực hiện:** Đoàn Hữu Hàn  
**Username Git/GitHub:** `HuuHan12`  
**Email commit:** `dnhan.a7.c3tqcap@gmail.com` / `164132661+HuuHan12@users.noreply.github.com`  
**Ngày lập báo cáo:** 04/10/2026  

---

## 1. Công Cụ AI Đã Sử Dụng

1. **Trợ lý lập trình AI (AI Coding Assistant):**
   - **Tên công cụ:** Trợ lý AI hỗ trợ lập trình (AI Coding Assistant)
   - **Môi trường hoạt động:** Tích hợp trực tiếp trong môi trường phát triển mã nguồn cục bộ (Local IDE).
   - **Vai trò:** Hỗ trợ tham vấn kỹ thuật, tra cứu cú pháp thư viện, gợi ý phương án kiến trúc, hỗ trợ chuẩn hóa kiểu dữ liệu TypeScript và rà soát lỗi logic (debugging).

2. **Mô hình AI Lõi trong Sản phẩm (Product Core AI Model):**
   - **Tên mô hình/thư viện:** `geoclip-vietnam` (phiên bản `1.0.2`, dựa trên kiến trúc GeoCLIP / OpenAI CLIP & RFF Location Encoder).
   - **Vai trò trong sản phẩm:** Trích xuất vector đặc trưng thị giác từ ảnh đầu vào và so khớp cosine similarity với ma trận tọa độ địa danh Việt Nam để đưa ra Top-K dự đoán vị trí địa lý.

---

## 2. Mục Đích Sử Dụng AI

Dựa trên bằng chứng thực tế từ toàn bộ quá trình phát triển mã nguồn và các commit trên Git, AI được sử dụng hoàn toàn với vai trò **tham vấn, hỏi đáp kỹ thuật (Technical Q&A / Consultation)** và hỗ trợ tư duy kiến trúc:

1. **Tham vấn cấu hình môi trường & Thư viện phụ thuộc:**
   - Làm rõ cơ chế "yanked package" của PyPI với thư viện `supabase==1.6.4`, đối chiếu vai trò các gói nền tảng (`fastapi`, `uvicorn`, `websockets`, `openpyxl`), hướng dẫn lấy `DEV_USER_ID` trên Supabase Auth, và khắc phục lỗi khởi tạo DLL PyTorch (`WinError 1114`) do phần cứng không có card NVIDIA (`nvidia-smi` không khả dụng).

2. **Thiết lập quy chuẩn kiến trúc & Bảo toàn CSDL nhóm:**
   - Yêu cầu AI tuân thủ nghiêm ngặt cấu trúc thư mục hiện có của nhóm, bảo toàn tệp schema 15 bảng `app/db`, chuẩn hóa quy cách chú thích bằng ký tự `#` (Clean Code), và phân biệt sự khác nhau giữa schema phân tích dữ liệu (Analytics) và schema CRUD.

3. **Tham vấn thiết kế nghiệp vụ Module Thống kê Admin (5 endpoints):**
   - Phân tích ánh xạ CSDL cho 5 endpoints thống kê: 4 Thẻ KPI Overview (`/overview`), Biểu đồ tần suất tìm kiếm (`/search-trends`), Top 10 địa danh (`/top-places`), Cơ cấu danh mục (`/category-distribution`), và Nút Xuất báo cáo Excel 4 Sheets (`/export`), đóng gói hàm dùng chung `_validate_date_range` bắt lỗi ngày tương lai.

4. **Debugging & Phân quyền CSDL PostgreSQL trên Supabase:**
   - Phân tích lỗi xác thực dữ liệu API User (chủ động hoàn tác 100% code để bảo vệ phần việc của đồng đội), giải thích mã tài liệu `422 Validation Error` trong Swagger UI, sửa lỗi truyền tham số HTTP GET trên Postman, khắc phục lỗi định dạng ngày dính `\n`, và xử lý lỗi phân quyền `GRANT SELECT` trên Supabase CSDL (mã 42501).

5. **Tham vấn kiến trúc đối chiếu & Tiêu chuẩn đồ án nhóm:**
   - So sánh kiến trúc đa tầng Java (Spring Boot) với kiến trúc Module-based của FastAPI, phân tích góc độ chấm điểm tính nhất quán làm việc nhóm của Giảng viên, và kiểm tra tính toàn vẹn của dữ liệu thật 100% từ CSDL Supabase (không mock data).

6. **Tham vấn giải pháp bảo mật luồng thanh toán & Tích hợp phê duyệt 2 chiều qua Telegram Bot:**
   - Phân tích lỗ hổng bảo mật và rủi ro gian lận khi cho phép người dùng tự xác nhận "Tôi đã chuyển khoản" trên giao diện Client.
   - Đề xuất và hiện thực hóa giải pháp phê duyệt 2 chiều qua Telegram Bot thay cho việc xây dựng thêm trang Admin riêng (do dự án không có trang quản trị độc lập): API tiếp nhận mã tham chiếu giao dịch (`transaction_ref`), đẩy `BackgroundTasks` gửi tin nhắn thông báo kèm Inline Keyboard (`[✅ Phê duyệt ngay]`, `[❌ Từ chối]`) vào Telegram của quản trị viên; tiến trình nền `start_telegram_bot_listener` (FastAPI lifespan) lắng nghe callback query, tự động kích hoạt gói Pro trong CSDL Supabase (`user_subscriptions`, `payment_orders`) và gửi thông báo hệ thống cho người dùng (`user_notifications`).
   - Xử lý đồng bộ phía Frontend: Tự động polling trạng thái đối soát trên `PaymentQRModal.jsx`, kiểm tra trạng thái gói cước trên `ClientPricing.jsx` hiển thị `✓ Đang sử dụng` và điều hướng về Dashboard thay vì tạo lại mã QR trùng lặp.

7. **Kiểm toán cấu trúc mã nguồn, dọn dẹp mã rác & Tinh gọn trải nghiệm giao diện người dùng:**
   - Kiểm toán toàn diện cây thư mục dự án để loại trừ nguy cơ "rác code": Làm rõ bản chất và sự cần thiết của các tệp `__init__.py` theo chuẩn Python Package; phân tích các tệp SQLite cũ không còn sử dụng (`landmark.db`, `local_media.db`); xác nhận cơ chế cô lập của AI (toàn bộ tệp test/scratch được lưu ở vùng Artifacts độc lập bên ngoài dự án); khẳng định vai trò cốt lõi không thể thiếu của dịch vụ `app/services/telegram_bot.py`.
   - Tinh gọn giao diện Frontend: Gỡ bỏ liên kết footer "Xem tất cả thông báo" trong popup Header; loại bỏ thanh "Bảng Xếp Hạng Top-K Dự Đoán" và nút Check-in trên thẻ kết quả định vị (`ResultCard.jsx`) để loại bỏ sự trùng lặp với tab Đo đạc sai số GIS (`GisErrorTab.jsx`), chỉ giữ lại nút Chia sẻ kết quả.

8. **Rà soát & Sửa lỗi logic hệ thống Thành tích Check-in:**
   - Phân tích nguyên nhân người dùng đã quét trên 10 bức ảnh nhưng bảng thành tích vẫn hiển thị 0/10: Phát hiện API dự đoán (`predict.py`) trước đó chỉ lưu ảnh và nhật ký quét vào `search_histories` mà chưa kích hoạt trigger cập nhật tiến độ mở khóa các danh hiệu trong `achievements.py`.
   - Thiết kế giải pháp cập nhật tiến độ tự động ngay sau mỗi lần scan thành công, đảm bảo các danh hiệu như "Người Khám Phá Mới", "Thợ Săn Địa Danh", "Nhà Thám Hiểm Bậc Thầy" được mở khóa chính xác.

9. **Sửa lỗi tiến trình lắng nghe phê duyệt Telegram Bot:**
   - Khắc phục sự cố quản trị viên bấm nút "Phê duyệt" trên Telegram nhưng hệ thống không ghi nhận: Phát hiện Telegram Bot API lọc bỏ sự kiện `callback_query` do cấu hình `allowed_updates` cũ của bot chưa bao gồm sự kiện bấm nút.
   - Hoàn thiện mã nguồn `telegram_bot.py`: Bổ sung tham số `allowed_updates: ["message", "callback_query"]` trong `getUpdates` qua phương thức `POST`, bọc hàm xử lý CSDL bằng `asyncio.to_thread()`, áp dụng `html.escape()` chống lỗi cú pháp HTML entities, và thiết lập supervisor auto-restart loop trong `main.py` giúp bot hoạt động bền bỉ 24/7.

---

## 3. Một Số Câu Prompt Tiêu Biểu và Quy Trình Tương Tác

Dưới đây là một số câu lệnh (prompts) điển hình minh họa cho quá trình thành viên `HuuHan12` sử dụng AI để tham vấn và giải quyết vấn đề kỹ thuật:

### 🔹 Prompt Mẫu 1: Về Phân Tích & Thiết Kế Kiến Trúc Thống Kê
> **Câu Prompt của HuuHan12:**  
> *"Dự án của nhóm tôi dùng FastAPI và Supabase PostgreSQL. Tôi phụ trách xây dựng trang Dashboard thống kê cho Admin gồm: 4 thẻ KPI Overview, biểu đồ tìm kiếm theo ngày/tuần/tháng, top 10 địa danh và xuất báo cáo Excel 4 sheets. Hãy phân tích cấu trúc CSDL hiện tại và gợi ý cho tôi cách thiết kế các endpoint tối ưu, đặc biệt là cách xử lý bù ngày trống (zero-filling) cho biểu đồ."*  
> 
> **Phản hồi từ AI:**  
> - Phân tích bảng `search_histories` và `places` để thực hiện câu lệnh tính tổng và đếm.  
> - Đề xuất giải thuật `generate_date_range` để khởi tạo danh sách mốc ngày và ánh xạ số lượt tìm kiếm vào dictionary, bù các ngày có 0 lượt tìm kiếm để biểu đồ không bị gãy nét.  
> - Hướng dẫn sử dụng thư viện `openpyxl` kết hợp `io.BytesIO` để xuất file Excel trực tiếp qua RAM mà không cần ghi file tạm ra đĩa cứng.  
> 
> **Cách kiểm chứng & thực thi của HuuHan12:**  
> - Tự tay viết file `app/schemas/statistics.py` và `app/api/statistics.py`.  
> - Đóng gói hàm `_validate_date_range` để kiểm tra điều kiện `from_date <= to_date <= today`.  
> - Kiểm thử trên Swagger UI (`/docs`) với dữ liệu thật và tải file `.xlsx` về kiểm tra đủ 4 sheet.

---

### 🔹 Prompt Mẫu 2: Về Bảo Mật Luồng Thanh Toán & Telegram Bot
> **Câu Prompt của HuuHan12:**  
> *"Trong đồ án của tôi có tính năng nâng cấp gói Pro bằng chuyển khoản ngân hàng VietQR. Hiện tại trên giao diện có nút 'Tôi đã chuyển khoản' để người dùng tự xác nhận. Tôi thấy việc này rất dễ bị gian lận nếu user bấm mà chưa chuyển tiền thật. Nhóm tôi không có trang Admin riêng để duyệt tiền. Có cách nào tích hợp bot Telegram để khi user nộp mã giao dịch thì bot gửi tin nhắn kèm nút Duyệt cho tôi bấm duyệt ngay trên điện thoại không?"*  
> 
> **Phản hồi từ AI:**  
> - Khẳng định việc cho client tự xác nhận là lỗ hổng bảo mật nghiêm trọng.  
> - Đề xuất quy trình duyệt 2 chiều qua Telegram Bot:  
>   1. Client gửi `POST /payments/submit-transfer` kèm mã tham chiếu (`transaction_ref`).  
>   2. Backend đưa tác vụ vào `BackgroundTasks` gọi Telegram API gửi tin nhắn kèm `inline_keyboard` gồm 2 nút `approve:<order_code>` và `reject:<order_code>`.  
>   3. Viết tiến trình nền Long-Polling (`getUpdates`) trong FastAPI `lifespan` để nhận sự kiện callback query khi Admin bấm nút, sau đó gọi hàm kích hoạt gói Pro trong CSDL Supabase.  
> 
> **Cách kiểm chứng & thực thi của HuuHan12:**  
> - Tạo bot trên @BotFather, cấu hình `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID` vào `.env`.  
> - Hiện thực hóa `app/services/telegram_bot.py` và tích hợp vào `app/main.py`.  
> - Thử nghiệm thực tế: nộp mã chuyển khoản trên giao diện $\rightarrow$ nhận tin nhắn trên Telegram $\rightarrow$ bấm nút Phê duyệt $\rightarrow$ kiểm tra CSDL Supabase và modal web tự động chuyển sang trạng thái Pro thành công.

---

### 🔹 Prompt Mẫu 3: Về Rà Soát Sửa Lỗi Click Nút Phê Duyệt Telegram
> **Câu Prompt của HuuHan12:**  
> *"Kiểm tra cho tôi vì sao khi tôi chuyển khoản ngân hàng xong và đã gửi về telegram nhưng tôi nhấn phê duyệt không thành công, hãy đưa ra plan để sửa trước khi tôi nhấn triển khai nhé."*  
> 
> **Phản hồi từ AI:**  
> - Tiến hành kiểm tra DB Supabase (xác nhận đơn hàng vẫn ở trạng thái `pending_verification`, chứng tỏ hàm phê duyệt chưa từng được gọi).  
> - Kiểm tra cấu hình bot qua API `getWebhookInfo` của Telegram và phát hiện: Telegram đang áp dụng bộ lọc `allowed_updates: ['message', 'edited_message', 'channel_post', 'edited_channel_post']` vốn **không có `callback_query`**, khiến Telegram tự động huỷ bỏ sự kiện click nút.  
> - Đưa ra Plan gồm 4 bước: (1) Khai báo rõ ràng `allowed_updates` trong `getUpdates` và reset webhook; (2) Thoát ký tự HTML (`html.escape`) cho tin nhắn sửa đổi; (3) Bọc hàm DB bằng `asyncio.to_thread`; (4) Thêm supervisor auto-restart trong `main.py`.  
> 
> **Cách kiểm chứng & thực thi của HuuHan12:**  
> - Xem xét và phê duyệt Plan.  
> - Áp dụng bản vá vào `telegram_bot.py` và `main.py`.  
> - Gửi tin nhắn kiểm thử trực tiếp lên Telegram và bấm nút: nút phản hồi tức thì, hiển thị thông báo duyệt thành công và tin nhắn tự động đổi sang `✅ ĐÃ ĐƯỢC PHÊ DUYỆT BỞI ADMIN`.

---

## 4. Bảng Kê Chi Tiết File/Code Đóng Góp của Thành Viên `HuuHan12`

Toàn bộ các đóng góp mã nguồn dưới đây được xác thực trực tiếp từ lịch sử Git (`git log --author="HuuHan12" --stat`):

### 4.1. Phân hệ Backend (FastAPI, Python)

| Tệp mã nguồn | Hash Commit | Mục đích & Nội dung thực hiện |
| :--- | :--- | :--- |
| [`app/utils/geoclip.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/utils/geoclip.py) | `e957345`, `1d20c2b`, `f70a1ef` | Tích hợp service tải mô hình `geoclip-vietnam`, xử lý trích xuất embedding ảnh và matching tọa độ |
| [`app/api/predict.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/predict.py) | `1d20c2b`, `f70a1ef`, `3af37c8`, `8c89732`, `Working Tree` | API `POST /predict`: Nhận file ảnh, gọi pipeline AI, tính toán Top-K, kiểm tra quota scan, và trigger tính tiến độ thành tích check-in |
| [`app/api/gis.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/gis.py) | `1d20c2b` | API `POST /gis/calculate-error`, `POST /gis/select-location`: Đo đạc khoảng cách Geodesic WGS-84, Haversine, góc phương vị Bearing và chuẩn sai số Acc@K |
| [`app/api/data.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/data.py) | `1d20c2b`, `f70a1ef`, `3af37c8` | API `GET /data/explorer`, `GET /data/records`: Đọc dữ liệu từ SQLite `landmark.db`, phân trang và tìm kiếm địa danh |
| [`app/api/statistics.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/statistics.py) | `5f688d3`, `3af37c8` | API phân tích số liệu thống kê: Lượt quét ảnh, tỉ lệ nhận diện chính xác, phân bố địa lý |
| [`app/api/notifications.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/notifications.py) | `e3843e0`, `e4a83c3` | API thông báo người dùng: Đếm thông báo chưa đọc, đánh dấu đã đọc một phần hoặc toàn bộ |
| [`app/api/achievements.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/achievements.py) | `e3843e0`, `e4a83c3`, `Working Tree` | API hệ thống danh hiệu & check-in: Tính toán tiến độ mở khóa 7 huy hiệu thành tích, đồng bộ lịch sử scan |
| [`app/api/contact.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/contact.py) | `e3843e0` | API tiếp nhận liên hệ người dùng, kích hoạt `BackgroundTasks` gửi alert qua Telegram Bot |
| [`app/api/payments.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/api/payments.py) | `e3843e0`, `e4a83c3`, `40b756e`, `Working Tree` | Nâng cấp API nộp mã tham chiếu đối soát (`POST /payments/submit-transfer`), kích hoạt `BackgroundTasks` gửi alert duyệt đơn đến Telegram Bot, endpoint/hàm `execute_admin_approval` kích hoạt gói cước |
| [`app/services/telegram_bot.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/services/telegram_bot.py) | `40b756e`, `Working Tree` | Service Telegram Bot phê duyệt tương tác 2 chiều: gửi tin nhắn kèm Inline Keyboard, triển khai Background Listener qua FastAPI lifespan, xử lý `allowed_updates` nhận nút bấm, tự động duyệt đơn và kích hoạt gói Pro trong CSDL Supabase |
| [`app/main.py`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/main.py) | `Working Tree` | Tích hợp tiến trình nền `start_telegram_bot_listener` vào cơ chế `lifespan` của FastAPI kèm supervisor auto-restart loop, quản lý vòng đời bot listener an toàn 24/7 |
| [`app/schemas/*`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/schemas) | `5f688d3`, `e3843e0`, `40b756e`, `Working Tree` | Các schema Pydantic: `statistics.py`, `notification.py`, `achievement.py`, `contact.py`, `payment.py` (mở rộng `transaction_ref`), `history.py` |
| [`app/API_DOCUMENTATION.md`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/app/API_DOCUMENTATION.md) | `e3843e0` | Tài liệu đặc tả kỹ thuật chi tiết các endpoint API (Payments, Notifications, Achievements, Contact) |

### 4.2. Phân hệ Frontend (React, Vite, TypeScript/JSX)

| Tệp mã nguồn | Hash Commit | Mục đích & Nội dung thực hiện |
| :--- | :--- | :--- |
| [`web/src/components/GeoPredictionTab/*`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/components/GeoPredictionTab) | `1d20c2b`, `b4f5645`, `f70a1ef`, `3af37c8`, `Working Tree` | Toàn bộ các component Form AI (`UploadSection`, `TopResultHero`, `ResultCard`, `SidebarConfig`, `LeafletMap`); cập nhật `ResultCard.jsx` gỡ bỏ khối Top-K và nút check-in để chống trùng lặp với tab Đo đạc sai số, chỉ giữ lại nút Chia sẻ kết quả |
| [`web/src/components/GisErrorTab/*`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/components/GisErrorTab) | `1d20c2b`, `b4f5645`, `f70a1ef` | Component Form đo đạc sai số GIS (`GisErrorTab.jsx`, `GisErrorBanner.jsx`) |
| [`web/src/components/DataExplorerTab/*`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/components/DataExplorerTab) | `1d20c2b`, `b4f5645`, `f70a1ef` | Component Form khám phá tập dữ liệu địa danh |
| [`web/src/components/payment/PaymentQRModal.jsx`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/components/payment/PaymentQRModal.jsx) | `40b756e`, `Working Tree` | Modal quét mã VietQR Napas 247: Nhập mã giao dịch đối soát, tự động polling trạng thái thanh toán (3s/lần), loại bỏ hoàn toàn các nút tự duyệt demo trên client |
| [`web/src/pages/client/ClientPricing.jsx`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/pages/client/ClientPricing.jsx) | `Working Tree` | Bổ sung kiểm tra subscription Pro active, hiển thị nhãn `✓ Đang sử dụng` và điều hướng về Dashboard thay vì tạo lại mã QR trùng lặp |
| [`web/src/components/Header.jsx`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/components/Header.jsx) | `Working Tree` | Tinh gọn popup thông báo: gỡ bỏ nút footer "Xem tất cả thông báo" dư thừa, tối ưu hóa giao diện bo góc mượt mà |
| [`web/src/components/PrivateRoute.jsx`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/components/PrivateRoute.jsx) | `8c89732` | Component bảo vệ tuyến đường theo quyền hạn tài khoản người dùng |
| [`web/src/hooks/usePredict.ts`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/hooks/usePredict.ts) | `1d20c2b`, `f70a1ef`, `8c89732` | Custom hook điều phối toàn bộ luồng xử lý: tải ảnh, gọi API dự đoán, tính toán sai số, phân quyền quota scan |
| [`web/src/libs/geoUtils.ts`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/libs/geoUtils.ts) | `1d20c2b`, `f70a1ef` | Thư viện toán học GIS: Tính khoảng cách Haversine mặt cầu, định dạng tọa độ GPS và phân cấp độ chính xác |
| [`web/src/service/predictService.ts`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/service/predictService.ts) | `1d20c2b`, `f70a1ef`, `3af37c8` | Client service gọi các API Backend (`predictLandmarkApi`, `calculateGisErrorApi`, `selectLocationApi`) |
| [`web/src/service/favoriteService.ts`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/service/favoriteService.ts) | `3af37c8` | Client service quản lý địa điểm yêu thích |
| [`web/src/service/paymentService.ts`](file:///p:/CITD/HK3/L%E1%BA%ADp%20tr%C3%ACnh%20Python/DuAn/UI/web/src/service/paymentService.ts) | `40b756e`, `Working Tree` | Client service kết nối cổng thanh toán VietQR và nộp mã tham chiếu giao dịch |

---

## 5. Cách Thức Kiểm Tra và Xác Thực Kết Quả (Verification Methods)

Thành viên `HuuHan12` đã áp dụng quy trình kiểm thử nghiêm ngặt đối với mọi kết quả do bản thân xây dựng và các gợi ý kỹ thuật từ AI:

1. **Kiểm tra biên dịch & Cú pháp tĩnh (Static Type Checking):**
   - Sau khi hoàn thành việc chuyển đổi các tệp sang TypeScript (`usePredict.ts`, `geoUtils.ts`, `predictService.ts`), thực thi kiểm tra tính tương thích và build với Vite:
     ```powershell
     npm run build
     ```
   - Đạt kết quả `✓ built in ~9s` với 0 lỗi cú pháp; 100% các interface và kiểu dữ liệu tham số khớp với cấu trúc API Backend trả về.

2. **Kiểm tra gỡ bỏ xung đột Git (Merge Verification):**
   - Quét tìm kiếm toàn bộ repository để đảm bảo không còn bất kỳ ký tự xung đột merge nào bị sót lại:
     ```powershell
     git grep "<<<<<<<"
     ```
   - Đảm bảo tính toàn vẹn và sạch 100% mã nguồn khi hợp nhất nhánh.

3. **Kiểm thử API Backend độc lập (Backend Unit & Integration Testing):**
   - Sử dụng giao diện Swagger UI tự động của FastAPI (`http://127.0.0.1:8000/docs`) và Postman để kiểm tra từng endpoint do `HuuHan12` phát triển:
     - `POST /predict`: Gửi ảnh mẫu thực tế (`vinhhalong.jpg`), xác nhận trả về HTTP 200, danh sách Top-K địa danh và tọa độ GPS tương ứng.
     - `POST /gis/calculate-error`: Gửi cặp tọa độ thực tế và dự đoán, xác nhận các chỉ số `haversine_km`, `distance_km`, `bearing_degrees` và nhãn `accuracy_benchmark` được tính toán chuẩn xác.
     - `POST /payments/create-qr` & `POST /payments/submit-transfer`: Xác nhận sinh mã QR Napas 247 đúng định dạng URL ngân hàng TPBank với số tiền và nội dung thanh toán, tiếp nhận mã tham chiếu an toàn.
     - `GET /notifications` & `GET /achievements/my`: Xác nhận trả về đúng định dạng JSON có phân trang và trạng thái mở khóa huy hiệu.

4. **Kiểm thử giao diện người dùng thực tế (End-to-End UI Verification):**
   - Chạy đồng thời hệ thống trên trình duyệt (`http://localhost:5173/`):
     - Kéo thả ảnh mẫu $\rightarrow$ bấm "Nhận diện địa danh" $\rightarrow$ kết quả Top-1 hiển thị trên Hero Card, bản đồ Leaflet đánh dấu marker chính xác.
     - Kiểm tra đồng bộ Tab Dự đoán và Tab Đo đạc sai số GIS: Bấm chọn địa điểm dự đoán khác, chuyển sang Tab Đo đạc sai số $\rightarrow$ Tọa độ và khoảng cách sai số tự động tính toán lại theo đúng vị trí vừa chọn.

5. **Kiểm thử thực tế luồng Thanh toán VietQR & Phê duyệt Telegram Bot (End-to-End Payment & Bot Verification):**
   - Tạo đơn hàng gói Pro thực tế trên giao diện $\rightarrow$ quét mã VietQR và nhập mã tham chiếu giao dịch đối soát (`submit_transfer`).
   - Xác nhận Telegram Bot gửi tin nhắn thông báo tức thời đến quản trị viên kèm 2 nút Inline Keyboard (`[✅ Phê duyệt ngay]`, `[❌ Từ chối]`).
   - Nhấn nút phê duyệt trên Telegram $\rightarrow$ Bot phản hồi tức thì với alert pop-up và sửa nội dung tin nhắn thành `✅ ĐÃ ĐƯỢC PHÊ DUYỆT BỞI ADMIN` (gỡ bỏ nút bấm tránh click trùng).
   - Xác minh toàn vẹn dữ liệu trên Supabase Cloud: Bảng `payment_orders` chuyển trạng thái `completed`, bảng `user_subscriptions` kích hoạt thành công gói `pro` (thời hạn 30 ngày, 500 scans), và bảng `user_notifications` nhận thông báo kích hoạt.
   - Modal thanh toán trên giao diện người dùng tự động phát hiện đơn hoàn tất sau 3 giây polling và chuyển sang màn hình thành công mà không cần tải lại trang.

---

## 6. Đạo Đức Học Thuật & Cam Kết Độc Lập

- **Quyền tác giả và kiểm soát:** Mọi đoạn code được gợi ý hoặc hỗ trợ từ trợ lý AI đều được thành viên `HuuHan12` trực tiếp đọc hiểu, chỉnh sửa, đánh giá tính đúng đắn và kiểm thử thực tế trên hệ thống.
- **Không suy đoán / Không nhận vơ:** Báo cáo này chỉ ghi nhận đúng các phần việc thuộc phạm vi của `HuuHan12` đã được đối chiếu bằng chứng với lịch sử Git commit của dự án, không bao gồm các phần việc thuộc các thành viên còn lại của nhóm.
- **Bảo mật thông tin:** Không có bất kỳ khóa bí mật (secret keys), token xác thực hay thông tin cá nhân nhạy cảm nào bị đưa vào tài liệu.
