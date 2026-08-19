import { Trash2, AlertTriangle, X } from "lucide-react";

function ConfirmDeleteModal({ isOpen, photo, onConfirm, onCancel }) {
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

                <div className="modal-actions-row">
                    <button
                        type="button"
                        className="btn-modal-cancel"
                        onClick={onCancel}
                    >
                        Hủy
                    </button>
                    
                    <button
                        type="button"
                        className="btn-modal-delete"
                        onClick={onConfirm}
                    >
                        <Trash2 size={16} />
                        <span>Xóa ảnh</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;
