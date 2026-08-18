import React, { useState } from "react";
import TopResultHero from "./TopResultHero";
import LeafletMap from "./LeafletMap";
import RankedResultList from "./RankedResultList";
import { calculateHaversineDistance } from "../../libs/geoUtils";
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

    return (
        <section className="result-column-card" aria-label="Kết Quả Dự Đoán & Bản Đồ">
            {/* TIÊU ĐỀ CỘT */}
            <div className="card-header-bar">
                <h3 className="column-title">2. Kết Quả Dự Đoán & Bản Đồ Không Gian</h3>
                {loading ? (
                    <span className="step-badge processing">Đang xử lý AI...</span>
                ) : result ? (
                    <span className="step-badge success">Đã định vị</span>
                ) : (
                    <span className="step-badge ready">Bản đồ sẵn sàng</span>
                )}
            </div>

            {/* HIỂN THỊ TRẠNG THÁI LOADING / KẾT QUẢ TOP 1 / HOẶC THÔNG BÁO CHỜ */}
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
                />
            ) : (
                <div className="idle-notice-box">
                    <span className="notice-icon">🗺️</span>
                    <p>
                        Bản đồ tương tác GIS đã sẵn sàng. Hãy chọn hoặc tải ảnh lên ở cột bên trái và bấm{" "}
                        <strong>'Bắt đầu Định vị'</strong> để xem vị trí dự đoán trên bản đồ.
                    </p>
                </div>
            )}

            {/* BẢN ĐỒ LEAFLET LUÔN HIỂN THỊ TRỰC TIẾP TẠI ĐÂY */}
            <LeafletMap
                predictions={predictions}
                groundTruth={groundTruth}
                distanceKm={distanceError}
                selectedPrediction={activePrediction}
            />

            {/* BẢNG XẾP HẠNG TOP-K (HIỆN RA KHI CÓ KẾT QUẢ DỰ ĐOÁN) */}
            {result && predictions.length > 0 && (
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
                            className={`action-btn share-btn ${copiedShare ? "copied" : ""}`}
                            onClick={handleShareClick}
                            title="Chia sẻ thông tin và liên kết Google Maps của địa danh"
                        >
                            <span className="share-btn-icon">{copiedShare ? "✓" : "📤"}</span>
                            <span>{copiedShare ? "Đã sao chép liên kết!" : "Chia sẻ kết quả"}</span>
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}

export default React.memo(ResultCard);
