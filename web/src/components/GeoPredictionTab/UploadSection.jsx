import React, { useState, useEffect } from "react";
import {
    UploadIcon,
    TrashIcon,
    CrosshairIcon,
    ChevronDownIcon,
    SparklesIcon,
    CheckIcon,
    RefreshIcon,
    ImageIcon,
} from "../common/Icons";
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

    const hasGroundTruth = Boolean(groundTruth.lat || groundTruth.lon);

    return (
        <section className="upload-column-card" aria-label="Tải lên ảnh định vị">
            <div className="card-header-bar">
                <div className="card-title-group">
                    <span className="step-indicator-pill">01</span>
                    <h3 className="column-title">Tải Lên Ảnh Cần Định Vị</h3>
                </div>
                <span className="file-format-badge">JPG, PNG, WEBP</span>
            </div>

            <p className="column-subtitle">
                Hệ thống AI sẽ trích xuất vector đặc trưng thị giác để đối soát không gian GPS.
            </p>

            {/* KHU VỰC KÉO THẢ ẢNH */}
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
                                <RefreshIcon size={15} />
                                <span>Đổi ảnh khác</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-dropzone-content">
                        <div className="upload-icon-circle">
                            <UploadIcon size={24} className="dropzone-svg-icon" />
                        </div>
                        <h4 className="upload-heading">
                            {dragging ? "Thả file ảnh vào đây" : "Kéo & thả file ảnh vào đây"}
                        </h4>
                        <p className="upload-hint">hoặc bấm vào để duyệt file từ thiết bị</p>
                        <button
                            type="button"
                            className="browse-button"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                        >
                            <span>Chọn tệp ảnh</span>
                        </button>
                        <span className="upload-specs">Kích thước tối đa: 10 MB</span>
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

            {/* FILE CHIP THÔNG TIN */}
            {file ? (
                <div className="file-info-chip">
                    <div className="file-info-left">
                        <div className="file-icon-box">
                            <ImageIcon size={16} />
                        </div>
                        <div className="file-texts">
                            <span className="file-name">{file.name || "sample_image.jpg"}</span>
                            <span className="file-size">
                                {file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Ảnh mẫu kiểm thử"}
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
                        <TrashIcon size={15} />
                    </button>
                </div>
            ) : null}

            {/* GROUND TRUTH ACCORDION */}
            <div className="gt-accordion">
                <button
                    type="button"
                    className="gt-accordion-header"
                    onClick={() => setGtOpen((prev) => !prev)}
                    aria-expanded={gtOpen}
                >
                    <div className="gt-header-left">
                        <CrosshairIcon size={16} className="gt-svg-icon" />
                        <strong>So Sánh Với Tọa Độ Thực Tế</strong>
                        <span className="gt-optional-badge">Tùy chọn</span>
                    </div>
                    <ChevronDownIcon
                        size={16}
                        className={`accordion-chevron-icon ${gtOpen ? "open" : ""}`}
                    />
                </button>

                {gtOpen ? (
                    <div className="gt-accordion-body">
                        <p className="gt-description">
                            Nhập <strong>Vĩ độ (Lat)</strong> và <strong>Kinh độ (Lon)</strong> thực tế để đo đạc sai số trắc địa Geodesic WGS-84 tự động.
                        </p>
                        <div className="gt-inputs-grid">
                            <div className="gt-input-group">
                                <label htmlFor="gt-lat">Vĩ độ thực tế (Latitude):</label>
                                <input
                                    id="gt-lat"
                                    type="number"
                                    step="any"
                                    placeholder="VD: 10.795000"
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
                                    placeholder="VD: 106.721500"
                                    value={groundTruth.lon}
                                    onChange={(e) =>
                                        setGroundTruth((prev) => ({ ...prev, lon: e.target.value }))
                                    }
                                    className="gt-input"
                                />
                            </div>
                        </div>

                        {hasGroundTruth ? (
                            <div className="gt-quick-actions">
                                <span className="gt-current-tag">
                                    <CheckIcon size={14} className="check-svg" />
                                    <span>Tọa độ thực tế: <strong>{groundTruth.lat || 0}°, {groundTruth.lon || 0}°</strong></span>
                                </span>
                                <button
                                    type="button"
                                    className="gt-clear-btn"
                                    onClick={() => setGroundTruth({ lat: "", lon: "" })}
                                >
                                    Xóa
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {/* NÚT BẮT ĐẦU ĐỊNH VỊ */}
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
                            <span>Đang định vị vị trí AI...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon size={18} />
                            <span>BẮT ĐẦU ĐỊNH VỊ VỊ TRÍ</span>
                        </>
                    )}
                </button>
            </div>
        </section>
    );
}

export default React.memo(UploadSection);
