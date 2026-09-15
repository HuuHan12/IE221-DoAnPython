import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    MapPin,
    Clock,
    Ticket,
    Star,
    Heart,
    Share2,
    Camera,
    UploadCloud,
    CheckCircle2,
    ChevronRight,
    Sparkles,
    Search,
    Loader2,
    Trophy,
} from "lucide-react";
import ClientLayout from "../../components/client/ClientLayout";
import { recordCheckinApi } from "../../service/achievementService";
import "../../css/Client.css";

const landmarksList = [
    {
        id: "thien-mu",
        name: "Chùa Thiên Mụ",
        city: "Huế",
        coords: "16.4539° N, 107.5450° E",
        tags: ["Di tích lịch sử", "Thế kỷ 17", "Miền Trung"],
        heroImg: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&auto=format&fit=crop",
        address: "Đường Nguyễn Phúc Nguyên, P. Hương Long, TP. Huế",
        hours: "06:00 - 18:00 hằng ngày",
        price: "Miễn phí tham quan",
        rating: "4.7 / 5 (12.480 đánh giá)",
        aiConfidence: "94,2%",
        scannedCount: "318",
        desc: "Chùa Thiên Mụ – còn gọi là Linh Mụ – toạ lạc trên đồi Hà Khê, tả ngạn sông Hương, cách trung tâm thành phố Huế khoảng 5 km về phía tây. Ngôi chùa được xem là biểu tượng tâm linh thần của vùng đất thần kinh.\n\nĐiểm nhấn kiến trúc là tháp Phước Duyên bảy tầng cao 21 m, mỗi tầng thờ một vị Phật, dựng năm 1844 dưới triều vua Thiệu Trị. Phía sau tháp là điện Đại Hùng, điện Địa Tạng, điện Quan Âm và khu vườn thông tĩnh lặng nơi đặt mộ tháp các vị hoà thượng.\n\nTừ sân trước chùa, tầm nhìn mở ra khúc uốn của sông Hương – khung hình quen thuộc trong tranh và thơ về Huế, và cũng là góc chụp mà mô hình AI của chúng tôi nhận diện với độ chính xác cao nhất.",
        gallery: [
            "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&auto=format&fit=crop"
        ],
        mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.333249089201!2d107.54281137588725!3d16.45391698428268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a052ff6b7e61%3A0xb36336e4f3a76356!2zQ2jDuWEgVGhpw6puIE3hu6U!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s",
        nearby: [
            { name: "Đại Nội Huế", dist: "Cách 5.2 km", img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=150&auto=format&fit=crop" },
            { name: "Cầu Tràng Tiền", dist: "Cách 6.0 km", img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=150&auto=format&fit=crop" },
            { name: "Lăng Tự Đức", dist: "Cách 7.8 km", img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=150&auto=format&fit=crop" }
        ]
    },
    {
        id: "ha-long",
        name: "Vịnh Hạ Long",
        city: "Quảng Ninh",
        coords: "20.9500° N, 107.0833° E",
        tags: ["Kỳ quan thiên nhiên", "UNESCO", "Miền Bắc"],
        heroImg: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&auto=format&fit=crop",
        address: "Thành phố Hạ Long, Tỉnh Quảng Ninh",
        hours: "06:00 - 19:00 hằng ngày",
        price: "290.000 VNĐ / vé tuyến",
        rating: "4.9 / 5 (38.900 đánh giá)",
        aiConfidence: "96,8%",
        scannedCount: "542",
        desc: "Vịnh Hạ Long là di sản thiên nhiên thế giới UNESCO nổi tiếng với hàng ngàn hòn đảo đá vôi nhấp nhô trên vùng biển xanh ngọc bích.",
        gallery: [
            "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop"
        ],
        mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119330.4355551322!2d107.03713025!3d20.950000000000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314a5796a5861739%3A0xc665187e17420!2zVmluaCBIYSBMb25n!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s",
        nearby: [
            { name: "Đảo Ti Tốp", dist: "Cách 3.5 km", img: "https://images.unsplash.com/photo-1528127269322-539801943592?w=150&auto=format&fit=crop" },
            { name: "Hang Sửng Sốt", dist: "Cách 4.8 km", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=150&auto=format&fit=crop" }
        ]
    }
];

function ClientLandmarks() {
    const [selectedLandmarkId, setSelectedLandmarkId] = useState("thien-mu");
    const [activeTab, setActiveTab] = useState("gioi-thieu");
    const [isFavorite, setIsFavorite] = useState(false);
    const [checkinSuccess, setCheckinSuccess] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkinData, setCheckinData] = useState(null);
    const [checkinError, setCheckinError] = useState(null);

    const currentLandmark =
        landmarksList.find((l) => l.id === selectedLandmarkId) || landmarksList[0];

    const handlePerformCheckin = async () => {
        setIsCheckingIn(true);
        setCheckinError(null);
        try {
            const res = await recordCheckinApi();
            if (res && res.status === "success") {
                setCheckinData(res);
                setCheckinSuccess(true);
            }
        } catch (err) {
            setCheckinError(err.message || "Không thể thực hiện check-in lúc này.");
        } finally {
            setIsCheckingIn(false);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        handlePerformCheckin();
    };

    return (
        <ClientLayout activeTab="landmarks">
            <div className="landmark-detail-wrapper">
                {/* SELECTOR BAR (Allow exploring different landmarks) */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {landmarksList.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                className={`category-pill ${selectedLandmarkId === item.id ? "active" : ""}`}
                                onClick={() => setSelectedLandmarkId(item.id)}
                            >
                                📍 {item.name} ({item.city})
                            </button>
                        ))}
                    </div>

                    <Link to="/dashboard" className="btn-client-scan" style={{ padding: "8px 18px", fontSize: "0.86rem" }}>
                        <Sparkles size={14} /> Nhận diện ảnh mới
                    </Link>
                </div>

                {/* HERO LANDMARK HEADER BANNER */}
                <div className="landmark-hero-banner">
                    <img src={currentLandmark.heroImg} alt={currentLandmark.name} className="landmark-hero-img" />

                    <div className="landmark-hero-overlay">
                        {/* TOP ROW: BREADCRUMB & SHARE */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div className="landmark-breadcrumb">
                                <span>Trang chủ</span> &gt; <span>{currentLandmark.city}</span> &gt; <strong style={{ color: "#ffffff" }}>{currentLandmark.name}</strong>
                            </div>

                            <div className="landmark-hero-actions">
                                <button
                                    type="button"
                                    className="btn-hero-action primary"
                                    onClick={() => alert("Mở camera check-in địa danh!")}
                                >
                                    <Camera size={15} />
                                    <span>Thử thách check-in</span>
                                </button>

                                <button
                                    type="button"
                                    className="btn-hero-action"
                                    onClick={() => setIsFavorite(!isFavorite)}
                                >
                                    <Heart size={15} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "#ffffff"} />
                                    <span>{isFavorite ? "Đã thích" : "Yêu thích"}</span>
                                </button>

                                <button
                                    type="button"
                                    className="btn-hero-action"
                                    style={{ borderRadius: "50%", padding: "8px", width: "36px", height: "36px", justifyContent: "center" }}
                                    onClick={() => {
                                        navigator.clipboard?.writeText(window.location.href);
                                        alert("Đã sao chép link địa danh!");
                                    }}
                                >
                                    <Share2 size={15} />
                                </button>
                            </div>
                        </div>

                        {/* BOTTOM ROW: TITLE & TAGS */}
                        <div>
                            <div className="landmark-tags-row">
                                {currentLandmark.tags.map((tag, idx) => (
                                    <span key={idx} className="landmark-hero-tag">{tag}</span>
                                ))}
                            </div>

                            <h1 className="landmark-hero-title">{currentLandmark.name}</h1>

                            <p className="landmark-hero-location">
                                <MapPin size={16} color="#2dd4bf" />
                                <span>Thành phố {currentLandmark.city} • {currentLandmark.coords}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* QUICK INFO BAR (4 Columns Floating Bar) */}
                <div className="landmark-quick-info-bar">
                    <div className="quick-info-item">
                        <MapPin size={20} className="quick-info-icon" />
                        <div className="quick-info-text-box">
                            <span className="quick-info-label">ĐỊA CHỈ</span>
                            <span className="quick-info-value">{currentLandmark.address}</span>
                        </div>
                    </div>

                    <div className="quick-info-item">
                        <Clock size={20} className="quick-info-icon" />
                        <div className="quick-info-text-box">
                            <span className="quick-info-label">GIỜ MỞ CỬA</span>
                            <span className="quick-info-value">{currentLandmark.hours}</span>
                        </div>
                    </div>

                    <div className="quick-info-item">
                        <Ticket size={20} className="quick-info-icon" />
                        <div className="quick-info-text-box">
                            <span className="quick-info-label">GIÁ VÉ</span>
                            <span className="quick-info-value">{currentLandmark.price}</span>
                        </div>
                    </div>

                    <div className="quick-info-item">
                        <Star size={20} className="quick-info-icon" color="#f59e0b" />
                        <div className="quick-info-text-box">
                            <span className="quick-info-label">XẾP HẠNG</span>
                            <span className="quick-info-value">{currentLandmark.rating}</span>
                        </div>
                    </div>
                </div>

                {/* CONTENT TWO-COLUMN GRID */}
                <div className="landmark-detail-grid">
                    {/* LEFT COLUMN: ABOUT, AI INSIGHT, GALLERY, MAP */}
                    <div>
                        {/* TABS */}
                        <div className="landmark-tabs-nav">
                            <button
                                type="button"
                                className={`landmark-tab-btn ${activeTab === "gioi-thieu" ? "active" : ""}`}
                                onClick={() => setActiveTab("gioi-thieu")}
                            >
                                Giới thiệu
                            </button>
                            <button
                                type="button"
                                className={`landmark-tab-btn ${activeTab === "lich-su" ? "active" : ""}`}
                                onClick={() => setActiveTab("lich-su")}
                            >
                                Lịch sử
                            </button>
                            <button
                                type="button"
                                className={`landmark-tab-btn ${activeTab === "kinh-nghiem" ? "active" : ""}`}
                                onClick={() => setActiveTab("kinh-nghiem")}
                            >
                                Kinh nghiệm
                            </button>
                        </div>

                        {/* DESCRIPTION CONTENT */}
                        <div style={{ fontSize: "0.98rem", lineHeight: "1.7", color: "#334155", whitespace: "pre-line" }}>
                            {currentLandmark.desc}
                        </div>

                        {/* AI INSIGHT BOX */}
                        <div className="ai-insight-box">
                            <span className="ai-insight-title">AI INSIGHT</span>
                            <p className="ai-insight-text">
                                Mô hình nhận diện địa danh này với độ tin cậy trung bình <strong>{currentLandmark.aiConfidence}</strong> trên {currentLandmark.scannedCount} ảnh do người dùng tải lên. Đặc trưng quyết định: hình dáng tháp bảy tầng và đường bờ sông phía trước.
                            </p>
                            <div className="ai-insight-progress-bg">
                                <div className="ai-insight-progress-bar" style={{ width: currentLandmark.aiConfidence.replace(",", ".") }} />
                            </div>
                        </div>

                        {/* GALLERY */}
                        <div style={{ margin: "36px 0" }}>
                            <h3 className="section-title" style={{ fontSize: "1.3rem", marginBottom: "16px" }}>Thư viện ảnh</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                                {currentLandmark.gallery.map((imgUrl, i) => (
                                    <img
                                        key={i}
                                        src={imgUrl}
                                        alt={`Gallery ${i}`}
                                        style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "16px" }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* MAP CONTAINER */}
                        <div>
                            <h3 className="section-title" style={{ fontSize: "1.3rem", marginBottom: "16px" }}>Vị trí trên bản đồ</h3>
                            <div style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                                <iframe
                                    title={`Map ${currentLandmark.name}`}
                                    src={currentLandmark.mapEmbed}
                                    style={{ width: "100%", height: "320px", border: "none" }}
                                    allowFullScreen=""
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (SIDEBAR CARDS) */}
                    <div>
                        {/* CARD 1: CHECK-IN CHALLENGE */}
                        <div className="checkin-challenge-card">
                            <span className="client-hero-subtitle" style={{ fontSize: "0.75rem", marginBottom: "2px" }}>CHECK-IN CHALLENGE</span>
                            <h4 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                                Xác thực chuyến đi của bạn
                            </h4>
                            <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: "1.4" }}>
                                Tải ảnh bạn tự chụp tại đây. AI so khớp với địa danh và ghi nhận huy hiệu vào hồ sơ.
                            </p>

                            {checkinError && (
                                <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", color: "#b91c1c", borderRadius: "10px", fontSize: "0.82rem", margin: "12px 0" }}>
                                    {checkinError}
                                </div>
                            )}

                            {isCheckingIn ? (
                                <div style={{ padding: "32px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", color: "#009080", background: "#f0fdf9", borderRadius: "14px", margin: "14px 0" }}>
                                    <Loader2 size={28} className="spin-icon" />
                                    <span style={{ fontSize: "0.86rem", fontWeight: 600 }}>Đang ghi nhận check-in và đồng bộ thành tích...</span>
                                </div>
                            ) : checkinSuccess ? (
                                <div style={{ padding: "14px", backgroundColor: "#ecfdf5", color: "#047857", borderRadius: "12px", fontSize: "0.85rem", margin: "16px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <CheckCircle2 size={18} />
                                        <strong>{checkinData?.message || "Check-in thành công!"}</strong>
                                    </div>
                                    {checkinData?.new_unlocked && checkinData.new_unlocked.length > 0 && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#b45309", backgroundColor: "#fef3c7", padding: "6px 10px", borderRadius: "8px", fontSize: "0.8rem" }}>
                                            <Trophy size={14} />
                                            <span>Mở khóa danh hiệu mới: <strong>{checkinData.new_unlocked.join(", ")}</strong> 🎉</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setCheckinSuccess(false)}
                                        style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#047857", fontSize: "0.8rem", textDecoration: "underline", cursor: "pointer", padding: 0, marginTop: "4px" }}
                                    >
                                        Check-in thêm địa danh khác
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="checkin-dropzone"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleFileDrop}
                                >
                                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#ccfbf1", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#0d9488", marginBottom: "8px" }}>
                                        <UploadCloud size={20} />
                                    </div>
                                    <strong style={{ display: "block", fontSize: "0.9rem", color: "#0f172a" }}>Kéo & thả ảnh vào đây</strong>
                                    <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>JPG, PNG • tối đa 12 MB</span>

                                    <div style={{ marginTop: "12px" }}>
                                        <label className="btn-client-scan" style={{ display: "inline-flex", padding: "8px 18px", fontSize: "0.84rem", cursor: "pointer" }}>
                                            <span>Chọn ảnh từ thiết bị</span>
                                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={() => handlePerformCheckin()} />
                                        </label>
                                    </div>
                                </div>
                            )}

                            <div className="checkin-stats-box">
                                <div className="checkin-stats-text">
                                    <span className="checkin-stats-label">TIẾN ĐỘ CHECK-IN</span>
                                    <span className="checkin-stats-value">
                                        {checkinData?.total_checkins
                                            ? `${checkinData.total_checkins} lượt tích lũy`
                                            : "Ghi nhận tức thì"}
                                    </span>
                                </div>
                                <span className="badge-tag checkin-badge">Huy hiệu AI</span>
                            </div>
                        </div>

                        {/* CARD 2: LƯU ĐỊA DANH */}
                        <div className="checkin-challenge-card">
                            <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>Lưu địa danh</h4>
                            <p style={{ fontSize: "0.84rem", color: "#64748b", marginBottom: "16px" }}>
                                Thêm vào bộ sưu tập để lên kế hoạch cho chuyến đi miền Trung.
                            </p>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    type="button"
                                    className="btn-pricing-action outline"
                                    style={{ padding: "8px 12px", fontSize: "0.85rem", flex: 1, borderRadius: "14px" }}
                                    onClick={() => setIsFavorite(!isFavorite)}
                                >
                                    ♡ {isFavorite ? "Đã thích" : "Yêu thích"}
                                </button>
                                <Link
                                    to="/dashboard/favorites"
                                    className="btn-client-scan"
                                    style={{ padding: "8px 12px", fontSize: "0.85rem", flex: 1.2, borderRadius: "14px", justifyContent: "center" }}
                                >
                                    Thêm vào hành trình
                                </Link>
                            </div>
                        </div>

                        {/* CARD 3: ĐỊA DANH GẦN ĐÂY */}
                        <div className="checkin-challenge-card">
                            <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
                                Địa danh gần đây
                            </h4>

                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {currentLandmark.nearby.map((item, idx) => (
                                    <div key={idx} className="landmark-nearby-item">
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <img src={item.img} alt={item.name} className="landmark-nearby-thumb" />
                                            <div>
                                                <strong className="nearby-title">{item.name}</strong>
                                                <span style={{ fontSize: "0.78rem", color: "#64748b", display: "block" }}>{item.dist}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="nearby-chevron" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}

export default ClientLandmarks;
