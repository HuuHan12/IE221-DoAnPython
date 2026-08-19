import React, { useState, useEffect, useCallback } from "react";
import GisErrorBanner from "./GisErrorBanner";
import LeafletMap from "../GeoPredictionTab/LeafletMap";
import RankedResultList from "../GeoPredictionTab/RankedResultList";
import { calculateGisErrorApi } from "../../service/predictService";
import {
    SlidersIcon,
    RulerIcon,
    TargetIcon,
    MapPinIcon,
    CompassIcon,
    AlertTriangleIcon,
    CheckIcon,
    SparklesIcon,
} from "../common/Icons";
import "../../css/GisErrorBanner.css";

function GisErrorTab({
    groundTruth = null,
    prediction = null,
    predictions = null,
    gisError = null,
    selectedIndex = 0,
    onSelectPrediction = null,
}) {
    // Inputs state (nhập trực tiếp hoặc tự động đồng bộ từ Tab Dự Đoán)
    const [gtLatInput, setGtLatInput] = useState(groundTruth?.lat ? String(groundTruth.lat) : "");
    const [gtLonInput, setGtLonInput] = useState(groundTruth?.lon ? String(groundTruth.lon) : "");
    const [predLatInput, setPredLatInput] = useState(prediction?.lat ? String(prediction.lat) : "");
    const [predLonInput, setPredLonInput] = useState(prediction?.lon ? String(prediction.lon) : "");

    // Kết quả tính toán từ Python Backend
    const [gisResult, setGisResult] = useState(gisError || null);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState("");

    // Danh sách dự đoán Top-K
    const activePredictions = Array.isArray(predictions) && predictions.length > 0 ? predictions : (prediction ? [prediction] : []);

    // Tự động đồng bộ ngay lập tức khi vị trí được chọn (hoặc Ground Truth / gisError) từ Tab 1 thay đổi
    useEffect(() => {
        if (groundTruth?.lat && groundTruth?.lon) {
            setGtLatInput(String(groundTruth.lat));
            setGtLonInput(String(groundTruth.lon));
        }
        if (prediction?.lat && prediction?.lon) {
            setPredLatInput(String(prediction.lat));
            setPredLonInput(String(prediction.lon));
        }
        if (gisError) {
            setGisResult(gisError);
        }
    }, [groundTruth, prediction, gisError]);

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

    // Giá trị hiển thị đồng bộ từ vị trí đã chọn
    const activeGis = gisResult || gisError;

    const effectiveGt = groundTruth?.lat && groundTruth?.lon ? {
        lat: Number(groundTruth.lat),
        lon: Number(groundTruth.lon),
    } : (gtLatInput && gtLonInput ? { lat: parseFloat(gtLatInput), lon: parseFloat(gtLonInput) } : null);

    const effectivePred = prediction ? {
        ...prediction,
        lat: Number(prediction.lat || predLatInput || 0),
        lon: Number(prediction.lon || predLonInput || 0),
    } : (predLatInput && predLonInput ? { lat: parseFloat(predLatInput), lon: parseFloat(predLonInput) } : null);

    const effectiveDistance = activeGis?.distance_km ?? null;
    const effectiveAccuracy = activeGis?.accuracy_label ?? null;

    return (
        <div className="gis-error-tab-layout" aria-label="Giao Diện Đo Đạc Sai Số GIS">
            {/* Khung cấu hình và nhập tọa độ */}
            <div className="gis-control-panel-card">
                <div className="gis-panel-header">
                    <div className="panel-header-title">
                        <div className="gis-title-icon-box">
                            <RulerIcon size={20} className="gis-header-svg" />
                        </div>
                        <h4>Công Cụ Đo Đạc & Thẩm Định Sai Số GIS</h4>
                    </div>
                    <span className="python-badge">Python WGS-84 Geodesic</span>
                </div>

                <p className="gis-panel-desc">
                    Tính toán khoảng cách trắc địa trên elipsoid WGS-84, công thức Haversine mặt cầu, góc phương vị không gian và phân loại cấp độ chính xác theo chuẩn GeoCLIP ICCV.
                </p>

                {/*Nhập tọa độ và dự đoán */}
                <div className="gis-inputs-grid">
                    {/* Tọa độ thực tế*/}
                    <div className="gis-input-card gt-card">
                        <div className="card-sub-header">
                            <div className="sub-icon-box gt-sub-icon">
                                <TargetIcon size={16} />
                            </div>
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

                    {/* Tọa độ AI dự đoán */}
                    <div className="gis-input-card ai-card">
                        <div className="card-sub-header">
                            <div className="sub-icon-box ai-sub-icon">
                                <MapPinIcon size={16} />
                            </div>
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

                {/* Thông báo lỗi  */}
                {validationError ? (
                    <div className="gis-validate-alert" role="alert">
                        <AlertTriangleIcon size={16} />
                        <p>{validationError}</p>
                    </div>
                ) : null}

                {/* Nút tính toán */}
                <div className="gis-action-row">
                    <button
                        type="button"
                        className={`gis-calc-btn ${loading ? "loading" : ""}`}
                        onClick={handleCalculate}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-icon" />
                                <span>ĐANG TÍNH TOÁN...</span>
                            </>
                        ) : (
                            <>
                                <RulerIcon size={16} />
                                <span>ĐO ĐẠC SAI SỐ GIS NGAY</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Đo đạc sai số gis */}
            <GisErrorBanner
                groundTruth={effectiveGt}
                prediction={effectivePred}
                distanceError={effectiveDistance}
                accuracyLevel={effectiveAccuracy}
            />

            {/* Bản đồ leafmap tương tác */}
            <div className="gis-map-section">
                <LeafletMap
                    predictions={activePredictions}
                    groundTruth={effectiveGt}
                    distanceKm={effectiveDistance}
                    selectedPrediction={effectivePred}
                />
            </div>

            {/* Chi tiết chỉ số */}
            {activeGis ? (
                <div className="gis-deep-metrics-card">
                    <div className="deep-metrics-title-row">
                        <CompassIcon size={18} className="deep-title-svg" />
                        <h4>Chi Tiết Thông Số Trắc Địa Không Gian</h4>
                    </div>
                    <div className="metrics-stats-grid">
                        <div className="metric-chip">
                            <span className="m-title">Khoảng cách Geodesic</span>
                            <strong className="m-val highlight-green">
                                {activeGis.formatted_distance || (activeGis.distance_km < 1 ? `${(activeGis.distance_km * 1000).toFixed(0)} mét` : `${activeGis.distance_km.toFixed(2)} km`)}
                            </strong>
                            <small>Chuẩn elipsoid Trái Đất</small>
                        </div>

                        <div className="metric-chip">
                            <span className="m-title">Khoảng cách Haversine (Mặt cầu)</span>
                            <strong className="m-val">
                                {activeGis.haversine_km ? `${activeGis.haversine_km} km` : `${activeGis.distance_km?.toFixed(2)} km`}
                            </strong>
                            <small>Bán kính R = 6,371 km</small>
                        </div>

                        <div className="metric-chip">
                            <span className="m-title">Góc Phương Vị Không Gian </span>
                            <strong className="m-val">
                                {activeGis.bearing_degrees !== undefined ? `${activeGis.bearing_degrees}° (${activeGis.bearing_compass || ""})` : "—"}
                            </strong>
                            <small>Hướng lệch từ Thực tế → AI</small>
                        </div>

                        <div className="metric-chip">
                            <span className="m-title">Phân Cấp Đạt Chuẩn</span>
                            <strong className="m-val badge-text">
                                {activeGis.accuracy_short_label || activeGis.accuracy_label || "Đang thẩm định"}
                            </strong>
                            <small>Chuẩn GeoCLIP ICCV</small>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Bảng xếp hạng dự đoán*/}
            {activePredictions.length > 0 ? (
                <div className="gis-rankings-section">
                    <RankedResultList
                        predictions={activePredictions}
                        topK={5}
                        selectedIndex={selectedIndex}
                        onSelectPrediction={onSelectPrediction}
                    />
                </div>
            ) : null}
        </div>
    );
}

export default React.memo(GisErrorTab);
