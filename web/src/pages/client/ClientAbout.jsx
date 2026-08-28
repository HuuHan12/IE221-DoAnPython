import React from "react";
import { Link } from "react-router-dom";
import {
    Sparkles,
    Database,
    Layers,
    Compass,
    Monitor,
    Users,
    GitBranch,
    ArrowUpRight
} from "lucide-react";
import ClientLayout from "../../components/client/ClientLayout";
import "../../css/Client.css";

function ClientAbout() {
    const techStack = [
        "Python 3.11",
        "PyTorch",
        "GeoCLIP",
        "ViT-B/16",
        "FastAPI",
        "PostgreSQL",
        "React + TanStack",
        "Google Maps API"
    ];

    const teamMembers = [
        { initial: "D", name: "Dư Hữu Hân", role: "Team Lead + AI Model" },
        { initial: "T", name: "Thành viên 2", role: "Backend + FastAPI" },
        { initial: "T", name: "Thành viên 3", role: "Frontend + React" },
        { initial: "T", name: "Thành viên 4", role: "Data + Gắn nhãn & Kiểm thử" }
    ];

    return (
        <ClientLayout activeTab="about">
            {/* HERO SECTION */}
            <div className="about-hero-container">
                <span className="client-hero-subtitle">ABOUT THE PROJECT</span>
                <h1 className="about-hero-title">
                    Dạy máy tính <span className="highlight-text">nhìn</span> và nhận ra từng địa danh Việt Nam
                </h1>
                <p className="about-hero-desc">
                    LandmarkAI là đồ án môn Python: một web app du lịch thông minh có thể đoán tên địa danh và toạ độ GPS chỉ từ một bức ảnh chụp.
                </p>

                <div className="about-hero-btns-row">
                    <Link to="/dashboard" className="btn-client-scan">
                        <Sparkles size={16} />
                        <span>Thử nhận diện ảnh</span>
                    </Link>

                    <a
                        href="https://github.com/HuuHan12/IE221-DoAnPython"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-about-outline"
                    >
                        Xem GitHub Repo
                    </a>
                </div>
            </div>

            {/* BANNER CARD & METRICS BAR */}
            <div className="about-banner-card">
                <div className="about-banner-img-box">
                    <img
                        src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop"
                        alt="LandmarkAI Pagoda Landscape"
                    />
                </div>

                <div className="about-metrics-bar">
                    <div className="metric-item">
                        <span className="metric-value">1.200+</span>
                        <span className="metric-label">Ảnh địa danh trong tập dữ liệu</span>
                    </div>

                    <div className="metric-item">
                        <span className="metric-value">63</span>
                        <span className="metric-label">Tỉnh thành được gắn nhãn</span>
                    </div>

                    <div className="metric-item">
                        <span className="metric-value">87%</span>
                        <span className="metric-label">Top-1 accuracy trên tập test</span>
                    </div>

                    <div className="metric-item">
                        <span className="metric-value">~1 km</span>
                        <span className="metric-label">Bán kính sai số GPS trung vị</span>
                    </div>
                </div>
            </div>

            {/* TWO-COLUMN SECTION */}
            <div className="about-two-col-grid">
                {/* LEFT COLUMN: MỤC TIÊU */}
                <div className="about-left-col">
                    <span className="client-hero-subtitle">MỤC TIÊU</span>
                    <h2 className="section-title" style={{ marginBottom: "16px", marginTop: "4px" }}>
                        Vì sao chúng tôi làm dự án này
                    </h2>

                    <p>
                        Rất nhiều bức ảnh du lịch bị lãng quên trong thư viện điện thoại vì không ai còn nhớ nơi đó tên gì. Chúng tôi muốn biến một tấm ảnh thành một câu chuyện có địa chỉ.
                    </p>

                    <p>
                        Về mặt học thuật, dự án là dịp áp dụng trọn vẹn kiến thức Python: xử lý ảnh, học sâu, xây dựng API, thiết kế cơ sở dữ liệu và triển khai giao diện người dùng hoàn chỉnh.
                    </p>

                    {/* TECH STACK BADGES */}
                    <div className="about-tech-badges-list">
                        {techStack.map((tech, idx) => (
                            <span key={idx} className="about-tech-badge">
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: KIẾN TRÚC MÔ HÌNH */}
                <div className="about-pipeline-card">
                    <span className="client-hero-subtitle">KIẾN TRÚC MÔ HÌNH</span>
                    <h3 className="section-title" style={{ fontSize: "1.35rem", marginTop: "4px", marginBottom: "16px" }}>
                        Pipeline nhận diện 4 bước
                    </h3>

                    <div className="pipeline-steps-list">
                        {/* STEP 1 */}
                        <div className="pipeline-step-item">
                            <div className="pipeline-icon-box">
                                <Database size={18} />
                            </div>
                            <div>
                                <h4 className="pipeline-step-title">1. Thu thập & gắn nhãn</h4>
                                <p className="pipeline-step-desc">
                                    Crawl ảnh địa danh từ nguồn mở, làm sạch trùng lặp, gắn nhãn tên địa danh + toạ độ GPS theo tỉnh thành.
                                </p>
                            </div>
                        </div>

                        {/* STEP 2 */}
                        <div className="pipeline-step-item">
                            <div className="pipeline-icon-box">
                                <Layers size={18} />
                            </div>
                            <div>
                                <h4 className="pipeline-step-title">2. Trích xuất đặc trưng</h4>
                                <p className="pipeline-step-desc">
                                    Ảnh đi qua backbone Vision Transformer (ViT-B/16) để tạo embedding 512 chiều bất biến với góc chụp và ánh sáng.
                                </p>
                            </div>
                        </div>

                        {/* STEP 3 */}
                        <div className="pipeline-step-item">
                            <div className="pipeline-icon-box">
                                <Compass size={18} />
                            </div>
                            <div>
                                <h4 className="pipeline-step-title">3. Đối chiếu GeoCLIP</h4>
                                <p className="pipeline-step-desc">
                                    Embedding ảnh được so khớp cosine với embedding toạ độ đã học, trả về top-K vị trí kèm điểm tin cậy.
                                </p>
                            </div>
                        </div>

                        {/* STEP 4 */}
                        <div className="pipeline-step-item">
                            <div className="pipeline-icon-box">
                                <Monitor size={18} />
                            </div>
                            <div>
                                <h4 className="pipeline-step-title">4. Hậu xử lý & hiển thị</h4>
                                <p className="pipeline-step-desc">
                                    Chuẩn hoá xác suất, đối chiếu cơ sở dữ liệu địa danh, render bản đồ tương tác và lưu vào lịch sử người dùng.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TEAM SECTION */}
            <div style={{ marginBottom: "60px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div>
                        <span className="client-hero-subtitle">TEAM</span>
                        <h2 className="section-title" style={{ marginTop: "4px" }}>
                            Nhóm phát triển
                        </h2>
                    </div>

                    <div style={{ color: "#0d9488", opacity: 0.7 }}>
                        <Users size={28} />
                    </div>
                </div>

                <div className="about-team-grid">
                    {teamMembers.map((member, idx) => (
                        <div key={idx} className="team-member-card">
                            <div className="team-avatar-circle">{member.initial}</div>
                            <h4 className="team-member-name">{member.name}</h4>
                            <span className="team-member-role">{member.role}</span>
                        </div>
                    ))}
                </div>

                {/* GITHUB OPEN SOURCE BANNER */}
                <div className="about-github-banner">
                    <div className="github-banner-left">
                        <div className="github-icon-box">
                            <GitBranch size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", marginBottom: "4px" }}>
                                Mã nguồn mở cho mục đích học tập
                            </h3>
                            <p style={{ fontSize: "0.88rem", color: "#94a3b8", margin: 0 }}>
                                Toàn bộ notebook huấn luyện, script tiền xử lý và tài liệu báo cáo đều được công bố.
                            </p>
                        </div>
                    </div>

                    <a
                        href="https://github.com/HuuHan12/IE221-DoAnPython"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-client-scan"
                        style={{ whiteSpace: "nowrap" }}
                    >
                        <span>Xem repository</span>
                        <ArrowUpRight size={16} />
                    </a>
                </div>
            </div>
        </ClientLayout>
    );
}

export default ClientAbout;
