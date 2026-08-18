import React, { useState } from "react";
import "../../css/TopResultHero.css";

function TopResultHero({
    prediction = {},
    groundTruth = { lat: "", lon: "" },
    gisError = null,
}) {
    const [copiedAi, setCopiedAi] = useState(false);
    const [copiedGt, setCopiedGt] = useState(false);

    if (!prediction || Object.keys(prediction).length === 0) {
        return null;
    }

    const name = prediction.name || "Địa danh không xác định";
    const province = prediction.province || "Việt Nam";
    const category = prediction.category || "Địa điểm tham quan";
    const description =
        prediction.description ||
        `Địa danh ${name} tại ${province}.`;

    const predLat = typeof prediction.lat === "number"
        ? prediction.lat
        : Number(prediction.lat || 0);
    const predLon = typeof prediction.lon === "number"
        ? prediction.lon
        : Number(prediction.lon || 0);

    const probPercent = typeof prediction.prob_percent === "number"
        ? prediction.prob_percent
        : Number(prediction.prob_percent || 0);

    const gmapsUrl = prediction.gmaps_url || `https://www.google.com/maps?q=${predLat.toFixed(6)},${predLon.toFixed(6)}`;

    // Kiểm tra Tọa độ thực tế từ Python backend hoặc input
    const hasGt = Boolean(
        gisError?.ground_truth ||
        (groundTruth?.lat !== "" &&
            groundTruth?.lon !== "" &&
            !isNaN(Number(groundTruth?.lat)) &&
            !isNaN(Number(groundTruth?.lon)))
    );

    const gtLat = gisError?.ground_truth?.lat ?? (hasGt ? Number(groundTruth.lat) : null);
    const gtLon = gisError?.ground_truth?.lon ?? (hasGt ? Number(groundTruth.lon) : null);

    // Dữ liệu sai số Geodesic và phân loại chuẩn tính toán 100% từ Python Backend
    const formattedDistance = gisError?.formatted_distance ?? null;
    const accuracyLabel = gisError?.accuracy_label ?? null;
    const accuracyLevelClass = gisError?.accuracy_level ?? "dist-good";

    const handleCopyAi = () => {
        navigator.clipboard.writeText(`${predLat.toFixed(6)}, ${predLon.toFixed(6)}`);
        setCopiedAi(true);
        setTimeout(() => setCopiedAi(false), 2000);
    };

    const handleCopyGt = () => {
        if (!hasGt || gtLat === null || gtLon === null) return;
        navigator.clipboard.writeText(`${gtLat.toFixed(6)}, ${gtLon.toFixed(6)}`);
        setCopiedGt(true);
        setTimeout(() => setCopiedGt(false), 2000);
    };

    return (
        <div className="top-result-hero-card" aria-label="Kết Quả Dự Đoán Tốt Nhất">
            {/*tên địa danh và độ chính xác */}
            <div className="hero-name-row">
                <h2 className="hero-landmark-name">{name}</h2>
                {probPercent > 0 && (
                    <span className="hero-confidence-badge" title="Mức độ tin cậy của AI">
                        ⭐ Độ chính xác: <strong>{probPercent.toFixed(1)}%</strong>
                    </span>
                )}
            </div>

            {/* tỉnh thành ngoại hình */}
            <div className="hero-meta-row">
                <span className="hero-meta-item">
                    <strong>Tỉnh/Thành:</strong> {province}
                </span>
                <span className="hero-meta-separator">|</span>
                <span className="hero-meta-item">
                    <strong>Loại hình:</strong> {category}
                </span>
            </div>

            {/* mô tả địa danh */}
            {description && (
                <p className="hero-description-text">{description}</p>
            )}

            {/* so sánh tọa độ do AI tạo*/}
            <div className="hero-coordinates-comparison-box">
                {/* 4.1. TỌA ĐỘ DO AI TẠO */}
                <div className="coord-compare-row ai-coord-row">
                    <div className="coord-label-val">
                        <span className="coord-bullet">📍</span>
                        <strong className="coord-type-title">Tọa độ AI:</strong>
                        <span className="coord-numbers ai-numbers">
                            Lat {predLat.toFixed(6)}, Lon {predLon.toFixed(6)}
                        </span>
                    </div>

                    <div className="coord-row-actions">
                        <button
                            type="button"
                            className="hero-copy-btn"
                            onClick={handleCopyAi}
                            title="Sao chép tọa độ AI"
                        >
                            {copiedAi ? "✓ Đã chép" : "📋 Sao chép"}
                        </button>
                        <a
                            href={gmapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hero-gmaps-link"
                            title="Xem vị trí AI trên Google Maps"
                        >
                            <span>🗺️</span>
                            <span>Maps</span>
                            <span className="hero-link-arrow">↗</span>
                        </a>
                    </div>
                </div>

                {/* tọa độ người dùng nhập*/}
                <div className={`coord-compare-row gt-coord-row ${hasGt ? "has-gt" : "no-gt"}`}>
                    <div className="coord-label-val">
                        <span className="coord-bullet">🎯</span>
                        <strong className="coord-type-title">Tọa độ thực tế:</strong>
                        {hasGt && gtLat !== null && gtLon !== null ? (
                            <span className="coord-numbers gt-numbers">
                                Lat {gtLat.toFixed(6)}, Lon {gtLon.toFixed(6)}
                            </span>
                        ) : (
                            <span className="coord-empty-notice">
                                Chưa nhập (nhập ở Cột 1 để đối soát)
                            </span>
                        )}
                    </div>

                    {hasGt && gtLat !== null && gtLon !== null && (
                        <div className="coord-row-actions">
                            <button
                                type="button"
                                className="hero-copy-btn"
                                onClick={handleCopyGt}
                                title="Sao chép tọa độ thực tế"
                            >
                                {copiedGt ? "✓ Đã chép" : "📋 Sao chép"}
                            </button>
                        </div>
                    )}
                </div>

                {/* đánh giá sai số */}
                {gisError && formattedDistance && (
                    <div className="coord-distance-error-box">
                        <span className="dist-icon">📏</span>
                        <span className="dist-label">Sai số khoảng cách (Đường chim bay):</span>
                        <strong className="dist-value">
                            {formattedDistance}
                        </strong>
                        {accuracyLabel && (
                            <span className={`dist-benchmark-tag ${accuracyLevelClass}`}>
                                ({accuracyLabel})
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(TopResultHero);
