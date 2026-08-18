import React, { useState, useEffect, useCallback } from "react";
import {
    fetchDataExplorerApi,
    fetchDataRecordsApi,
} from "../../service/predictService";
import {
    LayersIcon,
    GlobeIcon,
    ExternalLinkIcon,
    SearchIcon,
    DatabaseIcon,
    AlertTriangleIcon,
} from "../common/Icons";
import "../../css/DataExplorerTab.css";

const DATASET_OPTIONS = [
    {
        id: "expanded",
        name: "vietnam_landmarks.csv",
        label: "Toàn quốc",
        count: "26.3K POIs",
    },
    {
        id: "iconic",
        name: "vietnam_landmarks_iconic.csv",
        label: "Biểu tượng",
        count: "68 Địa Danh",
    },
    {
        id: "global",
        name: "coordinates_100K.csv",
        label: "Toàn cầu",
        count: "100K GPS",
    },
];

function DataExplorerTab({ dataSource = "expanded", setDataSource }) {
    const [summary, setSummary] = useState(null);
    const [recordsData, setRecordsData] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [error, setError] = useState(null);

    // Trạng thái lọc và phân trang
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Debounce tìm kiếm
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    // Đặt lại trang khi nguồn dữ liệu thay đổi
    useEffect(() => {
        setPage(1);
        setSearch("");
    }, [dataSource]);

    // 1. Nạp tóm tắt thống kê từ Python Backend
    const loadSummary = useCallback(async () => {
        setLoadingSummary(true);
        setError(null);
        try {
            const data = await fetchDataExplorerApi(dataSource);
            setSummary(data);
        } catch (err) {
            console.error("[Data Explorer Summary Error]", err);
            setError(err.message || "Không thể tải thông tin tệp dữ liệu từ máy chủ.");
        } finally {
            setLoadingSummary(false);
        }
    }, [dataSource]);

    // 2. Nạp bản ghi phân trang từ Python Backend
    const loadRecords = useCallback(async () => {
        setLoadingRecords(true);
        try {
            const data = await fetchDataRecordsApi(dataSource, page, pageSize, debouncedSearch);
            setRecordsData(data);
        } catch (err) {
            console.error("[Data Explorer Records Error]", err);
        } finally {
            setLoadingRecords(false);
        }
    }, [dataSource, page, debouncedSearch]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    useEffect(() => {
        loadRecords();
    }, [loadRecords]);

    const handleDatasetSelect = (id) => {
        if (setDataSource) {
            setDataSource(id);
        }
    };

    return (
        <div className="tab-pane-content" aria-label="Khám Phá Dữ Liệu GPS">
            {/* TIÊU ĐỀ & THANH CHỌN DATASET */}
            <div className="tab-pane-header">
                <div className="header-text-group">
                    <div className="explorer-title-row">
                        <div className="explorer-icon-box">
                            <LayersIcon size={20} className="explorer-header-svg" />
                        </div>
                        <h3>Khám Phá Dữ Liệu GPS (Data Explorer)</h3>
                    </div>
                    <p>
                        Xem cấu trúc, phân bố địa lý và xem trước nội dung chi tiết của tệp CSV được chọn.
                    </p>
                </div>

                {/* THANH CHỌN DATASET DẠNG PILLS */}
                <div className="dataset-pills-bar" role="tablist" aria-label="Chọn cơ sở dữ liệu GPS">
                    {DATASET_OPTIONS.map((opt) => {
                        const isActive =
                            dataSource === opt.id ||
                            (dataSource === "vietnam_iconic" && opt.id === "iconic") ||
                            (dataSource === "vietnam_all" && opt.id === "expanded");
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                className={`dataset-pill-btn ${isActive ? "active" : ""}`}
                                onClick={() => handleDatasetSelect(opt.id)}
                            >
                                <DatabaseIcon size={16} className="pill-svg-icon" />
                                <span className="pill-name">{opt.name}</span>
                                <span className="pill-count-tag">{opt.count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ALERT BÁO LỖI NẾU CÓ */}
            {error ? (
                <div className="explorer-error-alert" role="alert">
                    <AlertTriangleIcon size={18} />
                    <p>{error}</p>
                </div>
            ) : null}

            {/* THỐNG KÊ TỔNG QUAN (STATS CARDS) */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Tổng Số Tọa Độ GPS</span>
                        <div className="stat-icon-circle">
                            <GlobeIcon size={18} />
                        </div>
                    </div>
                    <div className="stat-number">
                        {loadingSummary ? "..." : (summary?.total_records?.toLocaleString() || "0")}
                    </div>
                    <small className="stat-subtitle">{summary?.accuracy_target || "Độ bao phủ dữ liệu"}</small>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Tệp Dữ Liệu Đang Chọn</span>
                        <div className="stat-icon-circle">
                            <DatabaseIcon size={18} />
                        </div>
                    </div>
                    <div className="stat-number stat-filename">
                        {summary?.file_name || "dataset.csv"}
                    </div>
                    <small className="stat-subtitle">{summary?.title || "Cơ sở dữ liệu tọa độ"}</small>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-label">Thuộc Tính (Columns)</span>
                        <div className="stat-icon-circle">
                            <LayersIcon size={18} />
                        </div>
                    </div>
                    <div className="stat-number">
                        {summary?.columns?.length || 0}
                    </div>
                    <div className="columns-pill-list">
                        {summary?.columns && summary.columns.length > 0 ? (
                            summary.columns.map((col) => (
                                <span key={col} className="col-pill">{col}</span>
                            ))
                        ) : (
                            <small className="stat-subtitle">LAT, LON</small>
                        )}
                    </div>
                </div>
            </div>

            {/* PHÂN BỐ KHU VỰC VÀ HẠNG MỤC */}
            <div className="explorer-sections-grid">
                {/* 1. Phân bố không gian / Tỉnh thành */}
                <div className="explorer-card">
                    <div className="explorer-card-header">
                        <div className="card-dot-marker teal-dot" />
                        <h4>Phân Bố Không Gian / Khu Vực</h4>
                    </div>
                    {loadingSummary ? (
                        <div className="loading-placeholder">
                            <div className="ai-loader-ring" />
                            <span>Đang phân tích không gian bằng Python...</span>
                        </div>
                    ) : summary?.regions && summary.regions.length > 0 ? (
                        <ul className="distrib-list">
                            {summary.regions.map((reg) => (
                                <li key={reg.name} className="distrib-item">
                                    <div className="distrib-info">
                                        <span className="distrib-name">{reg.name}</span>
                                        <span className="distrib-count">{reg.count?.toLocaleString()} điểm</span>
                                    </div>
                                    <div className="distrib-progress-wrap">
                                        <div
                                            className="distrib-progress-bar"
                                            style={{ width: reg.percentage }}
                                        />
                                    </div>
                                    <strong className="distrib-pct">{reg.percentage}</strong>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-stat-text">Không có dữ liệu phân bố tỉnh thành.</p>
                    )}
                </div>

                {/* 2. Phân loại hạng mục */}
                <div className="explorer-card">
                    <div className="explorer-card-header">
                        <div className="card-dot-marker blue-dot" />
                        <h4>Phân Loại Hạng Mục / Đặc Tính</h4>
                    </div>
                    {loadingSummary ? (
                        <div className="loading-placeholder">
                            <div className="ai-loader-ring" />
                            <span>Đang phân loại danh mục bằng Python...</span>
                        </div>
                    ) : summary?.categories && summary.categories.length > 0 ? (
                        <ul className="distrib-list">
                            {summary.categories.map((cat) => (
                                <li key={cat.name} className="distrib-item">
                                    <div className="distrib-info">
                                        <span className="distrib-name">{cat.name}</span>
                                        <span className="distrib-count">{cat.count?.toLocaleString()} điểm</span>
                                    </div>
                                    <div className="distrib-progress-wrap">
                                        <div
                                            className="distrib-progress-bar category-bar"
                                            style={{ width: cat.percentage }}
                                        />
                                    </div>
                                    <strong className="distrib-pct">{cat.percentage}</strong>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="empty-stat-text">Không có dữ liệu phân loại.</p>
                    )}
                </div>
            </div>

            {/* BẢNG DỮ LIỆU TRỰC TIẾP (LIVE DATA TABLE) */}
            <div className="explorer-table-card">
                <div className="table-header-row">
                    <div className="table-title-group">
                        <h4>Bảng Xem Trước Dữ Liệu ({summary?.file_name || "dataset.csv"})</h4>
                        <span className="table-records-badge">
                            {recordsData?.total_records?.toLocaleString() || 0} bản ghi
                        </span>
                    </div>

                    <div className="table-search-box">
                        <SearchIcon size={16} className="search-svg-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, tỉnh, loại hình, tọa độ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="table-search-input"
                        />
                        {search ? (
                            <button
                                type="button"
                                className="search-clear-btn"
                                onClick={() => setSearch("")}
                                aria-label="Xóa từ khóa tìm kiếm"
                            >
                                ✕
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* BẢNG RESPONSIVE */}
                <div className="table-responsive-wrapper">
                    {loadingRecords ? (
                        <div className="table-loading-box">
                            <div className="ai-loader-ring" />
                            <p>Đang tải dữ liệu từ máy chủ Python...</p>
                        </div>
                    ) : recordsData?.records && recordsData.records.length > 0 ? (
                        <table className="explorer-data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "60px" }}>STT</th>
                                    {recordsData.columns.includes("NAME") ? <th>Tên Địa Danh</th> : null}
                                    {recordsData.columns.includes("PROVINCE") ? <th>Tỉnh / Thành</th> : null}
                                    {recordsData.columns.includes("CATEGORY") ? <th>Loại Hình</th> : null}
                                    <th>Vĩ Độ (Lat)</th>
                                    <th>Kinh Độ (Lon)</th>
                                    {recordsData.columns.includes("DESCRIPTION") ? <th>Mô Tả</th> : null}
                                    <th style={{ width: "110px", textAlign: "center" }}>Bản Đồ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recordsData.records.map((row) => (
                                    <tr key={row.index}>
                                        <td className="col-index">{row.index}</td>
                                        {recordsData.columns.includes("NAME") ? (
                                            <td className="col-name">
                                                <strong>{row.name || "—"}</strong>
                                            </td>
                                        ) : null}
                                        {recordsData.columns.includes("PROVINCE") ? (
                                            <td className="col-province">{row.province || "—"}</td>
                                        ) : null}
                                        {recordsData.columns.includes("CATEGORY") ? (
                                            <td className="col-category">
                                                <span className="category-tag">{row.category || "Địa điểm"}</span>
                                            </td>
                                        ) : null}
                                        <td className="col-coord">{row.lat.toFixed(6)}°</td>
                                        <td className="col-coord">{row.lon.toFixed(6)}°</td>
                                        {recordsData.columns.includes("DESCRIPTION") ? (
                                            <td className="col-desc">{row.description || "—"}</td>
                                        ) : null}
                                        <td className="col-action" style={{ textAlign: "center" }}>
                                            <a
                                                href={row.gmaps_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="table-map-btn"
                                                title="Xem vị trí trên Google Maps"
                                            >
                                                <ExternalLinkIcon size={13} />
                                                <span>Maps</span>
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="table-empty-box">
                            <p>Không tìm thấy bản ghi nào khớp với từ khóa tìm kiếm.</p>
                        </div>
                    )}
                </div>

                {/* PHÂN TRANG */}
                {recordsData && recordsData.total_pages > 1 ? (
                    <div className="table-pagination-bar">
                        <span className="pagination-info">
                            Trang <strong>{recordsData.page}</strong> / <strong>{recordsData.total_pages}</strong> (Tổng <strong>{recordsData.total_records.toLocaleString()}</strong> kết quả)
                        </span>

                        <div className="pagination-btn-group">
                            <button
                                type="button"
                                className="pagination-btn"
                                disabled={recordsData.page <= 1 || loadingRecords}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Trang trước
                            </button>

                            <button
                                type="button"
                                className="pagination-btn"
                                disabled={recordsData.page >= recordsData.total_pages || loadingRecords}
                                onClick={() => setPage((p) => Math.min(recordsData.total_pages, p + 1))}
                            >
                                Trang sau
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default React.memo(DataExplorerTab);
