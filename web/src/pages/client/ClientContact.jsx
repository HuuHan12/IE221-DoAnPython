import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    Mail,
    Phone,
    Bug,
    MapPin,
    Clock,
    Send,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    ExternalLink,
    MessageSquareQuote,
    Loader2
} from "lucide-react";
import ClientLayout from "../../components/client/ClientLayout";
import {
    fetchContactSubjectsApi,
    submitContactMessageApi,
} from "../../service/contactService";
import "../../css/Client.css";

function ClientContact() {
    const location = useLocation();

    // Danh sách chủ đề từ API (với fallback mặc định an toàn)
    const [subjects, setSubjects] = useState([
        "Tư vấn gói cước",
        "Báo lỗi kỹ thuật",
        "Hợp tác phát triển",
        "Góp ý tính năng",
        "Khác"
    ]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "Tư vấn gói cước",
        phone: "",
        message: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [openFaq, setOpenFaq] = useState(null);

    // Tải danh sách chủ đề động từ API & Tự động điền thông tin người dùng nếu đã đăng nhập
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const res = await fetchContactSubjectsApi();
                if (res?.subjects?.length) {
                    setSubjects(res.subjects);
                }
            } catch {
                // Giữ danh sách mặc định nếu mạng offline
            }

            // Tự động điền tên và email từ tài khoản người dùng nếu đã đăng nhập
            try {
                const rawUser = localStorage.getItem("user_info");
                if (rawUser) {
                    const user = JSON.parse(rawUser);
                    setFormData((prev) => ({
                        ...prev,
                        name: prev.name || user.full_name || user.name || "",
                        email: prev.email || user.email || "",
                    }));
                }
            } catch {
                // Bỏ qua nếu dữ liệu lưu không hợp lệ
            }

            // Kiểm tra tham số ?subject= trên URL (ví dụ chuyển từ trang Bảng giá sang)
            const queryParams = new URLSearchParams(location.search);
            const subjectParam = queryParams.get("subject");
            if (subjectParam) {
                setFormData((prev) => ({
                    ...prev,
                    subject: subjectParam,
                }));
            }
        };

        loadInitialData();
    }, [location.search]);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Xử lý gửi form liên hệ qua API POST /contact/submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        try {
            setIsSubmitting(true);
            const res = await submitContactMessageApi({
                full_name: formData.name.trim(),
                email: formData.email.trim(),
                subject: formData.subject.trim(),
                phone: formData.phone?.trim() || undefined,
                message: formData.message.trim(),
            });

            setSuccessMessage(
                res.message || "Gửi lời nhắn thành công! Nhóm dự án sẽ phản hồi cho bạn qua email sớm nhất."
            );

            // Xóa nội dung lời nhắn & số điện thoại sau khi gửi thành công
            setFormData((prev) => ({
                ...prev,
                phone: "",
                message: "",
            }));

            // Tự động ẩn thông báo thành công sau 6 giây
            setTimeout(() => {
                setSuccessMessage("");
            }, 6000);
        } catch (err) {
            setErrorMessage(err.message || "Không thể gửi lời nhắn. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const faqList = [
        {
            q: "AI nhận diện sai địa danh của tôi, làm gì tiếp?",
            a: "Bạn có thể gửi ảnh báo lỗi kèm tọa độ đúng thông qua form ở trên hoặc mục 'Báo lỗi kỹ thuật' trên GitHub. Chúng tôi sẽ gắn nhãn lại để huấn luyện phiên bản mô hình tiếp theo."
        },
        {
            q: "Tôi muốn thêm địa danh quê tôi vào hệ thống?",
            a: "Rất hoan nghênh! Hãy gửi cho chúng tôi tên địa danh, tỉnh thành và 5-10 bức ảnh góc chụp rõ nét. Hệ thống sẽ cập nhật trong đợt release dữ liệu hàng tháng."
        },
        {
            q: "Có thể dùng dữ liệu dự án cho báo cáo môn học?",
            a: "Hoàn toàn được! Mô hình và tập dữ liệu của LandmarkAI mở cho mục đích học tập và nghiên cứu phi thương mại. Bạn có thể trích dẫn nguồn đồ án môn Python FPT University."
        }
    ];

    return (
        <ClientLayout activeTab="contact">
            {/* HERO HEADER */}
            <div className="contact-hero-container">
                <span className="client-hero-subtitle">CONTACT & SUPPORT</span>
                <h1 className="client-hero-title">
                    Nhóm phát triển luôn <span className="highlight-text">lắng nghe</span> bạn
                </h1>
                <p style={{ color: "#64748b", maxWidth: "660px", margin: "12px auto 0 auto", fontSize: "0.98rem", lineHeight: "1.6" }}>
                    Gặp kết quả nhận diện chưa chính xác, muốn đề xuất thêm địa danh, hay cần dữ liệu cho báo cáo? Hãy gửi lời nhắn cho chúng tôi.
                </p>
            </div>

            {/* MAIN TWO-COLUMN LAYOUT */}
            <div className="contact-two-col-layout">
                {/* LEFT COLUMN: CONTACT FORM */}
                <div className="contact-form-card">
                    <h2 className="contact-form-title">Gửi lời nhắn</h2>
                    <p className="contact-form-subtitle">
                        Các trường có dấu * là bắt buộc. Thông tin chỉ dùng để phản hồi yêu cầu của bạn.
                    </p>

                    {/* Thông báo thành công */}
                    {successMessage && (
                        <div
                            style={{
                                padding: "16px 20px",
                                backgroundColor: "#ecfdf5",
                                color: "#047857",
                                border: "1px solid #a7f3d0",
                                borderRadius: "14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "20px",
                                fontSize: "14px",
                                fontWeight: "500",
                                animation: "fadeInDown 0.25s ease-out",
                            }}
                        >
                            <CheckCircle2 size={22} color="#059669" style={{ flexShrink: 0 }} />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Thông báo lỗi */}
                    {errorMessage && (
                        <div
                            style={{
                                padding: "16px 20px",
                                backgroundColor: "#fef2f2",
                                color: "#991b1b",
                                border: "1px solid #fecaca",
                                borderRadius: "14px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "20px",
                                fontSize: "14px",
                                fontWeight: "500",
                                animation: "fadeInDown 0.25s ease-out",
                            }}
                        >
                            <AlertCircle size={22} color="#dc2626" style={{ flexShrink: 0 }} />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="contact-form-grid">
                            <div className="contact-form-group">
                                <label className="contact-form-label">Họ và tên *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nguyễn Văn A"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="client-search-input"
                                    style={{ paddingLeft: "16px" }}
                                />
                            </div>

                            <div className="contact-form-group">
                                <label className="contact-form-label">Email *</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="ban@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="client-search-input"
                                    style={{ paddingLeft: "16px" }}
                                />
                            </div>
                        </div>

                        <div className="contact-form-grid">
                            <div className="contact-form-group">
                                <label className="contact-form-label">Chủ đề *</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="contact-form-select"
                                >
                                    {subjects.map((sub, idx) => (
                                        <option key={idx} value={sub}>
                                            {sub}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="contact-form-group">
                                <label className="contact-form-label">Số điện thoại</label>
                                <input
                                    type="tel"
                                    placeholder="Không bắt buộc (ví dụ: 0935901051)"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="client-search-input"
                                    style={{ paddingLeft: "16px" }}
                                />
                            </div>
                        </div>

                        <div className="contact-form-group" style={{ marginBottom: "24px" }}>
                            <label className="contact-form-label">Lời nhắn *</label>
                            <textarea
                                rows="5"
                                required
                                minLength={5}
                                placeholder="Mô tả chi tiết vấn đề, kèm tên địa danh hoặc mã kết quả scan nếu có..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="client-search-input"
                                style={{ paddingLeft: "16px", borderRadius: "14px", resize: "vertical" }}
                            />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <button
                                type="submit"
                                className="btn-client-scan"
                                style={{ borderRadius: "24px", padding: "12px 28px" }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Đang gửi lời nhắn...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        <span>Gửi lời nhắn</span>
                                    </>
                                )}
                            </button>

                            <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                                Bằng việc gửi, bạn đồng ý để nhóm liên hệ lại qua email.
                            </span>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN: INFO CARDS & MAP */}
                <div className="contact-right-cards">
                    {/* INFO CARD 1: EMAIL */}
                    <div className="contact-info-item-card">
                        <div className="contact-info-icon">
                            <Mail size={20} />
                        </div>
                        <div>
                            <h4 className="contact-info-title">Email nhóm dự án</h4>
                            <a href="mailto:team.landmarkai@fpt.edu.vn" className="contact-info-value">
                                team.landmarkai@fpt.edu.vn
                            </a>
                            <p className="contact-info-desc">Phản hồi trong 24 giờ làm việc</p>
                        </div>
                    </div>

                    {/* INFO CARD 2: HOTLINE */}
                    <div className="contact-info-item-card">
                        <div className="contact-info-icon">
                            <Phone size={20} />
                        </div>
                        <div>
                            <h4 className="contact-info-title">Hotline hỗ trợ</h4>
                            <a href="tel:+842873001866" className="contact-info-value">
                                (+84) 28 7300 1866
                            </a>
                            <p className="contact-info-desc">Thứ 2 – Thứ 6, 08:00 – 17:00</p>
                        </div>
                    </div>

                    {/* INFO CARD 3: BUG REPORT */}
                    <div className="contact-info-item-card">
                        <div className="contact-info-icon">
                            <Bug size={20} />
                        </div>
                        <div>
                            <h4 className="contact-info-title">Báo lỗi kỹ thuật</h4>
                            <a
                                href="https://github.com/HuuHan12/IE221-DoAnPython/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-info-value"
                                style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                            >
                                <span>github.com/landmarkai/issues</span>
                                <ExternalLink size={12} />
                            </a>
                            <p className="contact-info-desc">Kèm ảnh và kết quả dự đoán sai</p>
                        </div>
                    </div>

                    {/* INFO CARD 4: MAP CARD */}
                    <div className="contact-map-card">
                        <iframe
                            title="FPT University Location Map"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.479323142702!2d106.80730837583842!3d10.851432457808266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                            className="contact-map-frame"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                        <div className="contact-map-footer">
                            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                <MapPin size={16} color="#0d9488" style={{ marginTop: "2px", flexShrink: 0 }} />
                                <span>Khoa Công nghệ Thông tin — Trường Đại học FPT, Lô E2a-7, Đường D1, Khu Công nghệ cao, TP. Thủ Đức, TP.HCM</span>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <Clock size={16} color="#0d9488" style={{ flexShrink: 0 }} />
                                <span>Giờ trực nhóm dự án: Thứ 3 & Thứ 5, 14:00 – 17:00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM FAQ SECTION */}
            <div className="faq-section" style={{ maxWidth: "100%" }}>
                <h2 className="section-title" style={{ fontSize: "1.35rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <MessageSquareQuote size={22} color="#0d9488" />
                    <span>Trước khi gửi, có thể bạn đang cần</span>
                </h2>

                <div className="faq-list">
                    {faqList.map((item, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div key={idx} className="faq-item-card">
                                <button
                                    type="button"
                                    className="faq-header-trigger"
                                    onClick={() => toggleFaq(idx)}
                                >
                                    <span>{item.q}</span>
                                    <ChevronDown size={18} className={`faq-chevron ${isOpen ? "open" : ""}`} />
                                </button>

                                {isOpen && (
                                    <div className="faq-body-content">
                                        <p>{item.a}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </ClientLayout>
    );
}

export default ClientContact;
