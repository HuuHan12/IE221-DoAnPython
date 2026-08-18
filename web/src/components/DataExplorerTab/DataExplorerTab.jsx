import React, { useState, useEffect, useCallback } from "react";
import { fetchDataExplorerApi, fetchDataRecordsApi } from "../../service/predictService";
import "../../css/DataExplorerTab.css";

const DATASET_OPTIONS = [
    {
        id: "expanded",
        name: "vietnam_landmarks.csv",
        label: "Toàn quốc (26K POIs)",
        icon: "📍",
    },
    {
        id: "iconic",
        name: "vietnam_landmarks_iconic.csv",
        label: "Biểu tượng (68 Địa danh)",
        icon: "🏛️",
    },
    {
        id: "global",
        name: "coordinates_100K.csv",
        label: "Toàn cầu (100K GPS)",
        icon: "🌐",
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

    // Bỏ đầu vào tìm kiếm 
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

    // 1.Nạp explorer
    const loadSummary = useCallback(async () => {
        setLoadingSummary(true);
        setError(null);
        try {
            const data = await fetchDataExplorerApi(dataSource);
            setSummary(data);
        } catch (err) {
            console.error("[Data Explorer Summary Error]", err);
            setError(err.message || "Không thể tải thông tin tệp dữ liệu.");
        } finally {
            setLoadingSummary(false);
        }
    }, [dataSource]);

    // 2. Nạp explorer
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
        <div className="tab-pane-content" aria-label="Khám Phá Dữ Liệu">
            {/* Khám phá dữ liệu */}
            <div className="tab-pane-header">
                <div className="header-text-group">
                    <h3>📊 Khám Phá Dữ Liệu GPS (Data Explorer)</h3>
                    <p>
                        Xem cấu trúc, phân bố địa lý và xem trước nội dung chi tiết của tệp CSV được chọn
                    </p>
                </div>

                {/* Chọn dữ liệu */}
                <div className="dataset-pills-bar" role="tablist" aria-label="Chọn cơ sở dữ liệu GPS">
                    {DATASET_OPTIONS.map((opt) => {
                        const isActive = dataSource === opt.id || (dataSource === "vietnam_iconic" && opt.id === "iconic") || (dataSource === "vietnam_all" && opt.id === "expanded");
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                className={`dataset-pill-btn ${isActive ? "active" : ""}`}
                                onClick={() => handleDatasetSelect(opt.id)}
                            >
                                <span className="pill-icon">{opt.icon}</span>
                                <span className="pill-name">{opt.name}</span>
                                <small className="pill-sub">{opt.label}</small>
                            </button>
                        );
                    })}
                </div>
            </div>

            {error && (
                <div className="explorer-error-alert">
                    <span>⚠️</span>
                    <p>{error}</p>
                </div>
            )}

            {/* Thống kê  */}
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon">{summary?.badge_icon || "🗺️"}</span>
                    <div className="stat-number">
                        {loadingSummary ? "..." : (summary?.total_records?.toLocaleString() || "0")}
                    </div>
                    <div className="stat-label">Tổng Số Tọa Độ GPS</div>
                    <small>{summary?.accuracy_target || "Độ bao phủ dữ liệu"}</small>
                </div>

                <div className="stat-card">
                    <span className="stat-icon">📄</span>
                    <div className="stat-number" style={{ fontSize: "1.15rem", wordBreak: "break-all" }}>
                        {summary?.file_name || "dataset.csv"}
                    </div>
                    <div className="stat-label">Tệp Dữ Liệu CSV</div>
                    <small>{summary?.title || "Cơ sở dữ liệu tọa độ"}</small>
                </div>

                <div className="stat-card">
                    <span className="stat-icon">🗂️</span>
                    <div className="stat-number">
                        {summary?.columns?.length || 0}
                    </div>
                    <div className="stat-label">Thuộc Tính (Columns)</div>
                    <small>
                        {summary?.columns?.join(", ") || "LAT, LON"}
                    </small>
                </div>
            </div>

            {/* Địa lý và hạng mục */}
            <div className="explorer-sections-grid">
                <div className="explorer-card">
                    <h4>🗺️ Phân Bố Không Gian / Khu Vực</h4>
                    {loadingSummary ? (
                        <div className="loading-placeholder">Đang tải phân tích Python...</div>
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

                <div className="explorer-card">
                    <h4>🏷️ Phân Loại Hạng Mục / Đặc Tính</h4>
                    {loadingSummary ? (
                        <div className="loading-placeholder">Đang tải phân tích Python...</div>
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

            {/* Bảng dữ liệu trong csv */}
            <div className="explorer-table-card">
                <div className="table-header-row">
                    <div className="table-title-group">
                        <h4>📋 Bảng Xem Trước Dữ Liệu ({summary?.file_name})</h4>
                        <span className="table-records-badge">
                            {recordsData?.total_records?.toLocaleString() || 0} bản ghi
                        </span>
                    </div>

                    <div className="table-search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, tỉnh, loại hình, tọa độ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="table-search-input"
                        />
                        {search && (
                            <button
                                type="button"
                                className="search-clear-btn"
                                onClick={() => setSearch("")}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* nội dung bảng dữ liệu */}
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
                                    {recordsData.columns.includes("NAME") && <th>Tên Địa Danh</th>}
                                    {recordsData.columns.includes("PROVINCE") && <th>Tỉnh / Thành</th>}
                                    {recordsData.columns.includes("CATEGORY") && <th>Loại Hình</th>}
                                    <th>Vĩ Độ (Lat)</th>
                                    <th>Kinh Độ (Lon)</th>
                                    {recordsData.columns.includes("DESCRIPTION") && <th>Mô Tả</th>}
                                    <th style={{ width: "100px", textAlign: "center" }}>Bản Đồ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recordsData.records.map((row) => (
                                    <tr key={row.index}>
                                        <td className="col-index">{row.index}</td>
                                        {recordsData.columns.includes("NAME") && (
                                            <td className="col-name">
                                                <strong>{row.name || "—"}</strong>
                                            </td>
                                        )}
                                        {recordsData.columns.includes("PROVINCE") && (
                                            <td className="col-province">{row.province || "—"}</td>
                                        )}
                                        {recordsData.columns.includes("CATEGORY") && (
                                            <td className="col-category">
                                                <span className="category-tag">{row.category || "Địa điểm"}</span>
                                            </td>
                                        )}
                                        <td className="col-coord">{row.lat.toFixed(6)}°</td>
                                        <td className="col-coord">{row.lon.toFixed(6)}°</td>
                                        {recordsData.columns.includes("DESCRIPTION") && (
                                            <td className="col-desc">{row.description || "—"}</td>
                                        )}
                                        <td className="col-action" style={{ textAlign: "center" }}>
                                            <a
                                                href={row.gmaps_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="table-map-btn"
                                                title="Xem vị trí trên Google Maps"
                                            >
                                                🗺️ Maps ↗
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="table-empty-box">
                            <span className="empty-icon">📂</span>
                            <p>Không tìm thấy bản ghi nào khớp với từ khóa tìm kiếm.</p>
                        </div>
                    )}
                </div>

                {/* bảng điều khiển trang */}
                {recordsData && recordsData.total_pages > 1 && (
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
                                ← Trang trước
                            </button>

                            <button
                                type="button"
                                className="pagination-btn"
                                disabled={recordsData.page >= recordsData.total_pages || loadingRecords}
                                onClick={() => setPage((p) => Math.min(recordsData.total_pages, p + 1))}
                            >
                                Trang sau →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(DataExplorerTab);
