import { useState, useRef, useEffect } from "react";
import { Heart, SlidersHorizontal, Lightbulb, ChevronDown, Check } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FavoriteCard from "../components/favorites/FavoriteCard";
import VietnamInteractiveMap from "../components/favorites/VietnamInteractiveMap";
import ConfirmDeleteModal from "../components/gallery/ConfirmDeleteModal";
import "../css/Favorites.css";

const initialFavoriteLandmarks = [
    {
        id: 1,
        name: "Vịnh Hạ Long",
        province: "Quảng Ninh",
        shortName: "Hạ Long",
        url: "/images/landmarks/ha-long.jpg",
        coords: { lat: 20.9500, lng: 107.0833 },
        note: "Vịnh Hạ Long"
    },
    {
        id: 2,
        name: "Phố cổ Hội An",
        province: "Quảng Nam",
        shortName: "Hội An",
        url: "/images/landmarks/hoi-an.jpg",
        coords: { lat: 15.8801, lng: 108.3380 },
        note: "Phố cổ Hội An"
    },
    {
        id: 3,
        name: "Hồ Hoàn Kiếm",
        province: "Hà Nội",
        shortName: "Hà Nội",
        url: "/images/landmarks/ho-guom.jpg",
        coords: { lat: 21.0285, lng: 105.8542 },
        note: "Hồ Hoàn Kiếm"
    },
    {
        id: 4,
        name: "Bà Nà Hills",
        province: "Đà Nẵng",
        shortName: "Đà Nẵng",
        url: "/images/landmarks/ba-na-hills.jpg",
        coords: { lat: 15.9988, lng: 107.9880 },
        note: "Bà Nà Hills"
    },
    {
        id: 5,
        name: "Nha Trang",
        province: "Khánh Hòa",
        shortName: "Nha Trang",
        url: "/images/landmarks/nha-trang.jpg",
        coords: { lat: 12.2388, lng: 109.1967 },
        note: "Nha Trang"
    },
    {
        id: 6,
        name: "Đà Lạt",
        province: "Lâm Đồng",
        shortName: "Đà Lạt",
        url: "/images/landmarks/da-lat.jpg",
        coords: { lat: 11.9404, lng: 108.4583 },
        note: "Đà Lạt"
    }
];

function Favorites() {
    const [landmarks, setLandmarks] = useState(initialFavoriteLandmarks);
    const [selectedMapLandmark, setSelectedMapLandmark] = useState(null);
    const [sortMode, setSortMode] = useState("Mới nhất");
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const sortDropdownRef = useRef(null);

    // Close sort menu on click outside
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

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setLandmarks((prev) => prev.filter((item) => item.id !== itemToDelete.id));
            if (selectedMapLandmark?.id === itemToDelete.id) {
                setSelectedMapLandmark(null);
            }
            setItemToDelete(null);
        }
    };

    const handleSortChange = (mode) => {
        setSortMode(mode);
        setIsSortOpen(false);

        const sorted = [...landmarks];
        if (mode === "Theo tên A-Z") {
            sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        } else if (mode === "Theo tỉnh/thành") {
            sorted.sort((a, b) => a.province.localeCompare(b.province, "vi"));
        } else {
            // Mới nhất (id desc or initial order)
            sorted.sort((a, b) => a.id - b.id);
        }
        setLandmarks(sorted);
    };

    return (
        <div className="favorites-page-container">
            <Sidebar activeMenu="favorites" />
            <div className="favorites-main-content">
                <Header
                    title="Địa danh Yêu thích"
                    subtitle="Bộ sưu tập những địa danh bạn yêu thích"
                />

                <main className="favorites-body-padding">
                    <div className="favorites-two-columns-layout">
                        {/* Left Column: Cards Grid */}
                        <div className="favorites-left-grid-container">
                            <div className="favorites-sub-bar">
                                <span className="favorites-count-title">
                                    {landmarks.length} địa danh
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

                            {/* 3 columns x 2 rows Grid */}
                            <div className="favorites-cards-3grid">
                                {landmarks.map((item) => (
                                    <FavoriteCard
                                        key={item.id}
                                        landmark={item}
                                        onSelectOnMap={handleSelectOnMap}
                                        onDelete={handleDeleteClick}
                                        isSelectedOnMap={selectedMapLandmark?.id === item.id}
                                    />
                                ))}
                            </div>

                            {landmarks.length === 0 && (
                                <div className="favorites-empty-state">
                                    <Heart size={48} color="#9CA3AF" />
                                    <p>Chưa có địa danh nào trong danh sách yêu thích</p>
                                </div>
                            )}

                            {/* Bottom Drag Hint */}
                            <div className="drag-hint-footer">
                                <Lightbulb size={16} color="#F59E0B" />
                                <span>Nhấn và giữ để kéo thả thay đổi thứ tự</span>
                            </div>
                        </div>

                        {/* Right Column: Interactive Vietnam Map */}
                        <div className="favorites-right-map-container">
                            <VietnamInteractiveMap
                                landmarks={landmarks}
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
                photo={itemToDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setItemToDelete(null)}
            />
        </div>
    );
}

export default Favorites;
