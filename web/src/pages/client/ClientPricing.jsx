import React from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";
import ClientLayout from "../../components/client/ClientLayout";
import "../../css/Client.css";

function ClientPricing() {
    const plans = [
        {
            name: "Khám Phá (Miễn Phí)",
            price: "0 VNĐ",
            period: "mãi mãi",
            desc: "Dành cho người dùng cá nhân muốn trải nghiệm nhận diện địa danh bằng AI cơ bản.",
            features: [
                "Tải lên tối đa 10 ảnh/ngày",
                "Nhận diện 50+ địa danh phổ biến Việt Nam",
                "Hiển thị tọa độ GPS & độ tin cậy phần trăm",
                "Lưu lịch sử nhận diện 7 ngày"
            ],
            btnText: "Bắt đầu trải nghiệm",
            highlight: false
        },
        {
            name: "Cá Nhân Pro",
            price: "99.000 VNĐ",
            period: "tháng",
            desc: "Dành cho nhiếp ảnh gia, traveler chuyên nghiệp cần kho lưu trữ & độ chính xác cao nhất.",
            features: [
                "Tải lên không giới hạn số lượng ảnh",
                "Nhận diện 500+ địa danh & danh thắng Việt Nam",
                "Mô hình AI GeoCLIP & Vision Transformers nâng cao",
                "Đo đạc sai số GIS chi tiết theo bán kính",
                "Bộ sưu tập yêu thích & xuất báo cáo PDF/Excel",
                "Hỗ trợ ưu tiên 24/7"
            ],
            btnText: "Đăng ký Pro ngay",
            highlight: true
        },
        {
            name: "Doanh Nghiệp / API",
            price: "Liên hệ",
            period: "dự án",
            desc: "Tích hợp API nhận diện địa danh tự động vào ứng dụng du lịch, bản đồ số doanh nghiệp.",
            features: [
                "Cổng API RESTful tốc độ cao (<200ms)",
                "Custom dataset địa danh theo yêu cầu doanh nghiệp",
                "Hỗ trợ triển khai On-premise hoặc Cloud riêng",
                "Cam kết SLA 99.9% uptime",
                "Chuyên viên AI hỗ trợ tích hợp trực tiếp"
            ],
            btnText: "Liên hệ tư vấn",
            highlight: false
        }
    ];

    return (
        <ClientLayout activeTab="pricing">
            <section className="client-hero-section" style={{ textAlign: "center", alignItems: "center" }}>
                <span className="client-hero-subtitle">BẢNG GIÁ DỊCH VỤ</span>
                <h1 className="client-hero-title">
                    Gói dịch vụ <span className="highlight-text">linh hoạt</span> cho mọi nhu cầu
                </h1>
                <p style={{ color: "#64748b", maxWidth: "600px", margin: "12px auto 36px auto" }}>
                    Trải nghiệm sức mạnh của AI Vision Transformers trong việc định vị địa danh Việt Nam với chi phí tối ưu.
                </p>
            </section>

            <div className="articles-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }}>
                {plans.map((plan, idx) => (
                    <div
                        key={idx}
                        className="article-card"
                        style={{
                            padding: "36px 28px",
                            borderRadius: "24px",
                            border: plan.highlight ? "2px solid #0d9488" : "1px solid #e2e8f0",
                            boxShadow: plan.highlight ? "0 12px 30px rgba(13,148,136,0.15)" : "var(--shadow-sm)",
                            position: "relative",
                            backgroundColor: plan.highlight ? "#fafdfd" : "#ffffff"
                        }}
                    >
                        {plan.highlight && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: "-14px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    backgroundColor: "#0d9488",
                                    color: "#ffffff",
                                    fontSize: "0.78rem",
                                    fontWeight: "800",
                                    padding: "4px 16px",
                                    borderRadius: "20px"
                                }}
                            >
                                POPULAR 🔥
                            </span>
                        )}

                        <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                            {plan.name}
                        </h3>
                        <p style={{ fontSize: "0.88rem", color: "#64748b", minHeight: "44px", marginBottom: "20px" }}>
                            {plan.desc}
                        </p>

                        <div style={{ marginBottom: "24px" }}>
                            <span style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a" }}>{plan.price}</span>
                            <span style={{ fontSize: "0.88rem", color: "#64748b" }}> /{plan.period}</span>
                        </div>

                        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                            {plan.features.map((feat, fIdx) => (
                                <li key={fIdx} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.9rem", color: "#334155" }}>
                                    <Check size={16} color="#0d9488" style={{ marginTop: "3px", flexShrink: 0 }} />
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            to={plan.highlight ? "/dashboard" : "/login"}
                            className="btn-client-scan"
                            style={{
                                justifyContent: "center",
                                width: "100%",
                                borderRadius: "14px",
                                background: plan.highlight ? "linear-gradient(135deg, #0d9488, #0f766e)" : "#0f172a"
                            }}
                        >
                            <span>{plan.btnText}</span>
                        </Link>
                    </div>
                ))}
            </div>
        </ClientLayout>
    );
}

export default ClientPricing;
