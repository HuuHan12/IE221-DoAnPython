import { Cloud } from "lucide-react";

function StorageProgressBar({ usedGB = 2.45, totalGB = 10 }) {
    const percentage = ((usedGB / totalGB) * 100).toFixed(1);

    return (
        <div className="storage-card-section">
            <div className="storage-left-info">
                <div className="cloud-icon-circle">
                    <Cloud size={24} color="#009080" />
                </div>
                <div className="storage-text-details">
                    <span className="storage-title-text">Dung lượng đã sử dụng</span>
                    <span className="storage-sub-text">{usedGB.toString().replace('.', ',')} GB / {totalGB} GB</span>
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
