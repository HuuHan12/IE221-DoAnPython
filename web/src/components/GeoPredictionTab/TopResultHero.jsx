import React, { useState, useEffect } from "react";
import {
    MapPinIcon,
    TargetIcon,
    CopyIcon,
    CheckIcon,
    ExternalLinkIcon,
    RulerIcon,
    SparklesIcon,
} from "../common/Icons";
import { Heart, Loader2 } from "lucide-react";
import {
    checkIsFavoriteApi,
    addFavoriteApi,
    removeFavoriteApi,
} from "../../service/favoriteService";
import "../../css/TopResultHero.css";

function TopResultHero({
    prediction = {},
    groundTruth = { lat: "", lon: "" },
    gisError = null,
    placeId = null,
    mediaId = null,
}) {
    const [copiedAi, setCopiedAi] = useState(false);
    const [copiedGt, setCopiedGt] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteId, setFavoriteId] = useState(null);
    const [isFavLoading, setIsFavLoading] = useState(false);
    const [favNotice, setFavNotice] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem("access_token");
        if (!placeId || !token) {
            setIsFavorite(false);
            setFavoriteId(null);
            return;
        }

        checkIsFavoriteApi(placeId)
            .then((res) => {
                if (isMounted) {
                    setIsFavorite(Boolean(res.is_favorite));
                    setFavoriteId(res.favorite_id || null);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setIsFavorite(false);
                    setFavoriteId(null);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [placeId]);

    const handleToggleFavorite = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            setFavNotice("Vui lòng đăng nhập để lưu địa danh yêu thích!");
            setTimeout(() => setFavNotice(null), 3000);
            return;
        }

        if (!placeId) return;

        setIsFavLoading(true);
        try {
            if (isFavorite) {
                await removeFavoriteApi(favoriteId || placeId);
                setIsFavorite(false);
                setFavoriteId(null);
                setFavNotice("Đã xóa khỏi danh sách yêu thích");
            } else {
                const res = await addFavoriteApi(placeId, mediaId);
                setIsFavorite(true);
                setFavoriteId(res.id || null);
                setFavNotice("Đã lưu vào danh sách yêu thích!");
            }
        } catch (err) {
            setFavNotice(err.message || "Không thể cập nhật yêu thích.");
        } finally {
            setIsFavLoading(false);
            setTimeout(() => setFavNotice(null), 3000);
        }
    };

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

    const rank = prediction.rank || 1;

    return (
        <div className="top-result-hero-card" aria-label="Kết Quả Dự Đoán Tốt Nhất">
            {/* HÀNG 1: TÊN ĐỊA DANH & BADGE ĐỘ CHÍNH XÁC & NÚT YÊU THÍCH */}
            <div className="hero-name-row">
                <div className="hero-title-group">
                    <span className="hero-rank-pill">#{rank}</span>
                    <h2 className="hero-landmark-name">{name}</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {placeId ? (
                        <button
                            type="button"
                            className="hero-fav-action-btn"
                            onClick={handleToggleFavorite}
                            disabled={isFavLoading}
                            title={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Lưu vào địa điểm yêu thích"}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                border: isFavorite ? "1px solid #fca5a5" : "1px solid #cbd5e1",
                                backgroundColor: isFavorite ? "#fef2f2" : "#ffffff",
                                color: isFavorite ? "#ef4444" : "#475569",
                                fontWeight: "600",
                                fontSize: "0.82rem",
                                cursor: isFavLoading ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                        >
                            {isFavLoading ? (
                                <Loader2 size={14} className="spin-icon" />
                            ) : (
                                <Heart size={14} fill={isFavorite ? "#ef4444" : "none"} color="#ef4444" />
                            )}
                            <span>{isFavorite ? "Đã yêu thích" : "Lưu yêu thích"}</span>
                        </button>
                    ) : null}

                    {probPercent > 0 ? (
                        <span className="hero-confidence-badge" title="Độ tin cậy của mô hình AI">
                            <SparklesIcon size={14} className="badge-sparkle-icon" />
                            <span>Độ chính xác: <strong>{probPercent.toFixed(1)}%</strong></span>
                        </span>
                    ) : null}
                </div>
            </div>

            {/* THÔNG BÁO NHANH YÊU THÍCH */}
            {favNotice ? (
                <div
                    style={{
                        padding: "6px 12px",
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        color: "#15803d",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        margin: "6px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    <span>✓</span>
                    <span>{favNotice}</span>
                </div>
            ) : null}

            {/* HÀNG 2: TỈNH THÀNH & LOẠI HÌNH */}
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

            {/* HÀNG 3: MÔ TẢ ĐỊA DANH */}
            {description ? (
                <p className="hero-description-text">{description}</p>
            ) : null}

            {/* HÀNG 4: SO SÁNH TỌA ĐỘ AI & TỌA ĐỘ THỰC TẾ */}
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
