import React, { useState, useRef, useEffect } from "react";
import { Info, ChevronDown, MapPin, Check, Search, Loader2 } from "lucide-react";

function TopLocationsChart({ apiLocationsData, loading = false }) {
    const [selectedLandmark, setSelectedLandmark] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);

    // Chuẩn hóa dữ liệu từ API TopPlaceItem (place_id, name, province, search_count)
    const locationsData = (apiLocationsData || []).map((item, idx) => ({
        id: item.place_id || idx + 1,
        name: item.name || "Địa danh không xác định",
        province: item.province,
        count: item.search_count !== undefined ? item.search_count : (item.count || 0),
    }));

    // Tính toán mốc max tự động theo dữ liệu thực tế
    const maxCount = Math.max(
        ...locationsData.map((item) => item.count),
        10
    );

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
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.province && loc.province.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const buttonLabel = selectedLandmark
        ? selectedLandmark.name
        : "Theo lượt tìm kiếm";

    return (
        <div className="chart-card-section half-width">
            <div className="chart-card-header">
                <div className="chart-title-with-info">
                    <h3>Top 10 địa điểm được tìm kiếm nhiều nhất</h3>
                    <Info size={16} className="info-icon" title="Thống kê các địa danh có số lượt tìm kiếm cao nhất trong khoảng thời gian" />
                    {loading && (
                        <Loader2 size={16} className="animate-spin" color="#009080" style={{ marginLeft: 8 }} />
                    )}
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
                                            <span className="menu-landmark-name">
                                                {item.name}
                                                {item.province ? ` (${item.province})` : ""}
                                            </span>
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
                {locationsData.length === 0 ? (
                    <div style={{ padding: "32px 0", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>
                        Chưa có dữ liệu địa điểm trong khoảng thời gian đã chọn
                    </div>
                ) : (
                    locationsData.map((item, idx) => {
                        const barWidthPercent = Math.min(100, (item.count / maxCount) * 100);
                        const isSelected = selectedLandmark?.id === item.id;

                        return (
                            <div
                                key={item.id}
                                className={`location-bar-row ${isSelected ? "highlighted-row" : ""}`}
                                onClick={() => setSelectedLandmark(isSelected ? null : item)}
                                title={`${item.name} - ${item.count} lượt tìm kiếm`}
                            >
                                <span className="location-name">
                                    <span style={{ color: "#9CA3AF", fontSize: "12px", marginRight: "6px" }}>
                                        #{idx + 1}
                                    </span>
                                    {isSelected && <MapPin size={14} color="#009080" style={{ marginRight: 4, display: "inline" }} />}
                                    {item.name}
                                    {item.province && (
                                        <span style={{ fontSize: "11px", color: "#9CA3AF", marginLeft: "4px" }}>
                                            • {item.province}
                                        </span>
                                    )}
                                </span>
                                <div className="bar-track">
                                    <div
                                        className={`bar-fill ${isSelected ? "active-fill" : ""}`}
                                        style={{ width: `${Math.max(barWidthPercent, 2)}%` }}
                                    ></div>
                                    <span className="bar-count-val">
                                        {item.count.toLocaleString("vi-VN")}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="x-axis-scale-ticks">
                <span>0</span>
                <span>{Math.round(maxCount * 0.25).toLocaleString("vi-VN")}</span>
                <span>{Math.round(maxCount * 0.5).toLocaleString("vi-VN")}</span>
                <span>{Math.round(maxCount * 0.75).toLocaleString("vi-VN")}</span>
                <span>{maxCount.toLocaleString("vi-VN")}</span>
            </div>
            <div className="x-axis-bottom-title">Lượt tìm kiếm</div>
        </div>
    );
}

export default TopLocationsChart;
