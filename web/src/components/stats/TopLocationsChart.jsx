import React, { useState, useRef, useEffect } from "react";
import { Info, ChevronDown, MapPin, Check, Search } from "lucide-react";

const initialLocationsData = [
    { id: 1, name: "Nhà Thờ Lớn Hà Nội", count: 4568 },
    { id: 2, name: "Văn Miếu - Quốc Tử Giám", count: 3789 },
    { id: 3, name: "Chợ Bến Thành", count: 3456 },
    { id: 4, name: "Phố Cổ Hội An", count: 3102 },
    { id: 5, name: "Hoàng Thành Thăng Long", count: 2845 },
    { id: 6, name: "Cầu Vàng - Bà Nà Hills", count: 2615 },
    { id: 7, name: "Tháp Rùa", count: 2341 },
    { id: 8, name: "Dinh Độc Lập", count: 2104 },
    { id: 9, name: "Chùa Một Cột", count: 1978 },
    { id: 10, name: "Bảo Tàng Chứng Tích Chiến Tranh", count: 1732 },
];

const MAX_COUNT = 5000;

function TopLocationsChart({ apiLocationsData }) {
    const [selectedLandmark, setSelectedLandmark] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);

    const locationsData =
        apiLocationsData && apiLocationsData.length > 0
            ? apiLocationsData.map((item, idx) => ({
                id: idx + 1,
                name: item.name || "Địa danh",
                count: item.count || 100
            }))
            : initialLocationsData;

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectLandmark = (item) => {
        setSelectedLandmark(item);
        setIsOpen(false);
    };

    const handleResetAll = () => {
        setSelectedLandmark(null);
        setIsOpen(false);
    };

    const filteredMenuLocations = locationsData.filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const buttonLabel = selectedLandmark
        ? selectedLandmark.name
        : "Theo lượt tìm kiếm";

    return (
        <div className="chart-card-section half-width">
            <div className="chart-card-header">
                <div className="chart-title-with-info">
                    <h3>Top 10 địa điểm được tìm kiếm nhiều nhất</h3>
                    <Info size={16} className="info-icon" title="Thống kê top 10 địa danh được quét nhiều nhất" />
                </div>

                <div className="chart-filter-dropdown-wrapper" ref={dropdownRef}>
                    <button
                        type="button"
                        className={`chart-filter-dropdown ${isOpen || selectedLandmark ? "active" : ""}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className="dropdown-label-text">{buttonLabel}</span>
                        <ChevronDown size={16} className={`chevron-icon ${isOpen ? "rotate" : ""}`} />
                    </button>

                    {isOpen && (
                        <div className="chart-filter-menu-popup location-menu-popup">
                            <div className="menu-search-box">
                                <Search size={14} color="#9CA3AF" />
                                <input
                                    type="text"
                                    placeholder="Tìm địa điểm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="preset-options-list scrollable-locations-list">
                                <div
                                    className={`preset-option-item ${!selectedLandmark ? "selected" : ""}`}
                                    onClick={handleResetAll}
                                >
                                    <span>Tất cả (Theo lượt tìm kiếm)</span>
                                    {!selectedLandmark && <Check size={16} color="#009080" />}
                                </div>

                                <div className="dropdown-divider-line"></div>

                                {filteredMenuLocations.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`preset-option-item ${
                                            selectedLandmark?.id === item.id ? "selected" : ""
                                        }`}
                                        onClick={() => handleSelectLandmark(item)}
                                    >
                                        <div className="menu-landmark-info">
                                            <MapPin size={14} className="pin-icon" />
                                            <span className="menu-landmark-name">{item.name}</span>
                                        </div>
                                        <span className="menu-landmark-count">
                                            {item.count.toLocaleString("vi-VN")}
                                        </span>
                                    </div>
                                ))}

                                {filteredMenuLocations.length === 0 && (
                                    <div className="no-result-text">Không tìm thấy địa điểm</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="top-locations-list">
                {locationsData.map((item) => {
                    const barWidthPercent = Math.min(100, (item.count / MAX_COUNT) * 100);
                    const isSelected = selectedLandmark?.id === item.id;

                    return (
                        <div
                            key={item.id}
                            className={`location-bar-row ${isSelected ? "highlighted-row" : ""}`}
                            onClick={() => setSelectedLandmark(item)}
                            title="Click để chọn xem địa điểm"
                        >
                            <span className="location-name">
                                {isSelected && <MapPin size={14} color="#009080" style={{ marginRight: 4, display: "inline" }} />}
                                {item.name}
                            </span>
                            <div className="bar-track">
                                <div
                                    className={`bar-fill ${isSelected ? "active-fill" : ""}`}
                                    style={{ width: `${barWidthPercent}%` }}
                                ></div>
                                <span className="bar-count-val">
                                    {item.count.toLocaleString("vi-VN")}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="x-axis-scale-ticks">
                <span>0</span>
                <span>1.000</span>
                <span>2.000</span>
                <span>3.000</span>
                <span>4.000</span>
                <span>5.000</span>
            </div>
            <div className="x-axis-bottom-title">Lượt tìm kiếm</div>
        </div>
    );
}

export default TopLocationsChart;
