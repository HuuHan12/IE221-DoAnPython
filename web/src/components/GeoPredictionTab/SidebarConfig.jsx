import React from "react";
import { SlidersIcon, LayersIcon, SparklesIcon, GlobeIcon, MapPinIcon } from "../common/Icons";
import "../../css/SidebarConfig.css";

function SidebarConfig({
    dataSource = "expanded",
    setDataSource,
    topK,
    setTopK,
    selectedSample,
    onSelectSample,
    samplePresets = [],
}) {
    const handleTopKInputChange = (e) => {
        const val = parseInt(e.target.value, 10);
        if (isNaN(val)) {
            setTopK("");
            return;
        }
        const clamped = Math.max(1, Math.min(10, val));
        setTopK(clamped);
    };

    const handleTopKInputBlur = () => {
        if (!topK || topK < 1) setTopK(1);
        else if (topK > 10) setTopK(10);
    };

    return (
        <aside className="sidebar-config" aria-label="Cấu hình hệ thống định vị">
            <div className="sidebar-header">
                <div className="sidebar-header-icon-box">
                    <SlidersIcon size={18} className="sidebar-svg-icon" />
                </div>
                <h3>Cấu Hình Hệ Thống</h3>
            </div>

            {/* Dữ liệu Dataset GPS (3 lựa chọn) */}
            <div className="config-section">
                <label className="config-section-title">
                    <LayersIcon size={16} className="section-title-icon" />
                    <span>Cơ Sở Dữ Liệu GPS</span>
                </label>
                <div className="radio-group" role="radiogroup" aria-label="Chọn tập dữ liệu tọa độ">
                    <label
                        className={`radio-label ${dataSource === "expanded" ? "active" : ""}`}
                    >
                        <input
                            type="radio"
                            name="dataSource"
                            value="expanded"
                            checked={dataSource === "expanded"}
                            onChange={(e) => setDataSource(e.target.value)}
                        />
                        <div className="radio-custom" />
                        <div className="radio-text">
                            <div className="radio-title-row">
                                <strong>vietnam_landmarks.csv</strong>
                                <span className="dataset-count-badge">26.3K POIs</span>
                            </div>
                            <small>Địa danh & POIs trên toàn quốc</small>
                        </div>
                    </label>

                    <label
                        className={`radio-label ${dataSource === "iconic" ? "active" : ""}`}
                    >
                        <input
                            type="radio"
                            name="dataSource"
                            value="iconic"
                            checked={dataSource === "iconic"}
                            onChange={(e) => setDataSource(e.target.value)}
                        />
                        <div className="radio-custom" />
                        <div className="radio-text">
                            <div className="radio-title-row">
                                <strong>vietnam_landmarks_iconic.csv</strong>
                                <span className="dataset-count-badge">68 Biểu Tượng</span>
                            </div>
                            <small>Danh lam thắng cảnh tiêu biểu</small>
                        </div>
                    </label>

                    <label
                        className={`radio-label ${dataSource === "global" ? "active" : ""}`}
                    >
                        <input
                            type="radio"
                            name="dataSource"
                            value="global"
                            checked={dataSource === "global"}
                            onChange={(e) => setDataSource(e.target.value)}
                        />
                        <div className="radio-custom" />
                        <div className="radio-text">
                            <div className="radio-title-row">
                                <strong>coordinates_100K.csv</strong>
                                <span className="dataset-count-badge">100K GPS</span>
                            </div>
                            <small>Tọa độ toàn cầu (GeoCLIP Global)</small>
                        </div>
                    </label>
                </div>
            </div>

            {/* Top-K Predictions */}
            <div className="config-section">
                <div className="topk-label-row">
                    <label htmlFor="topk-input" className="config-section-title">
                        <MapPinIcon size={16} className="section-title-icon" />
                        <span>Vị Trí Dự Đoán (Top-K)</span>
                    </label>
                    <span className="topk-current-pill">{topK || 5} kết quả</span>
                </div>

                <div className="topk-controls">
                    <input
                        id="topk-input"
                        type="number"
                        min="1"
                        max="10"
                        value={topK}
                        onChange={handleTopKInputChange}
                        onBlur={handleTopKInputBlur}
                        className="topk-number-input"
                        aria-label="Nhập số lượng Top-K từ 1 đến 10"
                    />

                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={topK || 5}
                        onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                        className="topk-slider"
                        aria-label="Kéo slider chọn Top-K"
                    />
                </div>
                <div className="topk-range-labels">
                    <span>1</span>
                    <span>10</span>
                </div>
            </div>

            {/* Sample Image Selector */}
            <div className="config-section">
                <label htmlFor="sample-select" className="config-section-title">
                    <SparklesIcon size={16} className="section-title-icon" />
                    <span>Chọn Ảnh Mẫu Thử Nghiệm</span>
                </label>
                <div className="select-wrapper">
                    <select
                        id="sample-select"
                        className="custom-select"
                        value={selectedSample}
                        onChange={(e) => onSelectSample(e.target.value)}
                    >
                        <option value="">Tải ảnh của bạn (Upload)</option>
                        {samplePresets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                                {preset.name} ({preset.province || "Việt Nam"})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </aside>
    );
}

export default React.memo(SidebarConfig);
