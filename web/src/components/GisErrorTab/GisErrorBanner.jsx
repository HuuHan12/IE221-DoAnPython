import React from "react";
import {
    RulerIcon,
    TargetIcon,
    MapPinIcon,
    CheckIcon,
    SparklesIcon,
} from "../common/Icons";
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

    const distVal =
        distanceError !== null && typeof distanceError === "number"
            ? distanceError
            : null;

    return (
        <div className="gis-error-banner-container" aria-label="Bảng Đo Đạc Sai Số GIS">
            {/* TIÊU ĐỀ BANNER */}
            <div className="gis-badge-pill">
                <RulerIcon size={15} className="gis-badge-icon" />
                <span className="gis-badge-title">Đo Đạc Sai Số GIS</span>
            </div>

            {/* DANH SÁCH THÔNG SỐ TOÁN HỌC */}
            <div className="gis-metric-rows">
                {/* 1. Tọa độ thực tế */}
                <div className="gis-metric-item">
                    <div className="metric-item-icon-box gt-icon-box">
                        <TargetIcon size={14} />
                    </div>
                    <span className="gis-item-label">Tọa độ thực tế (Ground Truth):</span>
                    <span className="gis-item-val gt-val-color">
                        {hasGt
                            ? `Lat ${gtLat.toFixed(6)}, Lon ${gtLon.toFixed(6)}`
                            : "Chưa nhập (nhập ở ô trên để đối soát)"}
                    </span>
                </div>

                {/* 2. Tọa độ AI dự đoán */}
                <div className="gis-metric-item">
                    <div className="metric-item-icon-box ai-icon-box">
                        <MapPinIcon size={14} />
                    </div>
                    <span className="gis-item-label">Tọa độ AI dự đoán (Predicted Location):</span>
                    <span className="gis-item-val ai-val-color">
                        {hasPred
                            ? `Lat ${predLat.toFixed(6)}, Lon ${predLon.toFixed(6)}`
                            : "Chưa có tọa độ AI"}
                    </span>
                </div>

                {/* 3. Khoảng cách sai số Geodesic */}
                <div className="gis-metric-item">
                    <div className="metric-item-icon-box dist-icon-box">
                        <RulerIcon size={14} />
                    </div>
                    <span className="gis-item-label">Khoảng cách sai số (Đường chim bay):</span>
                    <strong className="gis-dist-bold">
                        {distVal !== null
                            ? distVal < 1
                                ? `${(distVal * 1000).toFixed(0)} mét`
                                : `${distVal.toFixed(2)} km`
                            : "Chưa xác định (cần đủ 2 tọa độ)"}
                    </strong>
                </div>

                {/* 4. Đánh giá cấp độ chính xác */}
                <div className="gis-metric-item">
                    <div className="metric-item-icon-box eval-icon-box">
                        <SparklesIcon size={14} />
                    </div>
                    <span className="gis-item-label">Đánh giá cấp độ:</span>
                    <span className="gis-level-content">
                        {accuracyLevel ? (
                            <span className="gis-benchmark-badge active">
                                <CheckIcon size={13} />
                                <span>{accuracyLevel}</span>
                            </span>
                        ) : (
                            <span className="gis-benchmark-badge pending">
                                <span>Chờ nhập tọa độ để đánh giá</span>
                            </span>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default React.memo(GisErrorBanner);
