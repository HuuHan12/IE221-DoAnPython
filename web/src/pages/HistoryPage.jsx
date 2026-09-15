import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import HistoryFilterCard from "../components/history/HistoryFilterCard";
import HistoryTable from "../components/history/HistoryTable";
import HistoryDetailModal from "../components/history/HistoryDetailModal";
import ConfirmDeleteModal from "../components/gallery/ConfirmDeleteModal";
import {
    deleteHistory,
    fetchHistory,
    fetchHistoryDetail,
} from "../service/historyService";
import "../css/History.css";

const ITEMS_PER_PAGE = 10;

function formatApiDate(date) {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function HistoryPage() {
    const [historyData, setHistoryData] = useState({
        items: [],
        page: 1,
        page_size: ITEMS_PER_PAGE,
        total_records: 0,
        total_pages: 0,
    });
    const [filters, setFilters] = useState({
        search: "",
        startDate: "",
        endDate: "",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchHistory({
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
                search: filters.search,
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
            setHistoryData(data);
        } catch (loadError) {
            setError(loadError.message || "Không thể tải lịch sử tìm kiếm.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleFilter = ({ landmarkSearch, startDate, endDate }) => {
        setFilters({
            search: landmarkSearch.trim(),
            startDate: formatApiDate(startDate),
            endDate: formatApiDate(endDate),
        });
        setCurrentPage(1);
    };

    const handleReset = () => {
        setFilters({ search: "", startDate: "", endDate: "" });
        setCurrentPage(1);
    };

    const handleViewDetail = async (item) => {
        try {
            const detail = await fetchHistoryDetail(item.id);
            setDetailItem(detail);
        } catch (detailError) {
            setError(detailError.message || "Không thể tải chi tiết lịch sử.");
        }
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await deleteHistory(itemToDelete.id);
            setItemToDelete(null);

            if (historyData.items.length === 1 && currentPage > 1) {
                setCurrentPage((page) => page - 1);
            } else {
                await loadHistory();
            }
        } catch (deleteError) {
            setError(deleteError.message || "Không thể xóa lịch sử.");
        }
    };

    const startIndex = (historyData.page - 1) * historyData.page_size;
    const totalPages = historyData.total_pages;

    return (
        <div className="history-page-container">
            <Sidebar activeMenu="history" />
            <div className="history-main-content">
                <Header
                    title="Lịch sử Tìm kiếm"
                    subtitle="Xem lại các địa danh bạn đã tìm kiếm bằng ảnh."
                />

                <main className="history-body-padding">
                    <HistoryFilterCard onFilter={handleFilter} onReset={handleReset} />

                    {error && (
                        <div className="dashboard-error-banner" role="alert">
                            <span>⚠️</span>
                            <p>{error}</p>
                            <button type="button" onClick={() => setError(null)}>✕</button>
                        </div>
                    )}

                    <div className="history-table-card-section">
                        {loading ? (
                            <div className="api-loading-overlay">
                                <div className="api-loading-spinner"></div>
                                <p>Đang truy vấn lịch sử tìm kiếm từ máy chủ API...</p>
                            </div>
                        ) : (
                            <HistoryTable
                                historyItems={historyData.items}
                                onViewDetail={handleViewDetail}
                                onDeleteItem={setItemToDelete}
                            />
                        )}

                        {!loading && historyData.items.length === 0 && (
                            <div className="history-empty-state">
                                <Clock size={48} color="#9CA3AF" />
                                <p>Không tìm thấy lịch sử tìm kiếm phù hợp</p>
                            </div>
                        )}

                        <div className="history-pagination-footer">
                            <span className="pagination-counter-text">
                                Hiển thị {historyData.total_records > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + historyData.page_size, historyData.total_records)} trong tổng số {historyData.total_records} kết quả
                            </span>

                            <div className="pagination-buttons-group">
                                <button
                                    type="button"
                                    className="page-nav-btn"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    title="Trang đầu"
                                >
                                    <ChevronsLeft size={16} />
                                </button>

                                <button
                                    type="button"
                                    className="page-nav-btn"
                                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                    disabled={currentPage === 1}
                                    title="Trang trước"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                                    const pageNum = index + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            className={`page-num-btn ${currentPage === pageNum ? "active" : ""}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {totalPages > 5 && <span className="pagination-ellipsis">...</span>}

                                {totalPages > 5 && (
                                    <button
                                        type="button"
                                        className={`page-num-btn ${currentPage === totalPages ? "active" : ""}`}
                                        onClick={() => setCurrentPage(totalPages)}
                                    >
                                        {totalPages}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className="page-nav-btn"
                                    onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    title="Trang sau"
                                >
                                    <ChevronRight size={16} />
                                </button>

                                <button
                                    type="button"
                                    className="page-nav-btn"
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    title="Trang cuối"
                                >
                                    <ChevronsRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <ConfirmDeleteModal
                isOpen={Boolean(itemToDelete)}
                photo={itemToDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setItemToDelete(null)}
            />

            <HistoryDetailModal
                isOpen={Boolean(detailItem)}
                item={detailItem}
                onClose={() => setDetailItem(null)}
            />
        </div>
    );
}

export default HistoryPage;
