import React, { useState, useEffect, useRef } from "react";
import { Upload, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Sidebar from "../components/Sidebar";
import StorageProgressBar from "../components/gallery/StorageProgressBar";
import PhotoCard from "../components/gallery/PhotoCard";
import ConfirmDeleteModal from "../components/gallery/ConfirmDeleteModal";
import { fetchMediaListApi, uploadMediaApi, updateMediaNoteApi, deleteMediaApi } from "../service/mediaService";
import "../css/Gallery.css";

const ITEMS_PER_PAGE = 8;

function Gallery() {
    const [photos, setPhotos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [photoToDelete, setPhotoToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [totalBytes, setTotalBytes] = useState(0);
    const fileInputRef = useRef(null);

    const loadGallery = async () => {
        try {
            setLoading(true);
            const res = await fetchMediaListApi();
            if (res.items) {
                const mapped = res.items.map((item) => ({
                    id: item.id,
                    url: item.file_url || item.url || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop",
                    note: item.note || item.file_name,
                    file_size: item.file_size || item.size || 0
                }));
                setPhotos(mapped);
                const sum = mapped.reduce((acc, curr) => acc + (typeof curr.file_size === "number" ? curr.file_size : 0), 0);
                setTotalBytes(sum);
            }
        } catch (err) {
            setPhotos([]);
            setTotalBytes(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGallery();
    }, []);

    const totalPages = Math.max(1, Math.ceil(photos.length / ITEMS_PER_PAGE));
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentPhotos = photos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleUpdateNote = async (id, newNote) => {
        setPhotos((prev) =>
            prev.map((item) => (item.id === id ? { ...item, note: newNote } : item))
        );

        try {
            if (typeof id === "string" && !id.startsWith("temp")) {
                await updateMediaNoteApi(id, newNote);
            }
        } catch (err) {
            // Ignore background error
        }
    };

    const handleDeleteClick = (id) => {
        const target = photos.find((p) => p.id === id);
        if (target) {
            setPhotoToDelete(target);
        }
    };

    const handleConfirmDelete = async () => {
        if (photoToDelete) {
            const targetId = photoToDelete.id;
            setPhotos((prev) => prev.filter((item) => item.id !== targetId));
            setPhotoToDelete(null);

            try {
                if (typeof targetId === "string" && !targetId.startsWith("temp")) {
                    await deleteMediaApi(targetId);
                }
            } catch (err) {
                // Ignore background error
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewNote = file.name.replace(/\.[^/.]+$/, "") || "Ảnh mới tải lên";
            const tempPhoto = {
                id: "temp_" + Date.now(),
                url: URL.createObjectURL(file),
                note: previewNote,
                file_size: file.size
            };

            setPhotos([tempPhoto, ...photos]);
            setCurrentPage(1);

            try {
                setUploading(true);
                const res = await uploadMediaApi(file, previewNote);
                if (res?.media?.id) {
                    setPhotos((prev) =>
                        prev.map((p) =>
                            p.id === tempPhoto.id
                                ? { ...p, id: res.media.id, url: res.public_url || p.url }
                                : p
                        )
                    );
                }
            } catch (err) {
                // Keep local preview if upload fails
            } finally {
                setUploading(false);
            }
        }
    };

    const usedGB = Number((totalBytes / (1024 * 1024 * 1024)).toFixed(3)) || 0;

    return (
        <div className="gallery-page-container">
            <Sidebar activeMenu="gallery" />
            <div className="gallery-main-content">
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
                            disabled={uploading}
                        >
                            <Upload size={18} />
                            <span>{uploading ? "Đang tải lên..." : "Tải ảnh lên"}</span>
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
                    <StorageProgressBar usedGB={usedGB} totalGB={10} />

                    {loading ? (
                        <div className="api-loading-overlay">
                            <div className="api-loading-spinner"></div>
                            <p>Đang tải kho ảnh cá nhân từ máy chủ API...</p>
                        </div>
                    ) : (
                        <>
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

                            {currentPhotos.length === 0 && (
                                <div className="gallery-empty-state">
                                    <ImageIcon size={48} color="#9CA3AF" />
                                    <p>Chưa có ảnh nào trong kho cá nhân. Bấm "Tải ảnh lên" để bắt đầu lưu trữ!</p>
                                </div>
                            )}

                            {photos.length > 0 && (
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
                            )}
                        </>
                    )}
                </main>
            </div>

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
