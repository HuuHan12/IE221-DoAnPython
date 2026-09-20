import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Image as ImageIcon, RefreshCw, Upload } from "lucide-react";
import Sidebar from "../components/Sidebar";
import PhotoCard from "../components/gallery/PhotoCard";
import ConfirmDeleteModal from "../components/gallery/ConfirmDeleteModal";
import {
    deleteMediaApi,
    fetchMediaListApi,
    getApiErrorMessage,
    updateMediaNoteApi,
    uploadMediaApi,
} from "../service/mediaService";
import "../css/Gallery.css";

const ITEMS_PER_PAGE = 8;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function normalizeFileSize(value) {
    const size = Number(value);
    return Number.isFinite(size) && size >= 0 ? size : 0;
}

export function normalizeMediaItem(item) {
    if (!item || typeof item !== "object") return null;

    const id = item.id ?? item.media_id;
    if (id === undefined || id === null || id === "") return null;

    const rawUrl = item.file_url ?? item.url ?? item.public_url;
    const url = typeof rawUrl === "string" && rawUrl.trim() ? rawUrl : null;
    const fileName = item.file_name || "Ảnh trong kho cá nhân";

    return {
        id: String(id),
        gallery_id: item.gallery_id ?? item.gallery?.id,
        url,
        note: item.note ?? fileName,
        file_size: normalizeFileSize(item.file_size ?? item.size),
        file_name: fileName,
        mime_type: item.mime_type,
        storage_path: item.storage_path,
        place_id: item.place_id,
        taken_at: item.taken_at,
        created_at: item.created_at,
    };
}

function normalizeUploadedMedia(response, fallbackNote) {
    const media = response?.media;
    const gallery = response?.gallery;
    if (!media?.id || !gallery?.id) {
        throw new Error("Máy chủ trả về dữ liệu ảnh chưa đầy đủ. Vui lòng thử lại.");
    }

    const item = normalizeMediaItem({
        ...media,
        gallery_id: gallery.id,
        note: gallery.note ?? fallbackNote ?? media.file_name,
        file_url: response.public_url ?? media.file_url,
    });

    if (!item?.url) {
        throw new Error("Máy chủ không trả về đường dẫn ảnh có thể hiển thị.");
    }

    return item;
}

function validateImageFile(file) {
    if (!file) {
        throw new Error("Vui lòng chọn một ảnh để tải lên.");
    }

    if (!ALLOWED_CONTENT_TYPES.has((file.type || "").toLowerCase())) {
        throw new Error("Chỉ hỗ trợ ảnh JPEG, PNG hoặc WEBP.");
    }

    if (!file.size) {
        throw new Error("Không thể tải lên file ảnh rỗng.");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("Kích thước ảnh không được vượt quá 10 MiB.");
    }
}

function Gallery() {
    const [photos, setPhotos] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [photoToDelete, setPhotoToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [loadError, setLoadError] = useState("");
    const [actionError, setActionError] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [retryFile, setRetryFile] = useState(null);
    const fileInputRef = useRef(null);
    const loadRequestRef = useRef(0);

    const loadGallery = useCallback(async () => {
        const requestId = ++loadRequestRef.current;
        setLoading(true);
        setLoadError("");

        try {
            const response = await fetchMediaListApi();
            if (!Array.isArray(response?.items)) {
                throw new Error("Dữ liệu kho ảnh từ máy chủ không hợp lệ.");
            }

            const mapped = response.items.map(normalizeMediaItem).filter(Boolean);
            if (requestId !== loadRequestRef.current) return;
            setPhotos(mapped);
            setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil(mapped.length / ITEMS_PER_PAGE))));
        } catch (error) {
            if (requestId !== loadRequestRef.current) return;
            setLoadError(getApiErrorMessage(error, "Không thể tải kho ảnh. Vui lòng thử lại."));
        } finally {
            if (requestId === loadRequestRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadGallery();
        return () => {
            // In development StrictMode mounts effects twice. Invalidate the
            // first request so its response/finally cannot overwrite state.
            loadRequestRef.current += 1;
        };
    }, [loadGallery]);

    const totalPages = Math.max(1, Math.ceil(photos.length / ITEMS_PER_PAGE));
    const busy = loading || uploading || Boolean(deletingId);
    const uploadDisabled = busy || Boolean(loadError);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentPhotos = photos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const handleUploadClick = () => {
        if (!uploadDisabled) {
            fileInputRef.current?.click();
        }
    };

    const processUpload = useCallback(async (file) => {
        if (loading || uploading || deletingId || loadError) return;

        try {
            validateImageFile(file);
        } catch (error) {
            setRetryFile(file);
            setActionError(getApiErrorMessage(error, "File ảnh không hợp lệ."));
            return;
        }

        setUploading(true);
        setActionError("");

        try {
            const previewNote = file.name.replace(/\.[^/.]+$/, "") || "Ảnh mới tải lên";
            const response = await uploadMediaApi(file, previewNote);
            const uploadedPhoto = normalizeUploadedMedia(response, previewNote);
            setPhotos((previous) => [uploadedPhoto, ...previous]);
            setCurrentPage(1);
            setRetryFile(null);
        } catch (error) {
            setRetryFile(file);
            setActionError(getApiErrorMessage(error, "Tải ảnh lên thất bại. Vui lòng thử lại."));
        } finally {
            setUploading(false);
        }
    }, [deletingId, loadError, loading, uploading]);

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        // Clear immediately so selecting the same file retries the request.
        event.target.value = "";
        if (file) {
            processUpload(file);
        }
    };

    const handleRetryUpload = () => {
        if (retryFile && !loadError) {
            processUpload(retryFile);
        } else if (!loadError) {
            handleUploadClick();
        }
    };

    const handleUpdateNote = async (id, newNote) => {
        setRetryFile(null);
        try {
            const response = await updateMediaNoteApi(id, newNote);
            setPhotos((previous) => previous.map((photo) => (
                photo.id === id ? { ...photo, note: newNote } : photo
            )));
            setActionError("");
            return response;
        } catch (error) {
            setActionError(getApiErrorMessage(error, "Không thể cập nhật ghi chú ảnh."));
            throw error;
        }
    };

    const handleDeleteClick = (id) => {
        if (busy) return;
        const target = photos.find((photo) => photo.id === id);
        if (target) {
            setPhotoToDelete(target);
            setActionError("");
            setDeleteError("");
        }
    };

    const handleConfirmDelete = async () => {
        if (!photoToDelete || deletingId) return;

        const targetId = photoToDelete.id;
        setDeletingId(targetId);
        setActionError("");
        setDeleteError("");
        setRetryFile(null);

        try {
            await deleteMediaApi(targetId);
            setPhotos((previous) => previous.filter((photo) => photo.id !== targetId));
            setPhotoToDelete(null);
        } catch (error) {
            setDeleteError(getApiErrorMessage(error, "Không thể xóa ảnh. Vui lòng thử lại."));
        } finally {
            setDeletingId(null);
        }
    };

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
                            disabled={uploadDisabled}
                        >
                            <Upload size={18} />
                            <span>{uploading ? "Đang tải lên..." : "Tải ảnh lên"}</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploadDisabled}
                            style={{ display: "none" }}
                        />
                    </div>
                </div>

                <main className="gallery-body-padding">
                    {actionError && (
                        <div className="gallery-alert gallery-alert-error" role="alert">
                            <AlertCircle size={18} />
                            <span>{actionError}</span>
                            <button type="button" onClick={handleRetryUpload} disabled={busy || Boolean(loadError) || !retryFile}>
                                Thử lại
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="api-loading-overlay">
                            <div className="api-loading-spinner"></div>
                            <p>Đang tải kho ảnh cá nhân từ máy chủ API...</p>
                        </div>
                    )}

                    {!loading && loadError && (
                        <div className="gallery-error-state" role="alert">
                            <AlertCircle size={42} color="#DC2626" />
                            <p>{loadError}</p>
                            <button type="button" className="gallery-retry-btn" onClick={loadGallery} disabled={busy}>
                                <RefreshCw size={16} />
                                Tải lại kho ảnh
                            </button>
                        </div>
                    )}

                    {!loading && !loadError && (
                        <>
                            <div className="photo-grid-4cols">
                                {currentPhotos.map((photo) => (
                                    <PhotoCard
                                        key={photo.id}
                                        photo={photo}
                                        onUpdateNote={handleUpdateNote}
                                        onDelete={handleDeleteClick}
                                        disabled={busy}
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
                                            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                                            disabled={busy || currentPage === 1}
                                            aria-label="Trang trước"
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
                                                    disabled={busy}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            className="page-nav-btn"
                                            onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}
                                            disabled={busy || currentPage === totalPages}
                                            aria-label="Trang sau"
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
                pending={Boolean(deletingId)}
                error={deleteError}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    if (!deletingId) {
                        setPhotoToDelete(null);
                        setDeleteError("");
                    }
                }}
            />
        </div>
    );
}

export default Gallery;
