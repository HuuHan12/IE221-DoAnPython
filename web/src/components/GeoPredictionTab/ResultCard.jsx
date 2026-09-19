import React, { useState } from "react";
import TopResultHero from "./TopResultHero";
import LeafletMap from "./LeafletMap";
import RankedResultList from "./RankedResultList";
import { ShareIcon, CheckIcon, GlobeIcon, SparklesIcon } from "../common/Icons";
import { MapPin, Loader2, Trophy } from "lucide-react";
import { calculateHaversineDistance } from "../../libs/geoUtils";
import { recordCheckinApi } from "../../service/achievementService";
import "../../css/ResultCard.css";

function ResultCard({
    result,
    selectedPredictionIndex = 0,
    selectedPrediction = null,
    selectedGisError = null,
    onSelectPrediction = null,
    preview,
    loading,
    topK = 5,
    groundTruth = { lat: "", lon: "" },
    onShare,
}) {
    const [copiedShare, setCopiedShare] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [checkinSuccess, setCheckinSuccess] = useState(false);
    const [checkinMessage, setCheckinMessage] = useState("");
    const activePrediction = selectedPrediction || result?.prediction || null;
    const activeGisError = selectedGisError ?? result?.gis_error ?? null;
    const predictions = result?.predictions || (activePrediction ? [activePrediction] : []);

    const latNum = Number(activePrediction?.lat || 0);
    const lonNum = Number(activePrediction?.lon || 0);

    // Tính khoảng cách sai số Geodesic nếu có Ground Truth (để vẽ trên bản đồ Leaflet)
    let distanceError = null;
    if (activeGisError && typeof activeGisError.distance_km === "number") {
        distanceError = activeGisError.distance_km;
    } else if (
        activePrediction &&
        groundTruth?.lat !== "" &&
        groundTruth?.lon !== "" &&
        !isNaN(Number(groundTruth?.lat)) &&
        !isNaN(Number(groundTruth?.lon))
    ) {
        distanceError = calculateHaversineDistance(
            Number(groundTruth.lat),
            Number(groundTruth.lon),
            latNum,
            lonNum
        );
    }

    const handleShareClick = async () => {
        if (onShare) {
            await onShare();
        }
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2200);
    };

    const handleCheckinClick = async () => {
        setIsCheckingIn(true);
        try {
            const res = await recordCheckinApi();
            if (res && res.status === "success") {
                setCheckinSuccess(true);
                setCheckinMessage(res.message || "Đã check-in thành công!");
                setTimeout(() => setCheckinSuccess(false), 4000);
            }
        } catch (err) {
            console.error("Lỗi check-in địa danh:", err);
        } finally {
            setIsCheckingIn(false);
        }
    };

    return (
        <section className="result-column-card" aria-label="Kết Quả Dự Đoán & Bản Đồ">
            {/* Tiêu đề cột */}
            <div className="card-header-bar">
                <div className="card-title-group">
                    <span className="step-indicator-pill">02</span>
                    <h3 className="column-title">Kết Quả Dự Đoán & Bản Đồ Không Gian</h3>
                </div>
                {loading ? (
                    <span className="step-badge processing">
                        <span className="badge-pulse-dot" />
                        <span>Đang xử lý AI...</span>
                    </span>
                ) : result ? (
                    <span className="step-badge success">
                        <CheckIcon size={13} />
                        <span>Đã định vị</span>
                    </span>
                ) : (
                    <span className="step-badge ready">
                        <GlobeIcon size={13} />
                        <span>Bản đồ sẵn sàng</span>
                    </span>
                )}
            </div>

            {/* hiển thị trạng thái loading */}
            {loading ? (
                <div className="loading-radar-box">
                    <div className="ai-loader-ring" />
                    <h4>Đang phân tích vector thị giác (GeoCLIP ViT-L/14)...</h4>
                    <p>Hệ thống đang truy vấn các tọa độ tương đồng cao nhất</p>
                </div>
            ) : result && activePrediction ? (
                <TopResultHero
                    prediction={activePrediction}
                    groundTruth={groundTruth}
                    gisError={activeGisError}
                    placeId={result?.place_id}
                    mediaId={result?.input_media_id}
                />
            ) : (
                <div className="idle-notice-box">
                    <div className="idle-icon-box">
                        <GlobeIcon size={24} />
                    </div>
                    <p>
                        Bản đồ tương tác GIS đã sẵn sàng. Hãy chọn hoặc tải ảnh lên ở cột bên trái và bấm{" "}
                        <strong>'Bắt đầu Định vị'</strong> để xem vị trí dự đoán trên bản đồ.
                    </p>
                </div>
            )}

            {/* Bản đồ leafmap*/}
            <LeafletMap
                predictions={predictions}
                groundTruth={groundTruth}
                distanceKm={distanceError}
                selectedPrediction={activePrediction}
            />

            {/* Bảng xếp hạng */}
            {result && predictions.length > 0 ? (
                <>
                    <RankedResultList
                        predictions={predictions}
                        topK={topK}
                        selectedIndex={selectedPredictionIndex}
                        onSelectPrediction={onSelectPrediction}
                    />

                    <div className="result-bottom-actions">
                        <button
                            type="button"
                            className={`action-btn checkin-btn ${checkinSuccess ? "success" : ""}`}
                            onClick={handleCheckinClick}
                            disabled={isCheckingIn || checkinSuccess}
                            title="Ghi nhận lượt check-in địa danh này vào hồ sơ thành tích"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: checkinSuccess ? "#10B981" : "#009080",
                                color: "#FFFFFF",
                                border: "none",
                                padding: "9px 16px",
                                borderRadius: "10px",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: checkinSuccess ? "default" : "pointer",
                                transition: "all 0.2s ease",
                            }}
                        >
                            {isCheckingIn ? (
                                <>
                                    <Loader2 size={15} className="spin-icon" />
                                    <span>Đang ghi nhận...</span>
                                </>
                            ) : checkinSuccess ? (
                                <>
                                    <CheckIcon size={15} />
                                    <span>{checkinMessage || "Check-in thành công!"}</span>
                                </>
                            ) : (
                                <>
                                    <MapPin size={15} />
                                    <span>Check-in địa danh này</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className={`action-btn share-btn ${copiedShare ? "copied" : ""}`}
                            onClick={handleShareClick}
                            title="Chia sẻ thông tin và liên kết Google Maps của địa danh"
                        >
                            {copiedShare ? (
                                <>
                                    <CheckIcon size={16} />
                                    <span>Đã sao chép liên kết!</span>
                                </>
                            ) : (
                                <>
                                    <ShareIcon size={16} />
                                    <span>Chia sẻ kết quả</span>
                                </>
                            )}
                        </button>
                    </div>
                </>
            ) : null}
        </section>
    );
}

export default React.memo(ResultCard);
