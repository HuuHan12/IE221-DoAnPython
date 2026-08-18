import React, { useState, useEffect } from "react";
import "../../css/UploadSection.css";

function UploadSection({
    file,
    preview,
    dragging,
    loading,
    fileInputRef,
    onFileChange,
    onDragOver,
    onDragLeave,
    onDrop,
    onRemove,
    onPredict,
    groundTruth = { lat: "", lon: "" },
    setGroundTruth,
}) {
    const [gtOpen, setGtOpen] = useState(true);


    useEffect(() => {
        if (groundTruth.lat || groundTruth.lon) {
            setGtOpen(true);
        }
    }, [groundTruth.lat, groundTruth.lon]);

    return (
        <section className="upload-column-card" aria-label="Tải lên ảnh định vị">
            <div className="card-header-bar">
                <h3 className="column-title">1. Tải lên Ảnh Cần Định Vị</h3>
                <span className="step-badge">Bước 1</span>
            </div>
            <p className="column-subtitle">
                Kéo thả hoặc chọn file ảnh (JPG, PNG, WEBP tối đa 10MB):
            </p>

            {/* khu kéo thả*/}
            <div
                className={`upload-dropzone ${dragging ? "dragging" : ""} ${preview ? "has-preview" : ""}`}
                onDragOver={onDragOver}
                onDragEnter={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !preview && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && !preview && fileInputRef.current?.click()}
            >
                {preview ? (
                    <div className="preview-container">
                        <img src={preview} alt="Ảnh cần định vị" className="preview-image" />
                        <div className="preview-overlay">
                            <button
                                type="button"
                                className="change-image-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                            >
                                🔄 Đổi ảnh khác
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-dropzone-content">
                        <div className="upload-icon-circle">
                            <span className="upload-arrow">⭡</span>
                        </div>
                        <h4 className="upload-heading">
                            {dragging ? "Thả file ảnh vào đây" : "Kéo & thả file ảnh vào đây"}
                        </h4>
                        <p className="upload-hint">hoặc</p>
                        <button
                            type="button"
                            className="browse-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                        >
                            📁 Chọn ảnh từ thiết bị
                        </button>
                        <span className="upload-specs">Hỗ trợ JPG, PNG, WEBP (Tối đa 10MB)</span>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onFileChange}
                    className="hidden-file-input"
                    aria-label="Chọn file ảnh"
                />
            </div>

            {/* chọn file thông tin bên dưới */}
            {file && (
                <div className="file-info-chip">
                    <div className="file-info-left">
                        <span className="file-icon">🖼️</span>
                        <div className="file-texts">
                            <span className="file-name">{file.name || "sample_image.jpg"}</span>
                            <span className="file-size">
                                {file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Ảnh mẫu có sẵn"}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="remove-btn"
                        onClick={onRemove}
                        title="Xoá ảnh này"
                        aria-label="Xoá ảnh"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* vĩ độ và kinh độ thực tế*/}
            <div className="gt-accordion">
                <button
                    type="button"
                    className="gt-accordion-header"
                    onClick={() => setGtOpen((prev) => !prev)}
                    aria-expanded={gtOpen}
                >
                    <span className="gt-header-left">
                        <span className="gt-icon">📍</span>
                        <strong>So Sánh Với Tọa Độ Thực Tế</strong>
                        <small>(Ground Truth Validation)</small>
                    </span>
                    <span className={`accordion-chevron ${gtOpen ? "open" : ""}`}>▾</span>
                </button>

                {gtOpen && (
                    <div className="gt-accordion-body">
                        <p className="gt-description">
                            Nhập <strong>Vĩ độ (Latitude)</strong> và <strong>Kinh độ (Longitude)</strong> thực tế để hệ thống tự động tính sai số không gian (Haversine Error km):
                        </p>
                        <div className="gt-inputs-grid">
                            <div className="gt-input-group">
                                <label htmlFor="gt-lat">Vĩ độ thực tế (Latitude):</label>
                                <input
                                    id="gt-lat"
                                    type="number"
                                    step="any"
                                    placeholder="VD: 20.91005"
                                    value={groundTruth.lat}
                                    onChange={(e) =>
                                        setGroundTruth((prev) => ({ ...prev, lat: e.target.value }))
                                    }
                                    className="gt-input"
                                />
                            </div>
                            <div className="gt-input-group">
                                <label htmlFor="gt-lon">Kinh độ thực tế (Longitude):</label>
                                <input
                                    id="gt-lon"
                                    type="number"
                                    step="any"
                                    placeholder="VD: 107.18390"
                                    value={groundTruth.lon}
                                    onChange={(e) =>
                                        setGroundTruth((prev) => ({ ...prev, lon: e.target.value }))
                                    }
                                    className="gt-input"
                                />
                            </div>
                        </div>
                        {(groundTruth.lat || groundTruth.lon) && (
                            <div className="gt-quick-actions">
                                <span className="gt-current-tag">
                                    ✓ Đã nạp tọa độ thực tế: <strong>{groundTruth.lat || 0}°, {groundTruth.lon || 0}°</strong>
                                </span>
                                <button
                                    type="button"
                                    className="gt-clear-btn"
                                    onClick={() => setGroundTruth({ lat: "", lon: "" })}
                                >
                                    Xoá tọa độ
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* nut dự đoán */}
            <div className="predict-action-container">
                <button
                    type="button"
                    className={`predict-button ${loading ? "loading" : ""}`}
                    onClick={onPredict}
                    disabled={!file || loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-icon" />
                            ĐANG ĐỊNH VỊ VỊ TRÍ AI...
                        </>
                    ) : (
                        <>
                            <span className="search-icon">🔍</span>
                            BẮT ĐẦU ĐỊNH VỊ VỊ TRÍ
                        </>
                    )}
                </button>
            </div>
        </section>
    );
}

export default React.memo(UploadSection);
