import { MapPin, Eye, Trash2, Heart } from "lucide-react";

function HistoryTable({
    historyItems,
    onViewDetail,
    onDeleteItem,
    favoritePlaceIds = new Set(),
    onToggleFavorite = null,
}) {
    return (
        <div className="history-table-container">
            <table className="history-table">
                <thead>
                    <tr>
                        <th className="col-photo">Ảnh đã quét</th>
                        <th className="col-landmark">Tên địa danh</th>
                        <th className="col-confidence">Độ tin cậy</th>
                        <th className="col-date">Ngày tìm kiếm</th>
                        <th className="col-actions">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {historyItems.map((item) => (
                        <tr key={item.id} className="history-table-row">
                            {/* Photo Thumbnail */}
                            <td className="col-photo">
                                <div className="history-photo-wrapper">
                                    <img
                                        src={item.url}
                                        alt={item.name}
                                        className="history-photo-img"
                                        loading="lazy"
                                    />
                                </div>
                            </td>

                            {/* Landmark Name & Subtitle */}
                            <td className="col-landmark">
                                <div className="landmark-title-group">
                                    <h4 className="landmark-title-name">{item.name}</h4>
                                    <div className="landmark-location-subtitle">
                                        <MapPin size={16} color="#4B5563" />
                                        <span>{item.location}</span>
                                    </div>
                                </div>
                            </td>

                            {/* Confidence Progress Bar */}
                            <td className="col-confidence">
                                <div className="confidence-cell-wrapper">
                                    <span className="confidence-num-text">
                                        {item.confidence !== null && item.confidence !== undefined
                                            ? `${item.confidence}%`
                                            : "—"}
                                    </span>
                                    <div className="confidence-bar-track">
                                        <div
                                            className="confidence-bar-fill"
                                            style={{ width: `${item.confidence || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </td>

                            {/* Date & Time */}
                            <td className="col-date">
                                <div className="date-time-stack">
                                    <span className="date-text">{item.date}</span>
                                    <span className="time-text">{item.time}</span>
                                </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="col-actions">
                                <div className="table-actions-group">
                                    {item.place_id && onToggleFavorite ? (
                                        <button
                                            type="button"
                                            className={`action-table-btn fav-btn ${favoritePlaceIds.has(item.place_id) ? "active" : ""}`}
                                            onClick={() => onToggleFavorite(item.place_id, item.input_media_id)}
                                            title={favoritePlaceIds.has(item.place_id) ? "Bỏ yêu thích" : "Lưu vào yêu thích"}
                                            style={{
                                                backgroundColor: favoritePlaceIds.has(item.place_id) ? "#fef2f2" : "transparent",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: "4px 6px",
                                                borderRadius: "8px",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 0.2s ease",
                                            }}
                                        >
                                            <Heart
                                                size={19}
                                                fill={favoritePlaceIds.has(item.place_id) ? "#EF4444" : "none"}
                                                color={favoritePlaceIds.has(item.place_id) ? "#EF4444" : "#9CA3AF"}
                                            />
                                        </button>
                                    ) : null}

                                    <button
                                        type="button"
                                        className="action-table-btn view-btn"
                                        onClick={() => onViewDetail(item)}
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={20} color="#009080" />
                                    </button>

                                    <button
                                        type="button"
                                        className="action-table-btn delete-btn"
                                        onClick={() => onDeleteItem(item)}
                                        title="Xóa lịch sử"
                                    >
                                        <Trash2 size={20} color="#EF4444" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default HistoryTable;
