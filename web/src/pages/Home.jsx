import React from "react";
import Sidebar from "../components/Sidebar";
import { usePredict } from "../hooks/usePredict";
import GeoPredictionTab from "../components/GeoPredictionTab/GeoPredictionTab";
import DataExplorerTab from "../components/DataExplorerTab/DataExplorerTab";
import GisErrorTab from "../components/GisErrorTab/GisErrorTab";
import { GlobeIcon, SparklesIcon, LayersIcon, RulerIcon } from "../components/common/Icons";
import "../css/Home.css";

function Home() {
    const {
        fileInputRef,
        activeTab,
        setActiveTab,
        dataSource,
        setDataSource,
        topK,
        setTopK,
        selectedSample,
        handleSelectSample,
        file,
        preview,
        result,
        selectedPredictionIndex,
        selectedPrediction,
        selectedGisError,
        handleSelectPrediction,
        loading,
        error,
        setError,
        dragging,
        groundTruth,
        setGroundTruth,
        handleFileChange,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handlePredict,
        handleRemove,
        handleShare,
        samplePresets,
    } = usePredict();

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            <Sidebar activeMenu="overview" />
            <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
                <main className="dashboard-page-container">
            {/* Tiêu đề */}
            <header className="dashboard-hero-header">
                <div className="title-row">
                    <div className="header-logo-icon-box">
                        <GlobeIcon size={22} className="header-svg-logo" />
                    </div>
                    <h1 className="hero-title">
                        GeoCLIP Vietnam: <span className="highlight-text">Visual Geo-localization Dashboard</span>
                    </h1>
                </div>

                {/* Thanh điều hướng*/}
                <nav className="dashboard-tabs-nav" aria-label="Tabs điều hướng">
                    <button
                        type="button"
                        className={`tab-item ${activeTab === "predict" ? "active" : ""}`}
                        onClick={() => setActiveTab("predict")}
                    >
                        <SparklesIcon size={16} />
                        <span>Dự Đoán Vị Trí Ảnh</span>
                    </button>
                    <button
                        type="button"
                        className={`tab-item ${activeTab === "explorer" ? "active" : ""}`}
                        onClick={() => setActiveTab("explorer")}
                    >
                        <LayersIcon size={16} />
                        <span>Khám Phá Dữ Liệu <small>(Data Explorer)</small></span>
                    </button>
                    <button
                        type="button"
                        className={`tab-item ${activeTab === "gis_error" ? "active" : ""}`}
                        onClick={() => setActiveTab("gis_error")}
                    >
                        <RulerIcon size={16} />
                        <span>Đo Đạc Sai Số</span>
                    </button>
                </nav>
            </header>

            {/* Thông báo lỗi */}
            {error ? (
                <div className="dashboard-error-banner" role="alert">
                    <span>⚠️</span>
                    <p>{error}</p>
                    <button type="button" onClick={() => setError(null)}>✕</button>
                </div>
            ) : null}

            {/* Dự đoán vị trí ảnh  */}
            {activeTab === "predict" ? (
                <GeoPredictionTab
                    dataSource={dataSource}
                    setDataSource={setDataSource}
                    topK={topK}
                    setTopK={setTopK}
                    selectedSample={selectedSample}
                    onSelectSample={handleSelectSample}
                    samplePresets={samplePresets}
                    file={file}
                    preview={preview}
                    dragging={dragging}
                    loading={loading}
                    fileInputRef={fileInputRef}
                    onFileChange={handleFileChange}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                    onPredict={handlePredict}
                    groundTruth={groundTruth}
                    setGroundTruth={setGroundTruth}
                    result={result}
                    selectedPredictionIndex={selectedPredictionIndex}
                    selectedPrediction={selectedPrediction}
                    selectedGisError={selectedGisError}
                    onSelectPrediction={handleSelectPrediction}
                    onShare={handleShare}
                />
            ) : null}

            {/* Khám phá dữ liệu */}
            {activeTab === "explorer" ? (
                <DataExplorerTab
                    dataSource={dataSource}
                    setDataSource={setDataSource}
                />
            ) : null}

            {/* Đo đạc sai số */}
            {activeTab === "gis_error" ? (
                <GisErrorTab
                    groundTruth={groundTruth}
                    prediction={selectedPrediction || result?.prediction}
                    predictions={result?.predictions}
                    gisError={selectedGisError ?? result?.gis_error}
                    selectedIndex={selectedPredictionIndex}
                    onSelectPrediction={handleSelectPrediction}
                />
            ) : null}
        </main>
            </div>
        </div>
    );
}

export default React.memo(Home);