import { MapPin, Map as MapIcon, Trash2, Heart } from "lucide-react";

function FavoriteCard({ landmark, onSelectOnMap, onDelete, isSelectedOnMap }) {
    return (
        <div className={`favorite-card-item ${isSelectedOnMap ? "selected-map-focus" : ""}`}>
            <div className="favorite-photo-container">
                <img
                    src={landmark.url}
                    alt={landmark.name}
                    className="favorite-photo-img"
                    loading="lazy"
                />
                <div className="heart-badge-circle" title="Địa điểm đã yêu thích">
                    <Heart size={16} fill="#EF4444" color="#EF4444" />
                </div>
            </div>

            <div className="favorite-card-content">
                <h3 className="favorite-landmark-title">{landmark.name}</h3>
                
                <div className="favorite-location-subtext">
                    <MapPin size={14} color="#6B7280" />
                    <span>{landmark.province}</span>
                </div>

                <div className="favorite-card-actions">
                    <button
                        type="button"
                        className={`btn-view-on-map ${isSelectedOnMap ? "active" : ""}`}
                        onClick={() => onSelectOnMap(landmark)}
                    >
                        <MapIcon size={15} />
                        <span>Xem trên bản đồ</span>
                    </button>

                    <button
                        type="button"
                        className="btn-delete-landmark"
                        onClick={() => onDelete(landmark)}
                        title="Bỏ yêu thích"
                    >
                        <Trash2 size={16} color="#EF4444" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FavoriteCard;
