import { usePredict } from "../hooks/usePredict";
import GeoPredictionTab from "../components/GeoPredictionTab/GeoPredictionTab";
import DataExplorerTab from "../components/DataExplorerTab/DataExplorerTab";
import GisErrorTab from "../components/GisErrorTab/GisErrorTab";
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
        <main className="dashboard-page-container">
            {/* TOP DASHBOARD HERO HEADER */}
            <header className="dashboard-hero-header">
                <div className="title-row">
                    <span className="hero-globe-icon">🌐</span>
                    <h1 className="hero-title">
                        GeoCLIP Vietnam: <span className="highlight-text">Visual Geo-localization Dashboard</span>
                    </h1>
                </div>

                {/* TABS NAVIGATION */}
                <nav className="dashboard-tabs-nav" aria-label="Tabs điều hướng">
                    <button
                        type="button"
                        className={`tab-item ${activeTab === "predict" ? "active" : ""}`}
                        onClick={() => setActiveTab("predict")}
                    >
                        🚀 Dự Đoán Vị Trí Ảnh
                    </button>
                    <button
                        type="button"
                        className={`tab-item ${activeTab === "explorer" ? "active" : ""}`}
                        onClick={() => setActiveTab("explorer")}
                    >
                        📊 Khám Phá Dữ Liệu <small>(Data Explorer)</small>
                    </button>
                    <button
                        type="button"
                        className={`tab-item ${activeTab === "gis_error" ? "active" : ""}`}
                        onClick={() => setActiveTab("gis_error")}
                    >
                        📐 Đo Đạc Sai Số
                    </button>
                </nav>
            </header>

            {/* ERROR ALERT */}
            {error && (
                <div className="dashboard-error-banner" role="alert">
                    <span>⚠️</span>
                    <p>{error}</p>
                    <button type="button" onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* TAB 1: PREDICTION VIEW (TÁCH THÀNH COMPONENT RIÊNG GeoPredictionTab) */}
            {activeTab === "predict" && (
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
            )}

            {/* TAB 2: DATA EXPLORER (TÁCH THÀNH COMPONENT RIÊNG DataExplorerTab) */}
            {activeTab === "explorer" && (
                <DataExplorerTab
                    dataSource={dataSource}
                    setDataSource={setDataSource}
                />
            )}

            {/* TAB 3: ĐO ĐẠC SAI SỐ GIS (TÁCH THÀNH COMPONENT RIÊNG GisErrorTab) */}
            {activeTab === "gis_error" && (
                <GisErrorTab
                    groundTruth={groundTruth}
                    prediction={selectedPrediction || result?.prediction}
                    predictions={result?.predictions}
                    distanceError={selectedGisError?.distance_km ?? result?.gis_error?.distance_km}
                    accuracyLevel={selectedGisError?.accuracy_label ?? result?.gis_error?.accuracy_label}
                />
            )}
        </main>
    );
}

export default Home;