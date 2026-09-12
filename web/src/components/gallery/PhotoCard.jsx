import { useEffect, useState } from "react";
import { Check, Edit2, ImageOff, LoaderCircle, Trash2 } from "lucide-react";
import { getApiErrorMessage } from "../../service/mediaService";

function PhotoCard({ photo, onUpdateNote, onDelete, disabled = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [noteText, setNoteText] = useState(photo.note ?? "");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    useEffect(() => {
        if (!isEditing) {
            setNoteText(photo.note ?? "");
        }
    }, [isEditing, photo.note]);

    const handleSaveNote = async () => {
        if (saving || disabled) return;

        setSaveError("");
        setSaving(true);
        try {
            if (onUpdateNote) {
                await onUpdateNote(photo.id, noteText);
            }
            setIsEditing(false);
        } catch (error) {
            setSaveError(getApiErrorMessage(error, "Không thể cập nhật ghi chú. Vui lòng thử lại."));
            setIsEditing(true);
        } finally {
            setSaving(false);
        }
    };

    const imageUrl = typeof photo.url === "string" && photo.url.trim() ? photo.url : null;

    return (
        <div className="photo-card-item">
            <div className="photo-image-wrapper">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={photo.note || photo.file_name || "Ảnh trong kho cá nhân"}
                        className="photo-img-element"
                        loading="lazy"
                    />
                ) : (
                    <div className="photo-missing-image" role="img" aria-label="Ảnh không có đường dẫn">
                        <ImageOff size={30} />
                        <span>Ảnh không khả dụng</span>
                    </div>
                )}
            </div>

            <div className="photo-card-body">
                <span className="photo-note-label">Ghi chú</span>

                <div className="photo-note-row">
                    <input
                        type="text"
                        className={`photo-note-input ${isEditing ? "editing" : ""}`}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        readOnly={!isEditing || saving || disabled}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSaveNote();
                            }
                        }}
                    />

                    <div className="photo-card-actions">
                        {isEditing ? (
                            <button
                                type="button"
                                className="action-icon-btn save-btn"
                                onClick={handleSaveNote}
                                disabled={saving || disabled}
                                title="Lưu ghi chú"
                            >
                                {saving ? <LoaderCircle className="spin-animation" size={16} color="#009080" /> : <Check size={16} color="#009080" />}
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="action-icon-btn edit-btn"
                                onClick={() => setIsEditing(true)}
                                disabled={disabled}
                                title="Sửa ghi chú"
                            >
                                <Edit2 size={16} color="#009080" />
                            </button>
                        )}

                        <button
                            type="button"
                            className="action-icon-btn delete-btn"
                            onClick={() => onDelete(photo.id)}
                            disabled={disabled || saving}
                            title="Xóa ảnh"
                        >
                            <Trash2 size={16} color="#EF4444" />
                        </button>
                    </div>
                </div>

                {saveError && <span className="photo-action-error" role="alert">{saveError}</span>}
            </div>
        </div>
    );
}

export default PhotoCard;
