import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Code2, Database, MapPin, Cpu, Award } from "lucide-react";
import ClientLayout from "../../components/client/ClientLayout";
import "../../css/Client.css";

function ClientAbout() {
    return (
        <ClientLayout activeTab="about">
            <section className="client-hero-section">
                <span className="client-hero-subtitle">VỀ DỰ ÁN NGHIÊN CỨU</span>
                <h1 className="client-hero-title">
                    Hệ thống nhận diện địa danh <span className="highlight-text">LandmarkAI</span>
                </h1>
                <p style={{ color: "#475569", fontSize: "1.05rem", lineHeight: "1.7", maxWidth: "800px", marginTop: "12px" }}>
                    Đồ án môn <strong>Kỹ thuật lập trình Python (IE221) — Trường Đại học FPT</strong>. Nền tảng ứng dụng mô hình AI thị giác máy tính tiên tiến Vision Transformers và GeoCLIP nhằm xác định vị trí địa lý của các danh lam thắng cảnh Việt Nam qua ảnh chụp.
                </p>
            </section>

            {/* TECH STACK CARDS */}
            <div className="articles-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", margin: "40px 0" }}>
                <div className="article-card" style={{ padding: "28px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", color: "#0d9488", marginBottom: "16px" }}>
                        <Cpu size={24} />
                    </div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>Mô hình Vision Transformer</h3>
                    <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: "1.6" }}>
                        Trích xuất đặc trưng hình ảnh theo không gian patch, nhận diện sắc nét kiến trúc, mái chùa, dòng sông và đồi núi độc bản.
                    </p>
                </div>

                <div className="article-card" style={{ padding: "28px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706", marginBottom: "16px" }}>
                        <MapPin size={24} />
                    </div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>Định vị GeoCLIP Việt Nam</h3>
                    <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: "1.6" }}>
                        Ánh xạ trực tiếp vector hình ảnh sang hệ tọa độ GPS thực tế với sai số tính bằng ki-lô-mét và khoảng cách Haversine.
                    </p>
                </div>

                <div className="article-card" style={{ padding: "28px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7", marginBottom: "16px" }}>
                        <Code2 size={24} />
                    </div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "8px" }}>Backend Python & React UI</h3>
                    <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: "1.6" }}>
                        Hệ thống API RESTful phát triển bằng Python FastAPI, kết hợp với giao diện React + Vite mượt mà và bản đồ Leaflet.
                    </p>
                </div>
            </div>

            {/* AUTHOR / TEAM SECTION */}
            <div className="newsletter-banner" style={{ background: "#ffffff", color: "#0f172a", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-md)" }}>
                <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#0d9488", textTransform: "uppercase" }}>ĐỘI NGUÕ THỰC HIỆN</span>
                    <h2 style={{ fontSize: "1.6rem", fontWeight: "800", marginTop: "4px", marginBottom: "8px" }}>
                        Tác giả & Nhóm phát triển
                    </h2>
                    <p style={{ color: "#475569", fontSize: "0.95rem" }}>
                        Dự án được thực hiện bởi sinh viên <strong>Dư Hữu Hân</strong> cùng các thành viên nhóm đồ án Python - Trường Đại học FPT.
                    </p>
                </div>

                <Link to="/dashboard" className="btn-client-scan">
                    <Sparkles size={16} /> Mở Dashboard Nhận Diện
                </Link>
            </div>
        </ClientLayout>
    );
}

export default ClientAbout;
