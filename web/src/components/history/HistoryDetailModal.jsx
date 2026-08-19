import { X, MapPin, Calendar, Clock, Award, ExternalLink } from "lucide-react";

function HistoryDetailModal({ isOpen, item, onClose }) {
    if (!isOpen || !item) return null;

    return (
        <div className="modal-backdrop-overlay" onClick={onClose}>
            <div className="history-detail-modal-card" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="modal-close-corner-btn"
                    onClick={onClose}
                    title="Đóng"
                >
                    <X size={18} color="#9CA3AF" />
                </button>

                <div className="detail-modal-header">
                    <h3>Chi tiết kết quả nhận diện</h3>
                </div>

                <div className="detail-modal-body">
                    <div className="detail-photo-preview">
                        <img src={item.url} alt={item.name} />
                    </div>

                    <div className="detail-info-content">
                        <h2 className="detail-landmark-title">{item.name}</h2>
                        
                        <div className="detail-meta-row">
                            <MapPin size={16} color="#009080" />
                            <span>{item.location}</span>
                        </div>

                        <div className="detail-stats-grid">
                            <div className="detail-stat-box">
                                <Award size={18} color="#009080" />
                                <div className="stat-box-text">
                                    <span className="stat-box-label">Độ tin cậy</span>
                                    <span className="stat-box-val">{item.confidence}%</span>
                                </div>
                            </div>

                            <div className="detail-stat-box">
                                <Calendar size={18} color="#009080" />
                                <div className="stat-box-text">
                                    <span className="stat-box-label">Ngày tìm kiếm</span>
                                    <span className="stat-box-val">{item.date}</span>
                                </div>
                            </div>
                        </div>

                        {item.description && (
                            <p className="detail-description-text">{item.description}</p>
                        )}
                    </div>
                </div>

                <div className="detail-modal-footer">
                    <button type="button" className="btn-modal-cancel" onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HistoryDetailModal;
