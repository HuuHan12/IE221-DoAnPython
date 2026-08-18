import { TrendingUp } from "lucide-react";

function StatCard({ title, value, percentage, icon: IconComponent, iconBgColor, iconColor }) {
    return (
        <div className="stat-card-item">
            <div className="stat-card-left">
                <div
                    className="stat-icon-wrapper"
                    style={{ backgroundColor: iconBgColor || "#E6F4F1" }}
                >
                    <IconComponent size={24} color={iconColor || "#009080"} />
                </div>
                <div className="stat-info">
                    <span className="stat-title-label">{title}</span>
                    <h3 className="stat-value-number">{value}</h3>
                    <div className="stat-percentage-row">
                        <TrendingUp size={14} color="#10B981" />
                        <span className="stat-percentage-text">
                            <strong>{percentage}</strong> so với kỳ trước
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatCard;
