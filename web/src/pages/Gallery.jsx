import { useState, useRef } from "react";
import { Upload, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";
import StorageProgressBar from "../components/gallery/StorageProgressBar";
import PhotoCard from "../components/gallery/PhotoCard";
import ConfirmDeleteModal from "../components/gallery/ConfirmDeleteModal";
import "../css/Gallery.css";

const initialPhotos = [
    // Page 1 (8 photos)
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop",
        note: "Hồ Braies, Dolomites – Ý"
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop",
        note: "Phố cổ Hội An"
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop",
        note: "Cổng trời Bali"
    },
    {
        id: 4,
        url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop",
        note: "Santorini, Hy Lạp"
    },
    {
        id: 5,
        url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&auto=format&fit=crop",
        note: "Tàu đỏ Bernina Express, Thụy Sĩ"
    },
    {
        id: 6,
        url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop",
        note: "Bãi biển Phú Quốc"
    },
    {
        id: 7,
        url: "https://images.unsplash.com/photo-1527838832700-54595d9f4586?w=600&auto=format&fit=crop",
        note: "Cappadocia, Thổ Nhĩ Kỳ"
    },
    {
        id: 8,
        url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop",
        note: "Núi Phú Sĩ, Nhật Bản"
    },

    // Page 2 (8 photos)
    {
        id: 9,
        url: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop",
        note: "Vịnh Hạ Long, Quảng Ninh"
    },
    {
        id: 10,
        url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop",
        note: "Tháp Eiffel, Paris – Pháp"
    },
    {
        id: 11,
        url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&auto=format&fit=crop",
        note: "Tràng An, Ninh Bình"
    },
    {
        id: 12,
        url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&auto=format&fit=crop",
        note: "Taj Mahal, Ấn Độ"
    },
    {
        id: 13,
        url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop",
        note: "Dubai Marina, UAE"
    },
    {
        id: 14,
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop",
        note: "Rừng tre Arashiyama, Kyoto"
    },
    {
        id: 15,
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop",
        note: "Thác Bản Giốc, Cao Bằng"
    },
    {
        id: 16,
        url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop",
        note: "Đảo Bintan, Indonesia"
    },

    // Page 3 (8 photos)
    {
        id: 17,
        url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop",
        note: "Tháp Tokyo, Nhật Bản"
    },
    {
        id: 18,
        url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&auto=format&fit=crop",
        note: "Đảo Boracay, Philippines"
    },
    {
        id: 19,
        url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&auto=format&fit=crop",
        note: "Cầu Vàng, Đà Nẵng"
    },
    {
        id: 20,
        url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop",
        note: "Sa Pa, Lào Cai"
    },
    {
        id: 21,
        url: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=600&auto=format&fit=crop",
        note: "Cổng Torii Fushimi Inari, Kyoto"
    },
    {
        id: 22,
        url: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop",
        note: "Cinque Terre, Ý"
    },
    {
        id: 23,
        url: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&auto=format&fit=crop",
        note: "Kênh đào Venice, Ý"
    },
    {
        id: 24,
        url: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600&auto=format&fit=crop",
        note: "Cao nguyên Mộc Châu"
    },

    // Page 4 (8 photos)
    {
        id: 25,
        url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop",
        note: "Tháp Big Ben, London – Anh"
    },
    {
        id: 26,
        url: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600&auto=format&fit=crop",
        note: "Đà Lạt, Lâm Đồng"
    },
    {
        id: 27,
        url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop",
        note: "Nhà thờ Đức Bà, Paris"
    },
    {
        id: 28,
        url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&auto=format&fit=crop",
        note: "Đền Angkor Wat, Campuchia"
    },
    {
        id: 29,
        url: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&auto=format&fit=crop",
        note: "Cầu Cổng Vàng, San Francisco"
    },
    {
        id: 30,
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop",
        note: "Công viên Yosemite, Mỹ"
    },
    {
        id: 31,
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&auto=format&fit=crop",
        note: "Hồ Louise, Banff – Canada"
    },
    {
        id: 32,
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop",
        note: "Đỉnh Alps, Thụy Sĩ"
    }
];

const ITEMS_PER_PAGE = 8; // 4 columns x 2 rows = 8 images per page

function Gallery() {
    const [photos, setPhotos] = useState(initialPhotos);
    const [currentPage, setCurrentPage] = useState(1);
    const [photoToDelete, setPhotoToDelete] = useState(null);
    const fileInputRef = useRef(null);

    const totalPages = Math.ceil(photos.length / ITEMS_PER_PAGE);

    // Calculate current page items
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentPhotos = photos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleUpdateNote = (id, newNote) => {
        setPhotos((prev) =>
            prev.map((item) => (item.id === id ? { ...item, note: newNote } : item))
        );
    };

    const handleDeleteClick = (id) => {
        const target = photos.find((p) => p.id === id);
        if (target) {
            setPhotoToDelete(target);
        }
    };

    const handleConfirmDelete = () => {
        if (photoToDelete) {
            setPhotos((prev) => prev.filter((item) => item.id !== photoToDelete.id));
            setPhotoToDelete(null);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const newPhoto = {
                id: Date.now(),
                url: URL.createObjectURL(file),
                note: file.name.replace(/\.[^/.]+$/, "") || "Ảnh mới tải lên"
            };
            setPhotos([newPhoto, ...photos]);
            setCurrentPage(1);
        }
    };

    return (
        <div className="gallery-page-container">
            <Sidebar activeMenu="gallery" />
            <div className="gallery-main-content">
                {/* Custom Header with Top Upload Button */}
                <div className="gallery-header-row">
                    <div className="header-titles">
                        <h1 className="header-main-title">Kho ảnh Cá nhân</h1>
                        <p className="header-subtitle">
                            Lưu giữ khoảnh khắc đẹp trong mỗi chuyến đi của bạn.
                        </p>
                    </div>

                    <div className="gallery-top-actions">
                        <button
                            type="button"
                            className="btn-upload-cloud"
                            onClick={handleUploadClick}
                        >
                            <Upload size={18} />
                            <span>Tải ảnh lên</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: "none" }}
                        />
                    </div>
                </div>

                <main className="gallery-body-padding">
                    {/* Storage Usage Progress Bar Card */}
                    <StorageProgressBar usedGB={2.45} totalGB={10} />

                    {/* 4-column Photo Grid (8 items per page) */}
                    <div className="photo-grid-4cols">
                        {currentPhotos.map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                onUpdateNote={handleUpdateNote}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {currentPhotos.length === 0 && (
                        <div className="gallery-empty-state">
                            <ImageIcon size={48} color="#9CA3AF" />
                            <p>Không có ảnh nào trong trang này</p>
                        </div>
                    )}

                    {/* Pagination Footer */}
                    <div className="gallery-pagination-footer">
                        <div className="pagination-buttons-group">
                            <button
                                type="button"
                                className="page-nav-btn"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={18} />
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => {
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

                            <button
                                type="button"
                                className="page-nav-btn"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>

                        <span className="pagination-counter-info">
                            Hiển thị {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, photos.length)} trong tổng số {photos.length} ảnh
                        </span>
                    </div>
                </main>
            </div>

            {/* Custom Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={Boolean(photoToDelete)}
                photo={photoToDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setPhotoToDelete(null)}
            />
        </div>
    );
}

export default Gallery;
