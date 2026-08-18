import { useState } from "react";
import { Edit2, Trash2, Check } from "lucide-react";

function PhotoCard({ photo, onUpdateNote, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [noteText, setNoteText] = useState(photo.note);

    const handleSaveNote = () => {
        setIsEditing(false);
        if (onUpdateNote) {
            onUpdateNote(photo.id, noteText);
        }
    };

    return (
        <div className="photo-card-item">
            <div className="photo-image-wrapper">
                <img
                    src={photo.url}
                    alt={photo.note}
                    className="photo-img-element"
                    loading="lazy"
                />
            </div>

            <div className="photo-card-body">
                <span className="photo-note-label">Ghi chú</span>

                <div className="photo-note-row">
                    <input
                        type="text"
                        className={`photo-note-input ${isEditing ? "editing" : ""}`}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        readOnly={!isEditing}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveNote();
                        }}
                    />

                    <div className="photo-card-actions">
                        {isEditing ? (
                            <button
                                type="button"
                                className="action-icon-btn save-btn"
                                onClick={handleSaveNote}
                                title="Lưu ghi chú"
                            >
                                <Check size={16} color="#009080" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="action-icon-btn edit-btn"
                                onClick={() => setIsEditing(true)}
                                title="Sửa ghi chú"
                            >
                                <Edit2 size={16} color="#009080" />
                            </button>
                        )}

                        <button
                            type="button"
                            className="action-icon-btn delete-btn"
                            onClick={() => onDelete(photo.id)}
                            title="Xóa ảnh"
                        >
                            <Trash2 size={16} color="#EF4444" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PhotoCard;
