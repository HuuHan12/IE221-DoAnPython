import React, { useState } from "react";
import {
    MapPinIcon,
    TargetIcon,
    CopyIcon,
    CheckIcon,
    ExternalLinkIcon,
    RulerIcon,
    SparklesIcon,
} from "../common/Icons";
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

    // Dữ liệu sai số Geodesic và phân loại chuẩn tính toán 100% 
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

    const rank = prediction.rank || 1;

    return (
        <div className="top-result-hero-card" aria-label="Kết Quả Dự Đoán Tốt Nhất">
            {/* HÀNG 1: Tên địa danh và độ chính xác */}
            <div className="hero-name-row">
                <div className="hero-title-group">
                    <span className="hero-rank-pill">#{rank}</span>
                    <h2 className="hero-landmark-name">{name}</h2>
                </div>

                {probPercent > 0 ? (
                    <span className="hero-confidence-badge" title="Độ tin cậy của mô hình AI">
                        <SparklesIcon size={14} className="badge-sparkle-icon" />
                        <span>Độ chính xác: <strong>{probPercent.toFixed(1)}%</strong></span>
                    </span>
                ) : null}
            </div>

            {/* HÀNG 2: Tỉnh thành loại hình */}
            <div className="hero-meta-row">
                <span className="hero-meta-item">
                    <span className="meta-label">Tỉnh/Thành:</span>
                    <span className="meta-value">{province}</span>
                </span>
                <span className="hero-meta-separator">•</span>
                <span className="hero-meta-item">
                    <span className="meta-label">Loại hình:</span>
                    <span className="meta-value">{category}</span>
                </span>
            </div>

            {/* HÀNG 3: Mô tả địa danh */}
            {description ? (
                <p className="hero-description-text">{description}</p>
            ) : null}

            {/* HÀNG 4:So sánh tọa độ thực tế*/}
            <div className="hero-coordinates-comparison-box">
                {/* 4.1. TỌA ĐỘ DO AI TẠO */}
                <div className="coord-compare-row ai-coord-row">
                    <div className="coord-label-val">
                        <div className="coord-icon-box ai-icon-box">
                            <MapPinIcon size={16} />
                        </div>
                        <span className="coord-type-title">Tọa độ AI:</span>
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
                            {copiedAi ? (
                                <>
                                    <CheckIcon size={13} className="btn-svg" />
                                    <span>Đã chép</span>
                                </>
                            ) : (
                                <>
                                    <CopyIcon size={13} className="btn-svg" />
                                    <span>Sao chép</span>
                                </>
                            )}
                        </button>
                        <a
                            href={gmapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hero-gmaps-link"
                            title="Xem vị trí AI trên Google Maps"
                        >
                            <ExternalLinkIcon size={13} className="btn-svg" />
                            <span>Maps</span>
                        </a>
                    </div>
                </div>

                {/*Tọa độ người dùng nhập */}
                <div className={`coord-compare-row gt-coord-row ${hasGt ? "has-gt" : "no-gt"}`}>
                    <div className="coord-label-val">
                        <div className="coord-icon-box gt-icon-box">
                            <TargetIcon size={16} />
                        </div>
                        <span className="coord-type-title">Tọa độ thực tế:</span>
                        {hasGt && gtLat !== null && gtLon !== null ? (
                            <span className="coord-numbers gt-numbers">
                                Lat {gtLat.toFixed(6)}, Lon {gtLon.toFixed(6)}
                            </span>
                        ) : (
                            <span className="coord-empty-notice">
                                Chưa nhập
                            </span>
                        )}
                    </div>

                    {hasGt && gtLat !== null && gtLon !== null ? (
                        <div className="coord-row-actions">
                            <button
                                type="button"
                                className="hero-copy-btn"
                                onClick={handleCopyGt}
                                title="Sao chép tọa độ thực tế"
                            >
                                {copiedGt ? (
                                    <>
                                        <CheckIcon size={13} className="btn-svg" />
                                        <span>Đã chép</span>
                                    </>
                                ) : (
                                    <>
                                        <CopyIcon size={13} className="btn-svg" />
                                        <span>Sao chép</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : null}
                </div>

                {/* Đánh giá sai số */}
                {gisError && formattedDistance ? (
                    <div className="coord-distance-error-box">
                        <div className="dist-icon-box">
                            <RulerIcon size={16} />
                        </div>
                        <span className="dist-label">Sai số khoảng cách:</span>
                        <strong className="dist-value">
                            {formattedDistance}
                        </strong>
                        {accuracyLabel ? (
                            <span className={`dist-benchmark-tag ${accuracyLevelClass}`}>
                                {accuracyLabel}
                            </span>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default React.memo(TopResultHero);
