import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Sparkles, Compass, Eye } from "lucide-react";
import ClientLayout from "../../components/client/ClientLayout";
import "../../css/Client.css";

const landmarksData = [
    {
        id: 1,
        name: "Vịnh Hạ Long",
        region: "Miền Bắc",
        province: "Quảng Ninh",
        image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop",
        desc: "Kỳ quan thiên nhiên thế giới với hàng ngàn đảo đá vôi nhấp nhô trên làn nước biển xanh ngọc.",
        coords: "20.9500° N, 107.0833° E"
    },
    {
        id: 2,
        name: "Phố cổ Hội An",
        region: "Miền Trung",
        province: "Quảng Nam",
        image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop",
        desc: "Di sản văn hóa thế giới UNESCO với kiến trúc nhà cổ màu vàng đặc trưng và phố đèn lồng sông Hoài.",
        coords: "15.8801° N, 108.3380° E"
    },
    {
        id: 3,
        name: "Hồ Hoàn Kiếm",
        region: "Miền Bắc",
        province: "Hà Nội",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop",
        desc: "Trái tim của thủ đô Hà Nội, gắn liền với truyền thuyết Tháp Rùa và cầu Thê Húc đỏ son.",
        coords: "21.0285° N, 105.8542° E"
    },
    {
        id: 4,
        name: "Chùa Thiên Mụ",
        region: "Miền Trung",
        province: "Thừa Thiên Huế",
        image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop",
        desc: "Ngôi chùa cổ kính 400 năm tuổi với tháp Phước Duyên 7 tầng soi bóng xuống dòng sông Hương.",
        coords: "16.4533° N, 107.5458° E"
    },
    {
        id: 5,
        name: "Bà Nà Hills",
        region: "Miền Trung",
        province: "Đà Nẵng",
        image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop",
        desc: "Nổi tiếng với Cầu Vàng bàn tay khổng lồ giữa mây trời và làng Pháp thơ mộng trên đỉnh núi.",
        coords: "15.9988° N, 107.9880° E"
    },
    {
        id: 6,
        name: "Ruộng Bậc Thang Sa Pa",
        region: "Miền Bắc",
        province: "Lào Cai",
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop",
        desc: "Tuyệt tác nông nghiệp kỳ vĩ của đồng bào các dân tộc thiểu số vùng cao Tây Bắc.",
        coords: "22.3364° N, 103.8438° E"
    }
];

function ClientLandmarks() {
    const [selectedRegion, setSelectedRegion] = useState("Tất cả");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLandmark, setSelectedLandmark] = useState(null);

    const regions = ["Tất cả", "Miền Bắc", "Miền Trung", "Miền Nam"];

    const filtered = landmarksData.filter((item) => {
        const matchesRegion = selectedRegion === "Tất cả" || item.region === selectedRegion;
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.province.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRegion && matchesSearch;
    });

    return (
        <ClientLayout activeTab="landmarks">
            <section className="client-hero-section">
                <span className="client-hero-subtitle">DANH MỤC ĐỊA DANH VIỆT NAM</span>
                <div className="client-hero-header-row">
                    <div className="client-hero-left">
                        <h1 className="client-hero-title">
                            Khám phá <span className="highlight-text">địa danh</span> Việt Nam qua góc nhìn AI
                        </h1>
                    </div>

                    <div className="client-search-box">
                        <Search size={18} className="client-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm tên địa danh, tỉnh thành..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="client-search-input"
                        />
                    </div>
                </div>

                <div className="client-category-filters">
                    {regions.map((reg) => (
                        <button
                            key={reg}
                            type="button"
                            className={`category-pill ${selectedRegion === reg ? "active" : ""}`}
                            onClick={() => setSelectedRegion(reg)}
                        >
                            {reg}
                        </button>
                    ))}
                </div>
            </section>

            <div className="articles-grid" style={{ marginTop: "32px" }}>
                {filtered.map((item) => (
                    <div
                        key={item.id}
                        className="article-card"
                        onClick={() => setSelectedLandmark(item)}
                    >
                        <div className="article-image-box">
                            <img src={item.image} alt={item.name} />
                            <span className="article-category-badge">{item.region}</span>
                        </div>
                        <div className="article-body">
                            <h4 className="article-title">{item.name}</h4>
                            <p className="article-excerpt">{item.desc}</p>
                            <div className="article-meta-footer">
                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <MapPin size={14} color="#0d9488" /> {item.province}
                                </span>
                                <span style={{ color: "#0d9488", fontWeight: "600" }}>Chi tiết →</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedLandmark && (
                <div className="article-modal-backdrop" onClick={() => setSelectedLandmark(null)}>
                    <div className="article-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="article-modal-close"
                            onClick={() => setSelectedLandmark(null)}
                        >
                            ✕
                        </button>
                        <div className="featured-badge-row">
                            <span className="badge-tag">{selectedLandmark.region}</span>
                            <span className="read-time">{selectedLandmark.province}</span>
                        </div>
                        <h2 className="featured-title" style={{ marginTop: "8px" }}>
                            {selectedLandmark.name}
                        </h2>
                        <p style={{ color: "#64748b", marginBottom: "16px" }}>
                            📍 Tọa độ GPS: <strong>{selectedLandmark.coords}</strong>
                        </p>
                        <img
                            src={selectedLandmark.image}
                            alt={selectedLandmark.name}
                            style={{
                                width: "100%",
                                maxHeight: "360px",
                                objectFit: "cover",
                                borderRadius: "16px",
                                marginBottom: "20px"
                            }}
                        />
                        <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "#334155" }}>
                            {selectedLandmark.desc}
                        </p>

                        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
                            <Link to="/dashboard" className="btn-client-scan" style={{ borderRadius: "12px" }}>
                                <Sparkles size={16} /> Thử nhận diện ảnh này trên AI
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}

export default ClientLandmarks;
