import { LoaderCircle, Trash2, X } from "lucide-react";

function ConfirmDeleteModal({ isOpen, photo, pending = false, error = "", onConfirm, onCancel }) {
    if (!isOpen || !photo) return null;

    return (
        <div className="modal-backdrop-overlay" onClick={onCancel}>
            <div
                className="confirm-modal-card"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="modal-close-corner-btn"
                    onClick={onCancel}
                    disabled={pending}
                    title="Đóng"
                >
                    <X size={18} color="#9CA3AF" />
                </button>

                <div className="modal-icon-badge">
                    <Trash2 size={26} color="#EF4444" />
                </div>

                <h3 className="modal-title-text">Xác nhận xóa ảnh</h3>
                
                <p className="modal-description-text">
                    Bạn có chắc chắn muốn xóa ảnh <strong>"{photo.note || "Ảnh này"}"</strong> khỏi kho cá nhân? Hành động này không thể hoàn tác.
                </p>

                {error && <p className="modal-error-message" role="alert">{error}</p>}

                <div className="modal-actions-row">
                    <button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={onCancel}
                        disabled={pending}
                    >
                        Hủy
                    </button>
                    
                    <button
                        type="button"
                        className="btn-modal-delete"
                        onClick={onConfirm}
                        disabled={pending}
                        aria-busy={pending}
                    >
                        {pending ? <LoaderCircle className="spin-animation" size={16} /> : <Trash2 size={16} />}
                        <span>{pending ? "Đang xóa..." : "Xóa ảnh"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;
