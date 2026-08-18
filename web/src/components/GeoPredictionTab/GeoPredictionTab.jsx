import React from "react";
import SidebarConfig from "./SidebarConfig";
import UploadSection from "./UploadSection";
import ResultCard from "./ResultCard";

function GeoPredictionTab({
    dataSource,
    setDataSource,
    topK,
    setTopK,
    selectedSample,
    onSelectSample,
    samplePresets,
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
    groundTruth,
    setGroundTruth,
    result,
    selectedPredictionIndex,
    selectedPrediction,
    selectedGisError,
    onSelectPrediction,
    onShare,
}) {
    return (
        <div className="dashboard-main-grid" aria-label="Form Dự Đoán Vị Trí Ảnh">
            {/* CỘT CẤU HÌNH BÊN TRÁI (SIDEBAR) */}
            <div className="grid-sidebar-col">
                <SidebarConfig
                    dataSource={dataSource}
                    setDataSource={setDataSource}
                    topK={topK}
                    setTopK={setTopK}
                    selectedSample={selectedSample}
                    onSelectSample={onSelectSample}
                    samplePresets={samplePresets}
                />
            </div>

            {/* KHUNG NỘI DUNG CHÍNH (2 CỘT) */}
            <div className="grid-two-columns">
                {/* CỘT 1: FORM TẢI ẢNH & NHẬP TỌA ĐỘ */}
                <UploadSection
                    file={file}
                    preview={preview}
                    dragging={dragging}
                    loading={loading}
                    fileInputRef={fileInputRef}
                    onFileChange={onFileChange}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onRemove={onRemove}
                    onPredict={onPredict}
                    groundTruth={groundTruth}
                    setGroundTruth={setGroundTruth}
                />

                {/* CỘT 2: KẾT QUẢ DỰ ĐOÁN & BẢN ĐỒ */}
                <ResultCard
                    result={result}
                    selectedPredictionIndex={selectedPredictionIndex}
                    selectedPrediction={selectedPrediction}
                    selectedGisError={selectedGisError}
                    onSelectPrediction={onSelectPrediction}
                    preview={preview}
                    loading={loading}
                    topK={topK}
                    groundTruth={groundTruth}
                    onShare={onShare}
                />
            </div>
        </div>
    );
}

export default React.memo(GeoPredictionTab);
