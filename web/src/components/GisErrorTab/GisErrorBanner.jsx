import React from "react";
import "../../css/GisErrorBanner.css";

function GisErrorBanner({
    groundTruth = null,
    prediction = null,
    distanceError = null,
    accuracyLevel = null,
}) {
    const hasGt =
        groundTruth &&
        groundTruth.lat !== "" &&
        groundTruth.lon !== "" &&
        !isNaN(Number(groundTruth.lat)) &&
        !isNaN(Number(groundTruth.lon));

    const gtLat = hasGt ? Number(groundTruth.lat) : null;
    const gtLon = hasGt ? Number(groundTruth.lon) : null;

    const hasPred =
        prediction &&
        prediction.lat !== "" &&
        prediction.lon !== "" &&
        !isNaN(Number(prediction.lat)) &&
        !isNaN(Number(prediction.lon));

    const predLat = hasPred ? Number(prediction.lat) : null;
    const predLon = hasPred ? Number(prediction.lon) : null;

    const distVal = distanceError !== null && typeof distanceError === "number" ? distanceError : null;

    return (
        <div className="gis-error-banner-container" aria-label="Bảng Đo Đạc Sai Số GIS">
            {/* TIÊU ĐỀ */}
            <div className="gis-badge-pill">
                <span className="gis-badge-icon">📐</span>
                <span className="gis-badge-title">ĐO ĐẠC SAI SỐ GIS (TASK 2.3)</span>
            </div>

            {/* DANH SÁCH THÔNG SỐ TOÁN HỌC */}
            <div className="gis-metric-rows">
                {/* Tọa độ thực tế */}
                <div className="gis-metric-item">
                    <span className="gis-icon-bullet">🎯</span>
                    <span className="gis-item-label">Tọa độ thực tế:</span>
                    <span className="gis-item-val">
                        {hasGt ? `(${gtLat.toFixed(6)}, ${gtLon.toFixed(6)})` : "Chưa nhập (nhập ở ô trên để đối soát)"}
                    </span>
                </div>

                {/* Tọa độ AI dự đoán */}
                <div className="gis-metric-item">
                    <span className="gis-icon-bullet">📍</span>
                    <span className="gis-item-label">Tọa độ AI dự đoán:</span>
                    <span className="gis-item-val">
                        {hasPred ? `(${predLat.toFixed(6)}, ${predLon.toFixed(6)})` : "Chưa có tọa độ AI"}
                    </span>
                </div>

                {/* Khoảng cách sai số */}
                <div className="gis-metric-item">
                    <span className="gis-icon-bullet">📏</span>
                    <span className="gis-item-label">Khoảng cách sai số (Đường chim bay):</span>
                    <strong className="gis-dist-bold">
                        {distVal !== null
                            ? (distVal < 1 ? `${(distVal * 1000).toFixed(0)} mét` : `${distVal.toFixed(2)} km`)
                            : "Chưa xác định (cần cả 2 tọa độ)"}
                    </strong>
                </div>

                {/* Đánh giá cấp độ */}
                <div className="gis-metric-item">
                    <span className="gis-icon-bullet">⏳</span>
                    <span className="gis-item-label">Đánh giá cấp độ:</span>
                    <span className="gis-level-content">
                        <span className="gis-dot-indicator">{accuracyLevel ? "🟢" : "⚪"}</span>
                        <strong className="gis-level-text">
                            {accuracyLevel || "Chờ nhập tọa độ để đánh giá"}
                        </strong>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default React.memo(GisErrorBanner);
