import React, { useState, useEffect, useCallback } from "react";
import GisErrorBanner from "./GisErrorBanner";
import LeafletMap from "../GeoPredictionTab/LeafletMap";
import RankedResultList from "../GeoPredictionTab/RankedResultList";
import { calculateGisErrorApi } from "../../service/predictService";
import "../../css/GisErrorBanner.css";

function GisErrorTab({
    groundTruth = null,
    prediction = null,
    predictions = null,
    distanceError = null,
    accuracyLevel = null,
}) {
    // Inputs state (nhập trực tiếp hoặc tự động đồng bộ từ Tab Dự Đoán)
    const [gtLatInput, setGtLatInput] = useState(groundTruth?.lat ? String(groundTruth.lat) : "");
    const [gtLonInput, setGtLonInput] = useState(groundTruth?.lon ? String(groundTruth.lon) : "");
    const [predLatInput, setPredLatInput] = useState(prediction?.lat ? String(prediction.lat) : "");
    const [predLonInput, setPredLonInput] = useState(prediction?.lon ? String(prediction.lon) : "");

    // Kết quả tính toán từ Python Backend
    const [gisResult, setGisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState("");

    // Danh sách dự đoán Top-K
    const activePredictions = Array.isArray(predictions) && predictions.length > 0 ? predictions : (prediction ? [prediction] : []);

    // Tự động đồng bộ khi Tab Dự Đoán có kết quả mới
    useEffect(() => {
        if (groundTruth?.lat && groundTruth?.lon) {
            setGtLatInput(String(groundTruth.lat));
            setGtLonInput(String(groundTruth.lon));
        }
        if (prediction?.lat && prediction?.lon) {
            setPredLatInput(String(prediction.lat));
            setPredLonInput(String(prediction.lon));
        }
    }, [groundTruth, prediction]);

    // Gọi Python Backend tính toán sai số GIS & Validate phía client
    const handleCalculate = useCallback(async () => {
        setValidationError("");

        if (!gtLatInput || !gtLonInput || !predLatInput || !predLonInput) {
            setValidationError("Vui lòng nhập đầy đủ Vĩ độ và Kinh độ của cả Tọa độ thực tế và Tọa độ AI.");
            return;
        }

        const gtLat = parseFloat(gtLatInput);
        const gtLon = parseFloat(gtLonInput);
        const predLat = parseFloat(predLatInput);
        const predLon = parseFloat(predLonInput);

        // Validate miền giá trị hợp lệ
        if (isNaN(gtLat) || gtLat < -90 || gtLat > 90) {
            setValidationError("Vĩ độ thực tế (Latitude) không hợp lệ (Phải từ -90° đến 90°).");
            return;
        }
        if (isNaN(gtLon) || gtLon < -180 || gtLon > 180) {
            setValidationError("Kinh độ thực tế (Longitude) không hợp lệ (Phải từ -180° đến 180°).");
            return;
        }
        if (isNaN(predLat) || predLat < -90 || predLat > 90) {
            setValidationError("Vĩ độ AI dự đoán (Latitude) không hợp lệ (Phải từ -90° đến 90°).");
            return;
        }
        if (isNaN(predLon) || predLon < -180 || predLon > 180) {
            setValidationError("Kinh độ AI dự đoán (Longitude) không hợp lệ (Phải từ -180° đến 180°).");
            return;
        }

        setLoading(true);
        try {
            const data = await calculateGisErrorApi({
                ground_truth_lat: gtLat,
                ground_truth_lon: gtLon,
                predicted_lat: predLat,
                predicted_lon: predLon,
                predictions: activePredictions,
            });
            setGisResult(data);
        } catch (err) {
            console.error("[GIS Calculate Error]", err);
            setValidationError(err.message || "Không thể tính toán sai số từ máy chủ Python.");
        } finally {
            setLoading(false);
        }
    }, [gtLatInput, gtLonInput, predLatInput, predLonInput, activePredictions]);

    // Tự động tính toán khi có đủ dữ liệu từ Tab 1
    useEffect(() => {
        if (gtLatInput && gtLonInput && predLatInput && predLonInput) {
            handleCalculate();
        }
    }, [handleCalculate]);

    // Giá trị hiển thị
    const effectiveGt = gisResult?.ground_truth ? {
        lat: gisResult.ground_truth.lat,
        lon: gisResult.ground_truth.lon,
    } : (gtLatInput && gtLonInput ? { lat: parseFloat(gtLatInput), lon: parseFloat(gtLonInput) } : null);

    const effectivePred = gisResult?.prediction ? {
        lat: gisResult.prediction.lat,
        lon: gisResult.prediction.lon,
    } : (predLatInput && predLonInput ? { lat: parseFloat(predLatInput), lon: parseFloat(predLonInput) } : null);

    const effectiveDistance = gisResult?.distance_km ?? distanceError;
    const effectiveAccuracy = gisResult?.accuracy_label || accuracyLevel;

    return (
        <div className="gis-error-tab-layout" aria-label="Giao Diện Đo Đạc Sai Số GIS">
            {/* KHUNG CẤU HÌNH & NHẬP TỌA ĐỘ ĐỐI SOÁT */}
            <div className="gis-control-panel-card">
                <div className="gis-panel-header">
                    <div className="panel-header-title">
                        <span className="panel-icon">⚙️</span>
                        <h4>Công Cụ Đo Đạc & Thẩm Định Sai Số GIS (Task 2.3)</h4>
                    </div>
                </div>

                <p className="gis-panel-desc">
                    Tính toán khoảng cách trắc địa trên elipsoid WGS-84 (Geodesic km), công thức Haversine mặt cầu, góc phương vị không gian (Bearing) và phân loại cấp độ chính xác theo chuẩn GeoCLIP ICCV.
                </p>

                {/* FORM NHẬP TỌA ĐỘ THỰC TẾ & DỰ ĐOÁN */}
                <div className="gis-inputs-grid">
                    {/* CỘT 1: TỌA ĐỘ THỰC TẾ */}
                    <div className="gis-input-card gt-card">
                        <div className="card-sub-header">
                            <span>🎯</span>
                            <strong>Tọa Độ Thực Tế (Ground Truth)</strong>
                        </div>
                        <div className="inputs-pair">
                            <div className="field-item">
                                <label>Vĩ độ (Lat):</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="VD: 10.795000"
                                    value={gtLatInput}
                                    onChange={(e) => setGtLatInput(e.target.value)}
                                    className="coord-num-input"
                                />
                            </div>
                            <div className="field-item">
                                <label>Kinh độ (Lon):</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="VD: 106.721500"
                                    value={gtLonInput}
                                    onChange={(e) => setGtLonInput(e.target.value)}
                                    className="coord-num-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CỘT 2: TỌA ĐỘ AI DỰ ĐOÁN */}
                    <div className="gis-input-card ai-card">
                        <div className="card-sub-header">
                            <span>📍</span>
                            <strong>Tọa Độ AI Dự Đoán (Predicted Location)</strong>
                        </div>
                        <div className="inputs-pair">
                            <div className="field-item">
                                <label>Vĩ độ (Lat):</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="VD: 10.773821"
                                    value={predLatInput}
                                    onChange={(e) => setPredLatInput(e.target.value)}
                                    className="coord-num-input"
                                />
                            </div>
                            <div className="field-item">
                                <label>Kinh độ (Lon):</label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="VD: 106.703214"
                                    value={predLonInput}
                                    onChange={(e) => setPredLonInput(e.target.value)}
                                    className="coord-num-input"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* THÔNG BÁO VALIDATE LỖI NẾU CÓ */}
                {validationError && (
                    <div className="gis-validate-alert">
                        <span>⚠️</span>
                        <p>{validationError}</p>
                    </div>
                )}

                {/* NÚT TÍNH TOÁN */}
                <div className="gis-action-row">
                    <button
                        type="button"
                        className={`gis-calc-btn ${loading ? "loading" : ""}`}
                        onClick={handleCalculate}
                        disabled={loading}
                    >
                        {loading ? "ĐANG TÍNH TOÁN BẰNG PYTHON..." : "📐 ĐO ĐẠC SAI SỐ GIS NGAY"}
                    </button>
                </div>
            </div>

            {/* 1. TOP BANNER ĐO ĐẠC SAI SỐ GIS (CHUẨN THEO ẢNH MẪU) */}
            <GisErrorBanner
                groundTruth={effectiveGt}
                prediction={effectivePred}
                distanceError={effectiveDistance}
                accuracyLevel={effectiveAccuracy}
            />

            {/* 2. BẢN ĐỒ KHÔNG GIAN LEAFLET TƯƠNG TÁC */}
            <div className="gis-map-section">
                <LeafletMap
                    predictions={activePredictions}
                    groundTruth={effectiveGt}
                    distanceKm={effectiveDistance}
                />
            </div>

            {/* 3. BẢNG CHI TIẾT CÁC CHỈ SỐ TRẮC ĐỊA GIS (PYTHON CALCULATED METRICS) */}
            {gisResult && (
                <div className="gis-deep-metrics-card">
                    <h4>📊 Chi Tiết Thông Số Trắc Địa Không Gian (GIS Detailed Metrics)</h4>
                    <div className="metrics-stats-grid">
                        <div className="metric-chip">
                            <span className="m-title">Khoảng cách Geodesic (WGS-84)</span>
                            <strong className="m-val highlight-green">{gisResult.formatted_distance}</strong>
                            <small>Chuẩn elipsoid Trái Đất</small>
                        </div>

                        <div className="metric-chip">
                            <span className="m-title">Khoảng cách Haversine (Mặt cầu)</span>
                            <strong className="m-val">{gisResult.haversine_km} km</strong>
                            <small>Bán kính R = 6,371 km</small>
                        </div>

                        <div className="metric-chip">
                            <span className="m-title">Góc Phương Vị Không Gian (Bearing)</span>
                            <strong className="m-val">{gisResult.bearing_degrees}° ({gisResult.bearing_compass})</strong>
                            <small>Hướng lệch từ Thực tế → AI</small>
                        </div>

                        <div className="metric-chip">
                            <span className="m-title">Phân Cấp Đạt Chuẩn (Benchmark)</span>
                            <strong className="m-val badge-text">
                                {gisResult.accuracy_icon} {gisResult.accuracy_short_label}
                            </strong>
                            <small>Chuẩn GeoCLIP ICCV 2023</small>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. BẢNG XẾP HẠNG TOP-K DỰ ĐOÁN */}
            {activePredictions.length > 0 && (
                <div className="gis-rankings-section">
                    <RankedResultList
                        predictions={activePredictions}
                        topK={5}
                    />
                </div>
            )}
        </div>
    );
}

export default React.memo(GisErrorTab);
