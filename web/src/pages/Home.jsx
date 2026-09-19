import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Sparkles, LogIn, UserPlus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { usePredict } from "../hooks/usePredict";
import GeoPredictionTab from "../components/GeoPredictionTab/GeoPredictionTab";
import DataExplorerTab from "../components/DataExplorerTab/DataExplorerTab";
import GisErrorTab from "../components/GisErrorTab/GisErrorTab";
import { GlobeIcon, SparklesIcon, LayersIcon, RulerIcon } from "../components/common/Icons";
import "../css/Home.css";

function Home() {
    const navigate = useNavigate();
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
        isLoggedIn,
        guestScanUsed,
        showGuestLimitModal,
        setShowGuestLimitModal,
    } = usePredict();

    return (
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
            <Sidebar activeMenu="scan" />
            <div style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
                <main className="dashboard-page-container">
                    {/* BANNER THÔNG BÁO CHO KHÁCH VÃNG LAI */}
                    {!isLoggedIn && (
                        <div className={`guest-status-banner ${guestScanUsed ? "limit-reached" : "trial-mode"}`}>
                            <div className="guest-banner-left">
                                {guestScanUsed ? <Lock size={18} /> : <Sparkles size={18} />}
                                <span>
                                    {guestScanUsed
                                        ? "Bạn đã sử dụng hết 1 lượt quét thử nghiệm miễn phí. Hãy đăng nhập để tiếp tục nhận diện không giới hạn!"
                                        : "Chế độ trải nghiệm khách vãng lai: Bạn có 1 lượt quét ảnh thử nghiệm miễn phí."}
                                </span>
                            </div>
                            <div className="guest-banner-actions">
                                <Link to="/login" className="btn-guest-login">
                                    <LogIn size={15} />
                                    <span>Đăng nhập</span>
                                </Link>
                                <Link to="/register" className="btn-guest-register">
                                    <UserPlus size={15} />
                                    <span>Đăng ký</span>
                                </Link>
                            </div>
                        </div>
                    )}

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
            {/* MODAL THÔNG BÁO HẾT LƯỢT QUÉT CHO KHÁCH VÃNG LAI */}
            {showGuestLimitModal && (
                <div className="guest-modal-overlay" onClick={() => setShowGuestLimitModal(false)}>
                    <div className="guest-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="guest-modal-icon-badge">
                            <Lock size={32} color="#0d9488" />
                        </div>
                        <h2 className="guest-modal-title">Hết Lượt Quét Thử Nghiệm</h2>
                        <p className="guest-modal-description">
                            Bạn đã sử dụng hết <strong>1 lượt quét ảnh miễn phí</strong> dành cho khách vãng lai.
                            Để tiếp tục nhận diện địa danh Việt Nam, xem toạ độ bản đồ và lưu trữ lịch sử, vui lòng đăng nhập vào tài khoản của bạn.
                        </p>
                        <div className="guest-modal-actions">
                            <button
                                type="button"
                                className="btn-modal-login"
                                onClick={() => navigate("/login")}
                            >
                                <LogIn size={18} />
                                <span>Đăng nhập ngay</span>
                            </button>
                            <button
                                type="button"
                                className="btn-modal-register"
                                onClick={() => navigate("/register")}
                            >
                                <UserPlus size={18} />
                                <span>Tạo tài khoản mới</span>
                            </button>
                        </div>
                        <button
                            type="button"
                            className="btn-modal-close"
                            onClick={() => setShowGuestLimitModal(false)}
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            )}
        </main>
            </div>
        </div>
    );
}

export default React.memo(Home);