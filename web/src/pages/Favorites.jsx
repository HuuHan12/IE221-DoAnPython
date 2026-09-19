import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, SlidersHorizontal, Lightbulb, ChevronDown, Check, Loader2, Sparkles, Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FavoriteCard from "../components/favorites/FavoriteCard";
import VietnamInteractiveMap from "../components/favorites/VietnamInteractiveMap";
import ConfirmDeleteModal from "../components/gallery/ConfirmDeleteModal";
import { fetchFavoritesApi, removeFavoriteApi } from "../service/favoriteService";
import "../css/Favorites.css";

function Favorites() {
    const [landmarks, setLandmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMapLandmark, setSelectedMapLandmark] = useState(null);
    const [sortMode, setSortMode] = useState("Mới nhất");
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [provinceFilter, setProvinceFilter] = useState("Tất cả");

    const sortDropdownRef = useRef(null);

    // Tải danh sách địa điểm yêu thích thực tế từ Database theo user_id
    const loadFavorites = useCallback(async (isMountedRef = { current: true }) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchFavoritesApi();
            if (isMountedRef.current) {
                setLandmarks(data.items || []);
            }
        } catch (err) {
            // Thử lại 1 lần nếu có trục trặc mạng tạm thời
            try {
                await new Promise((resolve) => setTimeout(resolve, 500));
                if (!isMountedRef.current) return;
                const retryData = await fetchFavoritesApi();
                if (isMountedRef.current) {
                    setLandmarks(retryData.items || []);
                    return;
                }
            } catch (retryErr) {
                if (isMountedRef.current) {
                    console.warn("Lỗi tải địa điểm yêu thích:", retryErr);
                    let msg = retryErr?.message || err?.message || "Không thể tải danh sách địa điểm yêu thích.";
                    if (typeof msg === "string" && (msg.includes("WinError") || msg.includes("socket") || msg.includes("non-blocking") || msg.includes("Failed to fetch") || msg.includes("NetworkError"))) {
                        msg = "Kết nối máy chủ tạm thời bị gián đoạn. Vui lòng bấm 'Thử lại'.";
                    }
                    msg = msg.replace(/^\[?⚠️?\s*(Lỗi khi tải danh sách địa điểm yêu thích:\s*)*/i, "").replace(/\]+$/, "").trim();
                    if (!msg) {
                        msg = "Không thể tải danh sách địa điểm yêu thích. Vui lòng thử lại.";
                    }
                    setError(msg);
                    setLandmarks([]);
                }
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const isMountedRef = { current: true };
        loadFavorites(isMountedRef);
        return () => {
            isMountedRef.current = false;
        };
    }, [loadFavorites]);

    // Đóng sort popup khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectOnMap = (landmark) => {
        setSelectedMapLandmark(landmark);
    };

    const handleDeleteClick = (landmark) => {
        setItemToDelete(landmark);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete || isDeleting) return;

        setIsDeleting(true);
        try {
            const targetId = itemToDelete.place_id || itemToDelete.id;
            await removeFavoriteApi(targetId);

            setLandmarks((prev) =>
                prev.filter((item) => item.id !== itemToDelete.id && item.place_id !== targetId)
            );
            if (selectedMapLandmark?.id === itemToDelete.id || selectedMapLandmark?.place_id === targetId) {
                setSelectedMapLandmark(null);
            }
            setItemToDelete(null);
        } catch (err) {
            alert(err.message || "Không thể xóa địa danh khỏi yêu thích.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSortChange = (mode) => {
        setSortMode(mode);
        setIsSortOpen(false);

        const sorted = [...landmarks];
        if (mode === "Theo tên A-Z") {
            sorted.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi"));
        } else if (mode === "Theo tỉnh/thành") {
            sorted.sort((a, b) => (a.province || "").localeCompare(b.province || "", "vi"));
        } else {
            // Mới nhất (created_at desc)
            sorted.sort((a, b) => {
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                return 0;
            });
        }
        setLandmarks(sorted);
    };

    const provincesList = useMemo(() => {
        const set = new Set(landmarks.map((l) => l.province).filter(Boolean));
        return ["Tất cả", ...Array.from(set)];
    }, [landmarks]);

    const filteredLandmarks = useMemo(() => {
        return landmarks.filter((item) => {
            const q = searchQuery.trim().toLowerCase();
            const matchesSearch =
                !q ||
                item.name?.toLowerCase().includes(q) ||
                item.province?.toLowerCase().includes(q) ||
                (item.description && item.description.toLowerCase().includes(q));
            const matchesProvince =
                provinceFilter === "Tất cả" || item.province === provinceFilter;
            return matchesSearch && matchesProvince;
        });
    }, [landmarks, searchQuery, provinceFilter]);

    return (
        <div className="favorites-page-container">
            <Sidebar activeMenu="favorites" />
            <div className="favorites-main-content">
                <Header
                    title="Địa danh Yêu thích"
                    subtitle="Bộ sưu tập những địa danh bạn đã lưu lại và yêu thích"
                />

                <main className="favorites-body-padding">
                    {error && (
                        <div style={{
                            backgroundColor: "#FEF2F2",
                            border: "1px solid #FCA5A5",
                            color: "#B91C1C",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            marginBottom: "16px",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button
                                    type="button"
                                    onClick={loadFavorites}
                                    style={{
                                        background: "#B91C1C",
                                        color: "#FFFFFF",
                                        border: "none",
                                        padding: "6px 14px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                    }}
                                >
                                    Thử lại
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setError(null)}
                                    title="Đóng thông báo"
                                    style={{
                                        background: "transparent",
                                        color: "#9CA3AF",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        lineHeight: 1,
                                        padding: "0 4px"
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="favorites-two-columns-layout">
                        {/* Left Column: Cards Grid */}
                        <div className="favorites-left-grid-container">
                            <div className="favorites-sub-bar" style={{ flexWrap: "wrap", gap: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px" }}>
                                    {/* Ô tìm kiếm */}
                                    <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
                                        <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                        <input
                                            type="text"
                                            placeholder="Tìm địa danh, tỉnh thành..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{
                                                width: "100%",
                                                padding: "7px 10px 7px 32px",
                                                borderRadius: "8px",
                                                border: "1px solid #cbd5e1",
                                                fontSize: "0.84rem",
                                                outline: "none",
                                                backgroundColor: "#ffffff",
                                            }}
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery("")}
                                                style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: "12px" }}
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>

                                    {/* Lọc theo tỉnh thành */}
                                    {provincesList.length > 2 && (
                                        <select
                                            value={provinceFilter}
                                            onChange={(e) => setProvinceFilter(e.target.value)}
                                            style={{
                                                padding: "7px 12px",
                                                borderRadius: "8px",
                                                border: "1px solid #cbd5e1",
                                                fontSize: "0.84rem",
                                                backgroundColor: "#ffffff",
                                                color: "#334155",
                                                outline: "none",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {provincesList.map((p) => (
                                                <option key={p} value={p}>
                                                    {p === "Tất cả" ? "Tất cả tỉnh thành" : `📍 ${p}`}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span className="favorites-count-title">
                                        {filteredLandmarks.length}{searchQuery || provinceFilter !== "Tất cả" ? ` / ${landmarks.length}` : ""} địa danh
                                    </span>

                                    <div className="sort-dropdown-container" ref={sortDropdownRef}>
                                        <button
                                            type="button"
                                            className={`btn-sort-dropdown ${isSortOpen ? "active" : ""}`}
                                            onClick={() => setIsSortOpen(!isSortOpen)}
                                        >
                                            <SlidersHorizontal size={14} />
                                            <span>Sắp xếp: {sortMode}</span>
                                            <ChevronDown size={14} className={`chevron-icon ${isSortOpen ? "rotate" : ""}`} />
                                        </button>

                                        {isSortOpen && (
                                            <div className="sort-menu-popup">
                                                {["Mới nhất", "Theo tên A-Z", "Theo tỉnh/thành"].map((mode) => (
                                                    <div
                                                        key={mode}
                                                        className={`sort-menu-item ${sortMode === mode ? "selected" : ""}`}
                                                        onClick={() => handleSortChange(mode)}
                                                    >
                                                        <span>{mode}</span>
                                                        {sortMode === mode && <Check size={16} color="#009080" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading ? (
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: "320px",
                                    gap: "12px",
                                    color: "#64748B"
                                }}>
                                    <Loader2 size={32} className="spin-icon" style={{ color: "#009080", animation: "spin 1s linear infinite" }} />
                                    <span style={{ fontSize: "14px", fontWeight: 500 }}>Đang tải danh sách địa danh yêu thích của bạn...</span>
                                </div>
                            ) : filteredLandmarks.length > 0 ? (
                                /* 3 columns Grid of Favorite Cards */
                                <div className="favorites-cards-3grid">
                                    {filteredLandmarks.map((item) => (
                                        <FavoriteCard
                                            key={item.id}
                                            landmark={item}
                                            onSelectOnMap={handleSelectOnMap}
                                            onDelete={handleDeleteClick}
                                            isSelectedOnMap={selectedMapLandmark?.id === item.id}
                                        />
                                    ))}
                                </div>
                            ) : landmarks.length > 0 ? (
                                /* No search results */
                                <div style={{
                                    padding: "48px 20px",
                                    textAlign: "center",
                                    backgroundColor: "#ffffff",
                                    borderRadius: "14px",
                                    border: "1px dashed #cbd5e1",
                                    color: "#64748b",
                                }}>
                                    <Search size={32} style={{ color: "#94a3b8", marginBottom: "8px" }} />
                                    <p style={{ margin: 0, fontWeight: 500 }}>Không tìm thấy địa danh nào khớp với bộ lọc</p>
                                    <button
                                        type="button"
                                        onClick={() => { setSearchQuery(""); setProvinceFilter("Tất cả"); }}
                                        style={{ marginTop: "12px", background: "none", border: "none", color: "#009080", cursor: "pointer", textDecoration: "underline", fontSize: "0.85rem" }}
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            ) : (
                                /* Clean Empty State */
                                <div className="favorites-empty-state" style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "60px 20px",
                                    textAlign: "center",
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: "16px",
                                    border: "1px dashed #CBD5E1",
                                    gap: "12px"
                                }}>
                                    <div style={{
                                        width: "64px",
                                        height: "64px",
                                        borderRadius: "50%",
                                        backgroundColor: "#FEE2E2",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#EF4444"
                                    }}>
                                        <Heart size={32} />
                                    </div>
                                    <h3 style={{ margin: "4px 0", fontSize: "16px", fontWeight: 700, color: "#1E293B" }}>
                                        Chưa có địa điểm yêu thích
                                    </h3>
                                    <p style={{ margin: 0, fontSize: "13.5px", color: "#64748B", maxWidth: "360px", lineHeight: 1.5 }}>
                                        Bạn chưa lưu địa danh nào. Hãy quét ảnh địa danh hoặc khám phá các danh lam thắng cảnh để lưu vào bộ sưu tập cá nhân!
                                    </p>
                                    <Link
                                        to="/dashboard/scan"
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            marginTop: "8px",
                                            backgroundColor: "#009080",
                                            color: "#FFFFFF",
                                            textDecoration: "none",
                                            padding: "9px 20px",
                                            borderRadius: "10px",
                                            fontSize: "13.5px",
                                            fontWeight: 600,
                                            boxShadow: "0 2px 6px rgba(0, 144, 128, 0.25)"
                                        }}
                                    >
                                        <Sparkles size={16} />
                                        <span>Khám phá ngay</span>
                                    </Link>
                                </div>
                            )}

                            {/* Bottom Hint */}
                            {landmarks.length > 0 && (
                                <div className="drag-hint-footer">
                                    <Lightbulb size={16} color="#F59E0B" />
                                    <span>Chọn địa danh để xem vị trí chi tiết trên bản đồ tương tác</span>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Interactive Vietnam Map */}
                        <div className="favorites-right-map-container">
                            <VietnamInteractiveMap
                                landmarks={filteredLandmarks}
                                activeLandmark={selectedMapLandmark}
                                onSelectLandmark={handleSelectOnMap}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* Custom Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={Boolean(itemToDelete)}
                photo={itemToDelete ? { ...itemToDelete, note: itemToDelete.name } : null}
                pending={isDeleting}
                onConfirm={handleConfirmDelete}
                onCancel={() => setItemToDelete(null)}
            />
        </div>
    );
}

export default Favorites;
