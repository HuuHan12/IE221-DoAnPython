import React, { useState } from "react";
import "../../css/ResultCard.css";

function RankedResultList({
    predictions = [],
    topK = 5,
    selectedIndex = 0,
    onSelectPrediction = null,
}) {
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
    };

    const displayList = predictions.slice(0, topK);

    return (
        <div className="ranked-result-container">
            <div className="ranked-list-header">
                <h4 className="ranked-title">
                    📋 Bảng Xếp Hạng Top-K Dự Đoán
                </h4>
                <span className="ranked-badge-counter">
                    {displayList.length} vị trí
                </span>
            </div>

            <div className="ranked-list">
                {displayList.map((item, index) => {
                    const rank = item.rank || index + 1;
                    const lat = Number(item.lat || 0);
                    const lon = Number(item.lon || 0);
                    const prob = Number(item.prob_percent || 0);
                    const isSelected = selectedIndex === index;
                    const gmapsUrl =
                        item.gmaps_url ||
                        `https://www.google.com/maps?q=${lat},${lon}`;

                    return (
                        <div
                            key={index}
                            className={`rank-row-card rank-${rank <= 3 ? rank : "other"} ${isSelected ? "selected-rank-row" : ""}`}
                        >
                            <div className="rank-row-top">
                                <span className={`rank-tag rank-tag-${rank <= 3 ? rank : "other"}`}>
                                    #{rank}
                                </span>

                                <div className="rank-text-content">
                                    <div className="rank-main-line">
                                        <span className="coord-val">
                                            {lat.toFixed(6)}, {lon.toFixed(6)}
                                        </span>
                                        <span className="divider-sep">•</span>
                                        <span className="prob-chip">
                                            Xác suất: <strong>{prob.toFixed(2)}%</strong>
                                        </span>
                                    </div>

                                    <div className="rank-landmark-name">
                                        <span className="landmark-pin">📍</span>
                                        <strong>{item.name || "Địa danh không xác định"}</strong>
                                        {item.province ? <span className="landmark-sub"> — {item.province}</span> : ""}
                                        {item.category ? <span className="landmark-cat"> ({item.category})</span> : ""}
                                    </div>

                                    {item.description && (
                                        <div className="rank-landmark-desc">
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rank-row-bottom">
                                {/* NÚT CHỌN VỊ TRÍ NÀY (XỬ LÝ 100% QUA PYTHON BACKEND) */}
                                {onSelectPrediction && (
                                    <button
                                        type="button"
                                        className={`select-rank-btn ${isSelected ? "is-active" : ""}`}
                                        onClick={() => onSelectPrediction(index)}
                                        title="Chọn địa điểm này để hiển thị trên thẻ chi tiết và bản đồ"
                                    >
                                        {isSelected ? "✓ Đang xem vị trí này" : "🎯 Chọn vị trí này"}
                                    </button>
                                )}

                                <a
                                    href={gmapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="gmaps-btn"
                                    title="Mở trên Google Maps"
                                >
                                    <span>🗺️</span>
                                    <span className="gmaps-url-text">Xem trên Maps</span>
                                    <span className="open-arrow">↗</span>
                                </a>

                                <button
                                    type="button"
                                    className="copy-coord-btn"
                                    onClick={() => handleCopy(`${lat.toFixed(6)}, ${lon.toFixed(6)}`, index)}
                                    title="Sao chép tọa độ GPS"
                                >
                                    {copiedIndex === index ? "✓ Đã chép" : "📋 Copy Tọa độ"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default React.memo(RankedResultList);
