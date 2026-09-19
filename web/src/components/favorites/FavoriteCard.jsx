import { MapPin, Map as MapIcon, Trash2, Heart, Calendar } from "lucide-react";

function formatSavedDate(dateStr) {
    if (!dateStr) return null;
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return null;
    }
}

function FavoriteCard({ landmark, onSelectOnMap, onDelete, isSelectedOnMap }) {
    const savedDate = formatSavedDate(landmark.created_at);
    const fallbackImage = "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&auto=format&fit=crop";

    return (
        <div className={`favorite-card-item ${isSelectedOnMap ? "selected-map-focus" : ""}`}>
            <div className="favorite-photo-container">
                <img
                    src={landmark.url || fallbackImage}
                    alt={landmark.name}
                    className="favorite-photo-img"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackImage;
                    }}
                />
                <div className="heart-badge-circle" title="Địa điểm đã yêu thích">
                    <Heart size={16} fill="#EF4444" color="#EF4444" />
                </div>
            </div>

            <div className="favorite-card-content">
                <h3 className="favorite-landmark-title" title={landmark.name}>{landmark.name}</h3>
                
                <div className="favorite-location-subtext">
                    <MapPin size={13} color="#009080" />
                    <span>{landmark.province || "Việt Nam"}</span>
                    {savedDate ? (
                        <>
                            <span style={{ color: "#cbd5e1" }}>•</span>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Lưu {savedDate}</span>
                        </>
                    ) : null}
                </div>

                {landmark.description ? (
                    <p
                        style={{
                            fontSize: "12px",
                            color: "#64748b",
                            margin: "4px 0 0 0",
                            lineHeight: "1.4",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {landmark.description}
                    </p>
                ) : null}

                <div className="favorite-card-actions">
                    <button
                        type="button"
                        className={`btn-view-on-map ${isSelectedOnMap ? "active" : ""}`}
                        onClick={() => onSelectOnMap(landmark)}
                    >
                        <MapIcon size={14} />
                        <span>Xem trên bản đồ</span>
                    </button>

                    <button
                        type="button"
                        className="btn-delete-landmark"
                        onClick={() => onDelete(landmark)}
                        title="Bỏ yêu thích"
                    >
                        <Trash2 size={15} color="#EF4444" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FavoriteCard;
