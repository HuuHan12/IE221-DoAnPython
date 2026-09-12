import { Cloud } from "lucide-react";

function StorageProgressBar({ usedGB = 2.45, totalGB = 10 }) {
    const safeUsedGB = Number.isFinite(Number(usedGB)) && Number(usedGB) >= 0 ? Number(usedGB) : 0;
    const safeTotalGB = Number.isFinite(Number(totalGB)) && Number(totalGB) > 0 ? Number(totalGB) : 1;
    const percentage = Math.min(100, Math.max(0, (safeUsedGB / safeTotalGB) * 100)).toFixed(1);

    return (
        <div className="storage-card-section">
            <div className="storage-left-info">
                <div className="cloud-icon-circle">
                    <Cloud size={24} color="#009080" />
                </div>
                <div className="storage-text-details">
                    <span className="storage-title-text">Dung lượng đã sử dụng</span>
                    <span className="storage-sub-text">{safeUsedGB.toString().replace('.', ',')} GB / {safeTotalGB} GB</span>
                </div>
            </div>

            <div className="storage-bar-middle">
                <div className="storage-bar-track">
                    <div
                        className="storage-bar-fill"
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="storage-right-percentage">
                <span><strong>{percentage}%</strong> đã sử dụng</span>
            </div>
        </div>
    );
}

export default StorageProgressBar;
