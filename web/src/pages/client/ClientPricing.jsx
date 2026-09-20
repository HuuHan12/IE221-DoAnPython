import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronDown, Zap, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import ClientLayout from "../../components/client/ClientLayout";
import PaymentQRModal from "../../components/payment/PaymentQRModal";
import {
    fetchPricingPlansApi,
    createPaymentQRApi,
    fetchMySubscriptionApi,
} from "../../service/paymentService";
import "../../css/Client.css";

function ClientPricing() {
    const navigate = useNavigate();

    // API state
    const [plans, setPlans] = useState([]);
    const [mySubscription, setMySubscription] = useState(null);
    const [loadingPlans, setLoadingPlans] = useState(true);

    // Modal state
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [isCreatingQR, setIsCreatingQR] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(1); // 1 tháng mặc định

    // FAQ Accordion active state
    const [openFaq, setOpenFaq] = useState(null);
    const [successBanner, setSuccessBanner] = useState("");

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Tải danh sách gói cước và gói hiện tại của user từ API
    useEffect(() => {
        const loadPricingData = async () => {
            try {
                setLoadingPlans(true);
                const [plansRes, subRes] = await Promise.allSettled([
                    fetchPricingPlansApi(),
                    fetchMySubscriptionApi(),
                ]);

                if (plansRes.status === "fulfilled" && plansRes.value?.data) {
                    setPlans(plansRes.value.data);
                }
                if (subRes.status === "fulfilled" && subRes.value) {
                    setMySubscription(subRes.value);
                }
            } catch (err) {
                // Fallback nếu API gặp trục trặc
            } finally {
                setLoadingPlans(false);
            }
        };

        loadPricingData();
    }, []);

    // Xử lý khi người dùng bấm "Nâng cấp Pro" hoặc đăng ký gói trả phí
    const handleUpgradePlan = async (planCode = "pro") => {
        try {
            setIsCreatingQR(true);
            const qrRes = await createPaymentQRApi(planCode, selectedDuration);
            setPaymentData(qrRes);
            setIsPaymentModalOpen(true);
        } catch (error) {
            alert(error.message || "Không thể khởi tạo mã thanh toán. Vui lòng thử lại.");
        } finally {
            setIsCreatingQR(false);
        }
    };

    // Khi thanh toán hoàn tất thành công
    const handlePaymentSuccess = async (res) => {
        try {
            const updatedSub = await fetchMySubscriptionApi();
            setMySubscription(updatedSub);
            setSuccessBanner(
                res?.message || "🎉 Chúc mừng bạn đã kích hoạt thành công gói Pro! Bạn có 500 lượt scan/ngày và mở khóa toàn bộ tính năng cao cấp."
            );
        } catch {
            //
        }
    };


    const faqItems = [
        {
            question: "Một lượt scan được tính như thế nào?",
            answer: "Mỗi lần bạn tải một hình ảnh lên hệ thống để mô hình AI GeoCLIP phân tích đặc trưng và dự đoán tọa độ GPS của địa danh sẽ được tính là 1 lượt scan."
        },
        {
            question: "Tôi có thể huỷ gói Pro bất cứ lúc nào không?",
            answer: "Có. Bạn có thể huỷ gia hạn tự động gói Pro bất cứ lúc nào trong trang Cài đặt tài khoản mà không phát sinh thêm chi phí nào."
        },
        {
            question: "Ảnh của tôi có được dùng để huấn luyện lại mô hình?",
            answer: "Không. Quyền riêng tư của bạn là ưu tiên hàng đầu. Ảnh của bạn chỉ được xử lý tạm thời để dự đoán vị trí địa lý và không được lưu trữ để huấn luyện lại mô hình khi chưa có sự đồng ý."
        },
        {
            question: "Đây là dịch vụ thương mại?",
            answer: "LandmarkAI là đồ án học thuật phát triển tại Đại học FPT. Bảng giá trên được xây dựng nhằm mô phỏng mô hình vận hành sản phẩm thực tế trong bài toán AI Visual Geo-localization."
        }
    ];

    const comparisonData = [
        { feature: "Số lượt scan / ngày", free: "10", pro: "500", enterprise: "Không giới hạn" },
        { feature: "Độ phân giải ảnh tối đa", free: "2 MP", pro: "12 MP", enterprise: "50 MP" },
        { feature: "Bán kính dự đoán GPS", free: "~25 km", pro: "~1 km", enterprise: "~1 km + tinh chỉnh" },
        { feature: "Tốc độ xử lý API", free: "Hàng đợi chung", pro: "Ưu tiên", enterprise: "Kênh riêng" },
        { feature: "Lịch sử tìm kiếm", free: "20 bản ghi", pro: "Không giới hạn", enterprise: "Không giới hạn" },
        { feature: "Kho ảnh cá nhân", free: "100 MB", pro: "20 GB", enterprise: "Tuỳ chọn" },
        { feature: "Dashboard thống kê", free: "—", pro: "✓", enterprise: "✓" },
        { feature: "Truy cập REST API", free: "—", pro: "✓", enterprise: "✓" },
        { feature: "Xuất báo cáo PDF/CSV", free: "—", pro: "✓", enterprise: "✓" },
        { feature: "Hỗ trợ ưu tiên", free: "—", pro: "—", enterprise: "✓" }
    ];

    const isProActive = mySubscription?.plan_code === "pro" && mySubscription?.is_active;
    const isExpiringSoon = isProActive && mySubscription?.days_remaining !== null && mySubscription?.days_remaining <= 3;

    return (
        <ClientLayout activeTab="pricing">
            {/* HERO SECTION */}
            <div className="pricing-hero-container">
                {successBanner && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            backgroundColor: "#F0FDF4",
                            border: "1.5px solid #86EFAC",
                            padding: "12px 24px",
                            borderRadius: "14px",
                            color: "#166534",
                            fontSize: "14px",
                            fontWeight: "600",
                            maxWidth: "680px",
                            margin: "0 auto 20px auto",
                            boxShadow: "0 4px 15px rgba(22, 101, 52, 0.08)",
                        }}
                    >
                        <Sparkles size={18} color="#16A34A" />
                        <span>{successBanner}</span>
                    </div>
                )}

                <span className="client-hero-subtitle">PRICING</span>
                <h1 className="client-hero-title">
                    Chọn gói phù hợp cho <span className="highlight-text">hành trình</span> của bạn
                </h1>
                <p style={{ color: "#64748b", maxWidth: "640px", margin: "12px auto 0 auto", fontSize: "0.98rem", lineHeight: "1.6" }}>
                    Mọi gói đều dùng cùng một mô hình nhận diện địa danh. Khác biệt nằm ở khối lượng xử lý, độ phân giải ảnh và các tính năng cá nhân hoá.
                </p>


                {/* Banner thông tin gói cước hiện tại của người dùng (từ API my-subscription) */}
                {mySubscription && (
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            backgroundColor: "#ECFDF5",
                            border: "1px solid #A7F3D0",
                            padding: "8px 18px",
                            borderRadius: "20px",
                            color: "#065F46",
                            fontSize: "13px",
                            fontWeight: "600",
                            marginTop: "16px",
                        }}
                    >
                        <ShieldCheck size={16} color="#059669" />
                        <span>
                            Gói cước hiện tại của bạn: <strong>{mySubscription.plan_name}</strong>
                            {mySubscription.days_remaining !== null && mySubscription.days_remaining !== undefined && (
                                <> (Còn {mySubscription.days_remaining} ngày sử dụng — 500 lượt scan/ngày)</>
                            )}
                        </span>
                    </div>
                )}

                <div className="pricing-student-pill">
                    <Zap size={15} />
                    <span>Sinh viên nhận 3 tháng Pro miễn phí</span>
                </div>
            </div>

            {/* 3 PRICING CARDS (Dynamic API data) */}
            <div className="pricing-cards-grid">
                {/* FREE CARD */}
                <div className="pricing-card-box">
                    {mySubscription?.plan_code === "free" && (
                        <div className="pricing-floating-badge" style={{ backgroundColor: "#64748B" }}>
                            GÓI CỦA BẠN
                        </div>
                    )}

                    <h3 className="pricing-plan-title">Free</h3>
                    <p className="pricing-plan-tagline">Dành cho sinh viên trải nghiệm</p>

                    <div className="pricing-plan-price-row">
                        <span className="pricing-plan-price">0đ</span>
                        <span className="pricing-plan-period">/tháng</span>
                    </div>

                    <ul className="pricing-features-list">
                        <li className="pricing-feature-item"><Check size={16} /> 10 lượt scan ảnh / ngày</li>
                        <li className="pricing-feature-item"><Check size={16} /> Ảnh tối đa 2 MP</li>
                        <li className="pricing-feature-item"><Check size={16} /> Độ chính xác bán kính ~25 km</li>
                        <li className="pricing-feature-item"><Check size={16} /> Lưu 20 kết quả lịch sử</li>
                        <li className="pricing-feature-item"><Check size={16} /> Bộ sưu tập yêu thích cơ bản</li>
                    </ul>

                    <button
                        type="button"
                        className="btn-pricing-action outline"
                        onClick={() => navigate("/dashboard")}
                        style={isProActive ? { opacity: 0.6, cursor: "default" } : {}}
                    >
                        {isProActive ? "Gói cơ bản" : mySubscription?.plan_code === "free" ? "Đang sử dụng" : "Bắt đầu miễn phí"}
                    </button>
                </div>

                {/* PRO CARD (FEATURED / HIGHLIGHTED) */}
                <div className="pricing-card-box pro-featured">
                    <div className="pricing-floating-badge">
                        {isProActive ? "GÓI CỦA BẠN" : "PHỔ BIẾN NHẤT"}
                    </div>

                    <h3 className="pricing-plan-title">Pro</h3>
                    <p className="pricing-plan-tagline">Cho người đi du lịch thường xuyên</p>

                    <div className="pricing-plan-price-row">
                        <span className="pricing-plan-price">99.000đ</span>
                        <span className="pricing-plan-period">/tháng</span>
                    </div>

                    <ul className="pricing-features-list">
                        <li className="pricing-feature-item"><Check size={16} /> 500 lượt scan ảnh / ngày</li>
                        <li className="pricing-feature-item"><Check size={16} /> Ảnh tối đa 12 MP + RAW</li>
                        <li className="pricing-feature-item"><Check size={16} /> GeoCLIP V2 — bán kính ~1 km</li>
                        <li className="pricing-feature-item"><Check size={16} /> Lịch sử & kho ảnh không giới hạn</li>
                        <li className="pricing-feature-item"><Check size={16} /> Dashboard thống kê hành trình</li>
                        <li className="pricing-feature-item"><Check size={16} /> Thử thách check-in & huy hiệu</li>
                    </ul>

                    {isProActive && !isExpiringSoon ? (
                        <>
                            <button
                                type="button"
                                className="btn-pricing-action current-active"
                                onClick={() => navigate("/dashboard")}
                            >
                                <Check size={18} color="#059669" />
                                <span>Đang sử dụng</span>
                            </button>
                            <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "8px", textAlign: "center", lineHeight: "1.4" }}>
                                Gói Pro còn <strong>{mySubscription.days_remaining} ngày</strong> sử dụng
                            </div>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="btn-pricing-action filled-teal"
                            onClick={() => handleUpgradePlan("pro")}
                            disabled={isCreatingQR}
                        >
                            {isCreatingQR ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                    <Loader2 size={16} className="animate-spin" />
                                    Đang tạo mã QR...
                                </span>
                            ) : isExpiringSoon ? (
                                "Gia hạn gói Pro (Sắp hết hạn)"
                            ) : (
                                "Nâng cấp Pro"
                            )}
                        </button>
                    )}
                </div>


                {/* ENTERPRISE CARD */}
                <div className="pricing-card-box">
                    <h3 className="pricing-plan-title">Enterprise</h3>
                    <p className="pricing-plan-tagline">Cho tổ chức du lịch, nhà trường</p>

                    <div className="pricing-plan-price-row">
                        <span className="pricing-plan-price">Liên hệ</span>
                    </div>

                    <ul className="pricing-features-list">
                        <li className="pricing-feature-item"><Check size={16} /> Không giới hạn lượt scan</li>
                        <li className="pricing-feature-item"><Check size={16} /> API riêng + hàng đợi ưu tiên</li>
                        <li className="pricing-feature-item"><Check size={16} /> Batch upload 1.000 ảnh/lần</li>
                        <li className="pricing-feature-item"><Check size={16} /> Fine-tune tập địa danh riêng</li>
                        <li className="pricing-feature-item"><Check size={16} /> SSO, phân quyền theo nhóm</li>
                        <li className="pricing-feature-item"><Check size={16} /> Hỗ trợ kỹ thuật 24/7</li>
                    </ul>

                    <Link to="/lien-he" className="btn-pricing-action filled-dark">
                        Nhận báo giá
                    </Link>
                </div>
            </div>

            {/* FEATURE COMPARISON TABLE SECTION */}
            <div className="pricing-table-section">
                <h2 className="section-title" style={{ marginBottom: "24px" }}>
                    So sánh chi tiết tính năng
                </h2>

                <div className="pricing-table-card">
                    <table className="pricing-table">
                        <thead>
                            <tr>
                                <th style={{ width: "35%" }}>TÍNH NĂNG</th>
                                <th style={{ width: "20%" }}>FREE</th>
                                <th style={{ width: "22.5%", color: "#0d9488" }}>PRO</th>
                                <th style={{ width: "22.5%" }}>ENTERPRISE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonData.map((row, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontWeight: "600", color: "#0f172a" }}>{row.feature}</td>
                                    <td>{row.free}</td>
                                    <td className="col-pro" style={{ fontWeight: "700", color: "#0f172a" }}>
                                        {row.pro === "✓" ? <Check size={18} className="table-check-icon" /> : row.pro}
                                    </td>
                                    <td>
                                        {row.enterprise === "✓" ? <Check size={18} className="table-check-icon" /> : row.enterprise === "—" ? <span className="table-dash">—</span> : row.enterprise}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ ACCORDION SECTION */}
            <div className="faq-section">
                <h2 className="section-title" style={{ textAlign: "center", marginBottom: "8px" }}>
                    Câu hỏi thường gặp
                </h2>

                <div className="faq-list">
                    {faqItems.map((item, index) => {
                        const isOpen = openFaq === index;
                        return (
                            <div key={index} className="faq-item-card">
                                <button
                                    type="button"
                                    className="faq-header-trigger"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span>{item.question}</span>
                                    <ChevronDown size={18} className={`faq-chevron ${isOpen ? "open" : ""}`} />
                                </button>

                                {isOpen && (
                                    <div className="faq-body-content">
                                        <p>{item.answer}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* POPUP MODAL THANH TOÁN VIETQR */}
            <PaymentQRModal
                isOpen={isPaymentModalOpen}
                paymentData={paymentData}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={handlePaymentSuccess}
            />
        </ClientLayout>
    );
}

export default ClientPricing;
