import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Clock } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import HistoryFilterCard from "../components/history/HistoryFilterCard";
import HistoryTable from "../components/history/HistoryTable";
import HistoryDetailModal from "../components/history/HistoryDetailModal";
import ConfirmDeleteModal from "../components/gallery/ConfirmDeleteModal";
import "../css/History.css";

// Generate 57 mock history records matching the mockup
const generateMockHistory = () => {
    const baseItems = [
        {
            name: "Văn Miếu – Quốc Tử Giám",
            location: "Hà Nội, Việt Nam",
            confidence: 98,
            date: "31/05/2024",
            time: "10:15",
            url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop",
            description: "Văn Miếu – Quốc Tử Giám là quần thể di tích đa dạng và phong phú hàng đầu của thành phố Hà Nội, trường đại học đầu tiên của Việt Nam."
        },
        {
            name: "Nhà thờ Đức Bà Sài Gòn",
            location: "TP. Hồ Chí Minh, Việt Nam",
            confidence: 96,
            date: "30/05/2024",
            time: "16:42",
            url: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&auto=format&fit=crop",
            description: "Vương cung thánh đường Chính tòa Đức Mẹ Vô nhiễm Nguyên tội là nhà thờ chính tòa của Tổng giáo phận Thành phố Hồ Chí Minh."
        },
        {
            name: "Vịnh Hạ Long",
            location: "Quảng Ninh, Việt Nam",
            confidence: 95,
            date: "29/05/2024",
            time: "09:30",
            url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop",
            description: "Vịnh Hạ Long là một vịnh nhỏ thuộc phần bờ tây vịnh Bắc Bộ tại khu vực biển Đông Bắc Việt Nam, di sản thiên nhiên thế giới UNESCO."
        },
        {
            name: "Phố cổ Hội An",
            location: "Quảng Nam, Việt Nam",
            confidence: 93,
            date: "28/05/2024",
            time: "20:05",
            url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop",
            description: "Phố cổ Hội An là một đô thị cổ nằm ở hạ lưu sông Thu Bồn, thuộc vùng đồng bằng ven biển tỉnh Quảng Nam."
        },
        {
            name: "Bà Nà Hills",
            location: "Đà Nẵng, Việt Nam",
            confidence: 92,
            date: "27/05/2024",
            time: "14:18",
            url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop",
            description: "Sun World Ba Na Hills nằm ở độ cao 1.487m so với mực nước biển, được mệnh danh là 'chốn bồng lai tiên cảnh'."
        },
        {
            name: "Chợ Bến Thành",
            location: "TP. Hồ Chí Minh, Việt Nam",
            confidence: 91,
            date: "26/05/2024",
            time: "11:20",
            url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop",
            description: "Chợ Bến Thành là một trong những địa điểm tiêu biểu của Thành phố Hồ Chí Minh."
        },
        {
            name: "Santorini, Hy Lạp",
            location: "Thira, Hy Lạp",
            confidence: 90,
            date: "25/05/2024",
            time: "15:45",
            url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop",
            description: "Santorini là một hòn đảo ở miền nam biển Aegean, nổi tiếng với các ngôi nhà màu trắng mái vòm xanh."
        },
        {
            name: "Chùa Một Cột",
            location: "Hà Nội, Việt Nam",
            confidence: 89,
            date: "24/05/2024",
            time: "08:50",
            url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop",
            description: "Chùa Một Cột là một ngôi chùa cổ ở Hà Nội, có kiến trúc độc đáo hình hoa sen mọc trên cột đá."
        },
        {
            name: "Tháp Rùa - Hồ Hoàn Kiếm",
            location: "Hà Nội, Việt Nam",
            confidence: 88,
            date: "23/05/2024",
            time: "17:10",
            url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop",
            description: "Tháp Rùa nằm ở giữa Hồ Hoàn Kiếm, biểu tượng tinh thần lịch sử ngàn năm văn hiến của Thủ đô."
        },
        {
            name: "Đà Lạt",
            location: "Lâm Đồng, Việt Nam",
            confidence: 87,
            date: "22/05/2024",
            time: "13:30",
            url: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600&auto=format&fit=crop",
            description: "Đà Lạt là thành phố sương mờ nổi tiếng với khí hậu mát mẻ và ngàn hoa khoe sắc."
        }
    ];

    const list = [];
    for (let i = 0; i < 57; i++) {
        const base = baseItems[i % baseItems.length];
        list.push({
            ...base,
            id: i + 1,
            note: base.name
        });
    }
    return list;
};

const ITEMS_PER_PAGE = 10; // 10 items per page

function HistoryPage() {
    const [allHistoryItems, setAllHistoryItems] = useState(generateMockHistory);
    const [filteredItems, setFilteredItems] = useState(allHistoryItems);
    const [currentPage, setCurrentPage] = useState(1);

    const [detailItem, setDetailItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleFilter = ({ landmarkSearch }) => {
        let result = [...allHistoryItems];
        if (landmarkSearch.trim()) {
            result = result.filter((item) =>
                item.name.toLowerCase().includes(landmarkSearch.toLowerCase()) ||
                item.location.toLowerCase().includes(landmarkSearch.toLowerCase())
            );
        }
        setFilteredItems(result);
        setCurrentPage(1);
    };

    const handleReset = () => {
        setFilteredItems(allHistoryItems);
        setCurrentPage(1);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            const updated = allHistoryItems.filter((i) => i.id !== itemToDelete.id);
            setAllHistoryItems(updated);
            setFilteredItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
            setItemToDelete(null);
        }
    };

    return (
        <div className="history-page-container">
            <Sidebar activeMenu="history" />
            <div className="history-main-content">
                <Header
                    title="Lịch sử Tìm kiếm"
                    subtitle="Xem lại các địa danh bạn đã tìm kiếm bằng ảnh."
                    notificationCount={2}
                />

                <main className="history-body-padding">
                    {/* Top Filter Card */}
                    <HistoryFilterCard onFilter={handleFilter} onReset={handleReset} />

                    {/* History Data Table Card */}
                    <div className="history-table-card-section">
                        <HistoryTable
                            historyItems={currentItems}
                            onViewDetail={(item) => setDetailItem(item)}
                            onDeleteItem={(item) => setItemToDelete(item)}
                        />

                        {currentItems.length === 0 && (
                            <div className="history-empty-state">
                                <Clock size={48} color="#9CA3AF" />
                                <p>Không tìm thấy lịch sử tìm kiếm phù hợp</p>
                            </div>
                        )}

                        {/* Pagination Footer */}
                        <div className="history-pagination-footer">
                            <span className="pagination-counter-text">
                                Hiển thị {filteredItems.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length)} trong tổng số {filteredItems.length} kết quả
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
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

            {/* Custom Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={Boolean(itemToDelete)}
                photo={itemToDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setItemToDelete(null)}
            />

            {/* Detail View Modal */}
            <HistoryDetailModal
                isOpen={Boolean(detailItem)}
                item={detailItem}
                onClose={() => setDetailItem(null)}
            />
        </div>
    );
}

export default HistoryPage;
