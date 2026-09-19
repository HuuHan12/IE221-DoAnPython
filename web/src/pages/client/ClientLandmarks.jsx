import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    LogIn,
    X,
} from "lucide-react";
import ClientLayout from "../../components/client/ClientLayout";
import { recordCheckinApi } from "../../service/achievementService";
import {
    addFavoriteApi,
    removeFavoriteApi,
    checkIsFavoriteApi,
    fetchPublicPlacesApi,
} from "../../service/favoriteService";
import "../../css/Client.css";

const defaultLandmarksList = [
    {
        id: "e29e8977-61f7-4512-bad9-61d4e8984487",
        name: "Vịnh Hạ Long",
        city: "Quảng Ninh",
        coords: "20.9100° N, 107.1839° E",
        tags: ["Kỳ quan thiên nhiên", "UNESCO", "Miền Bắc"],
        heroImg: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&auto=format&fit=crop",
        address: "Thành phố Hạ Long, Tỉnh Quảng Ninh",
        hours: "06:00 - 19:00 hằng ngày",
        price: "290.000 VNĐ / vé tuyến",
        rating: "4.9 / 5 (38.900 đánh giá)",
        aiConfidence: "96,8%",
        scannedCount: "542",
        desc: "Vịnh Hạ Long là di sản thiên nhiên thế giới UNESCO nổi tiếng với hàng ngàn hòn đảo đá vôi nhấp nhô trên vùng biển xanh ngọc bích kỳ vĩ.\n\nCác hang động kỳ bí như Hang Sửng Sốt, Hang Đầu Gỗ và các đảo hoang sơ như Đảo Ti Tốp thu hút hàng triệu du khách quốc tế mỗi năm.\n\nĐặc trưng địa hình núi đá vôi vươn thẳng từ mặt biển là dấu hiệu nhận dạng trực quan có độ tin cậy cao nhất của mô hình Vision Transformer & GeoCLIP.",
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
    },
    {
        id: "fd5dbe78-112e-403c-b2bb-9c56771b70e5",
        name: "Đại Nội Huế",
        city: "Thừa Thiên Huế",
        coords: "16.4699° N, 107.5786° E",
        tags: ["Di tích lịch sử", "Cố đô", "Miền Trung"],
        heroImg: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&auto=format&fit=crop",
        address: "Đường 23/8, P. Thuận Hòa, TP. Huế",
        hours: "07:00 - 17:30 hằng ngày",
        price: "200.000 VNĐ / vé tham quan",
        rating: "4.8 / 5 (21.300 đánh giá)",
        aiConfidence: "95,4%",
        scannedCount: "420",
        desc: "Đại Nội Huế – Hoàng thành và Tử Cấm thành của triều Nguyễn – là trung tâm chính trị và văn hóa của đất nước suốt hơn một thế kỷ (1802 - 1945).\n\nQuần thể kiến trúc gồm Ngọ Môn, Điện Thái Hòa, Thế Miếu, Hiển Lâm Các mang đậm dấu ấn kiến trúc cung đình phương Đông với sự chuẩn mực về phong thủy và nghệ thuật chạm khắc tinh xảo.\n\nĐây là địa danh tiêu biểu được AI nhận diện chính xác qua hệ thống mái ngói hoàng lưu ly và cổng thành Ngọ Môn đặc trưng.",
        gallery: [
            "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop"
        ],
        mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.1724391218524!2d107.57608827588737!3d16.46995008427181!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a13e5512b9a1%3A0x28dc1249b6aa3b80!2zxJDhuqFpIE7hu5lpIEh14bq_!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s",
        nearby: [
            { name: "Chùa Thiên Mụ", dist: "Cách 5.2 km", img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=150&auto=format&fit=crop" },
            { name: "Cầu Tràng Tiền", dist: "Cách 1.8 km", img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=150&auto=format&fit=crop" }
        ]
    },
    {
        id: "3b6c9a60-0fc1-4018-a3af-f98d3883cee6",
        name: "Cầu Vàng",
        city: "Đà Nẵng",
        coords: "15.9988° N, 107.9963° E",
        tags: ["Kiến trúc đương đại", "Bà Nà Hills", "Miền Trung"],
        heroImg: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200&auto=format&fit=crop",
        address: "Khu du lịch Sun World Ba Na Hills, Hòa Vang, Đà Nẵng",
        hours: "07:30 - 21:00 hằng ngày",
        price: "Đã bao gồm trong vé cáp treo",
        rating: "4.9 / 5 (45.200 đánh giá)",
        aiConfidence: "98,1%",
        scannedCount: "680",
        desc: "Cầu Vàng Bà Nà Hills là kiệt tác kiến trúc hiện đại nổi tiếng toàn cầu với đôi bàn tay khổng lồ bằng đá rêu phong nâng đỡ dải lụa vàng giữa mây trời đỉnh núi Chúa.\n\nNằm ở độ cao hơn 1.400 m so với mực nước biển, cây cầu mang lại tầm nhìn ngoạn mục bao quát toàn cảnh rừng núi nguyên sinh Bà Nà và vịnh Đà Nẵng xa xa.",
        gallery: [
            "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&auto=format&fit=crop"
        ],
        mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3835.8078335890886!2d107.9937748758784!3d15.99885008466635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141f71f654b7269%3A0xc6ad545bf94a73ec!2zQ-G6p3UgVsOgbmcgQsOgIE7DoA!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s",
        nearby: [
            { name: "Làng Pháp Bà Nà", dist: "Cách 0.5 km", img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=150&auto=format&fit=crop" },
            { name: "Chùa Linh Ứng Bà Nà", dist: "Cách 1.2 km", img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=150&auto=format&fit=crop" }
        ]
    },
    {
        id: "bd4515c1-7dc4-4aa8-a22b-69b16903013e",
        name: "Chùa Một Cột",
        city: "Hà Nội",
        coords: "21.0359° N, 105.8339° E",
        tags: ["Di tích lịch sử", "Thế kỷ 11", "Miền Bắc"],
        heroImg: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop",
        address: "Phố Chùa Một Cột, Đội Cấn, Ba Đình, Hà Nội",
        hours: "07:00 - 18:00 hằng ngày",
        price: "Miễn phí tham quan",
        rating: "4.7 / 5 (18.600 đánh giá)",
        aiConfidence: "94,6%",
        scannedCount: "350",
        desc: "Chùa Một Cột (Diên Hựu Tự) được xây dựng từ năm 1049 dưới triều vua Lý Thái Tông. Công trình có kiến trúc độc nhất vô nhị tựa như một đóa hoa sen thanh khiết vươn lên từ mặt hồ Linh Chiểu.\n\nToàn bộ ngôi chùa gỗ đặt trên một cột đá tròn duy nhất đường kính 1.2 m, tạo nên nét biểu tượng ngàn năm văn hiến của thủ đô Hà Nội.",
        gallery: [
            "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&auto=format&fit=crop"
        ],
        mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.923485773822!2d105.83136907598285!3d21.03588908754161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135aba6a7e0a811%3A0xc3b7eaeb6d5b0be6!2zQ2jDuWEgTeG7mXQgQ-G7mXQ!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s",
        nearby: [
            { name: "Lăng Chủ tịch Hồ Chí Minh", dist: "Cách 0.2 km", img: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=150&auto=format&fit=crop" },
            { name: "Hoàng thành Thăng Long", dist: "Cách 1.0 km", img: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=150&auto=format&fit=crop" }
        ]
    },
    {
        id: "3d9e438d-86f0-458a-a8d5-71417032ee00",
        name: "Dinh Độc Lập",
        city: "TP. Hồ Chí Minh",
        coords: "10.7770° N, 106.6954° E",
        tags: ["Di tích lịch sử đặc biệt", "Miền Nam"],
        heroImg: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop",
        address: "135 Nam Kỳ Khởi Nghĩa, P. Bến Thành, Quận 1, TP.HCM",
        hours: "08:00 - 16:30 hằng ngày",
        price: "65.000 VNĐ / vé người lớn",
        rating: "4.8 / 5 (32.100 đánh giá)",
        aiConfidence: "97,2%",
        scannedCount: "510",
        desc: "Dinh Độc Lập (Hội trường Thống Nhất) là di tích lịch sử quốc gia đặc biệt, nơi đánh dấu mốc son toàn thắng của chiến dịch Hồ Chí Minh lịch sử trưa ngày 30/4/1975.\n\nCông trình do kiến trúc sư Ngô Viết Thụ thiết kế kết hợp triết lý phong thủy phương Đông và ngôn ngữ kiến trúc hiện đại, với mặt bằng hình chữ CÁT (吉) mang ý nghĩa may mắn.",
        gallery: [
            "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1528127269322-539801943592?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop"
        ],
        mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.460678857417!2d106.69280507579998!3d10.77699908937172!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded570376890!2zRGluaCDEkOG7mWMgTOG6rXA!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s",
        nearby: [
            { name: "Nhà thờ Đức Bà", dist: "Cách 0.5 km", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=150&auto=format&fit=crop" },
            { name: "Chợ Bến Thành", dist: "Cách 0.8 km", img: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=150&auto=format&fit=crop" }
        ]
    }
];

function ClientLandmarks() {
    const navigate = useNavigate();
    const [landmarksList, setLandmarksList] = useState(defaultLandmarksList);
    const [selectedLandmarkId, setSelectedLandmarkId] = useState(defaultLandmarksList[0].id);
    const [activeTab, setActiveTab] = useState("gioi-thieu");

    // Quản lý trạng thái Yêu thích thực tế kết nối Supabase
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [isFavLoading, setIsFavLoading] = useState(false);
    const [favNotice, setFavNotice] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Quản lý check-in
    const [checkinSuccess, setCheckinSuccess] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkinData, setCheckinData] = useState(null);
    const [checkinError, setCheckinError] = useState(null);

    // Đồng bộ trạng thái yêu thích mỗi khi chuyển địa danh
    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem("access_token");

        if (!token) {
            setIsFavorite(false);
            setFavoriteId(null);
            return;
        }

        async function syncFavoriteState() {
            try {
                const res = await checkIsFavoriteApi(selectedLandmarkId);
                if (isMounted) {
                    setIsFavorite(Boolean(res.is_favorite));
                    setFavoriteId(res.favorite_id || null);
                }
            } catch {
                if (isMounted) {
                    setIsFavorite(false);
                    setFavoriteId(null);
                }
            }
        }

        syncFavoriteState();
        return () => {
            isMounted = false;
        };
    }, [selectedLandmarkId]);

    const currentLandmark =
        landmarksList.find((l) => l.id === selectedLandmarkId) || landmarksList[0];

    // Xử lý bật/tắt yêu thích thực tế
    const handleToggleFavorite = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            setShowAuthModal(true);
            return;
        }

        setIsFavLoading(true);
        try {
            if (isFavorite) {
                // Xóa khỏi yêu thích
                await removeFavoriteApi(favoriteId || selectedLandmarkId);
                setIsFavorite(false);
                setFavoriteId(null);
                setFavNotice("Đã xóa khỏi danh sách yêu thích");
            } else {
                // Thêm vào yêu thích
                const res = await addFavoriteApi(selectedLandmarkId);
                setIsFavorite(true);
                setFavoriteId(res.id || null);
                setFavNotice(`Đã lưu "${currentLandmark.name}" vào danh sách yêu thích!`);
            }
        } catch (err) {
            setFavNotice(err.message || "Không thể cập nhật danh sách yêu thích.");
        } finally {
            setIsFavLoading(false);
            setTimeout(() => setFavNotice(null), 3500);
        }
    };

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
                                    className={`btn-hero-action ${isFavorite ? "active-favorite" : ""}`}
                                    onClick={handleToggleFavorite}
                                    disabled={isFavLoading}
                                    style={{
                                        backgroundColor: isFavorite ? "#ef4444" : "rgba(255, 255, 255, 0.2)",
                                        borderColor: isFavorite ? "#ef4444" : "rgba(255, 255, 255, 0.4)",
                                        color: "#ffffff",
                                        transition: "all 0.2s ease",
                                    }}
                                    title={isFavorite ? "Bỏ yêu thích" : "Lưu vào địa điểm yêu thích"}
                                >
                                    {isFavLoading ? (
                                        <Loader2 size={15} className="spin-icon" />
                                    ) : (
                                        <Heart size={15} fill={isFavorite ? "#ffffff" : "none"} color="#ffffff" />
                                    )}
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
                                Thêm vào bộ sưu tập để đồng bộ và lên kế hoạch tham quan trên bản đồ cá nhân.
                            </p>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    type="button"
                                    className="btn-pricing-action outline"
                                    style={{
                                        padding: "8px 12px",
                                        fontSize: "0.85rem",
                                        flex: 1,
                                        borderRadius: "14px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px",
                                        backgroundColor: isFavorite ? "#fef2f2" : "#ffffff",
                                        borderColor: isFavorite ? "#fca5a5" : "#e2e8f0",
                                        color: isFavorite ? "#ef4444" : "#0f172a",
                                        fontWeight: isFavorite ? "700" : "500",
                                        cursor: isFavLoading ? "not-allowed" : "pointer",
                                    }}
                                    onClick={handleToggleFavorite}
                                    disabled={isFavLoading}
                                >
                                    {isFavLoading ? (
                                        <Loader2 size={15} className="spin-icon" />
                                    ) : (
                                        <Heart size={15} fill={isFavorite ? "#ef4444" : "none"} color={isFavorite ? "#ef4444" : "#64748b"} />
                                    )}
                                    <span>{isFavorite ? "Đã thích" : "Yêu thích"}</span>
                                </button>
                                <Link
                                    to="/dashboard/favorites"
                                    className="btn-client-scan"
                                    style={{ padding: "8px 12px", fontSize: "0.85rem", flex: 1.2, borderRadius: "14px", justifyContent: "center" }}
                                >
                                    Xem bộ sưu tập
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

            {/* FLOATING TOAST NOTIFICATION */}
            {favNotice && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "28px",
                        right: "28px",
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        padding: "12px 20px",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        zIndex: 9999,
                        fontSize: "0.9rem",
                    }}
                >
                    <Sparkles size={16} color="#2dd4bf" />
                    <span>{favNotice}</span>
                </div>
            )}

            {/* MODAL NHẮC ĐĂNG NHẬP KHI KHÁCH BẤM YÊU THÍCH */}
            {showAuthModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10000,
                        padding: "16px",
                    }}
                    onClick={() => setShowAuthModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "20px",
                            maxWidth: "420px",
                            width: "100%",
                            padding: "28px",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                            position: "relative",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowAuthModal(false)}
                            style={{
                                position: "absolute",
                                top: "16px",
                                right: "16px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#94a3b8",
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ textAlign: "center", marginBottom: "20px" }}>
                            <div
                                style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fee2e2",
                                    color: "#ef4444",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: "12px",
                                }}
                            >
                                <Heart size={28} fill="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                                Lưu vào Yêu thích
                            </h3>
                            <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: "1.5" }}>
                                Vui lòng đăng nhập để lưu <strong>{currentLandmark.name}</strong> vào danh sách yêu thích và quản lý trên bản đồ cá nhân của bạn.
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                type="button"
                                style={{
                                    flex: 1,
                                    padding: "10px",
                                    borderRadius: "12px",
                                    border: "1px solid #e2e8f0",
                                    background: "#f8fafc",
                                    color: "#475569",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                                onClick={() => setShowAuthModal(false)}
                            >
                                Để sau
                            </button>
                            <Link
                                to="/login"
                                style={{
                                    flex: 1.4,
                                    padding: "10px",
                                    borderRadius: "12px",
                                    background: "#009080",
                                    color: "#ffffff",
                                    fontWeight: "600",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    textDecoration: "none",
                                }}
                            >
                                <LogIn size={16} />
                                <span>Đăng nhập ngay</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}

export default ClientLandmarks;

