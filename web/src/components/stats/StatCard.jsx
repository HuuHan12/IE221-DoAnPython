import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function StatCard({
    title,
    value,
    growthPercentage,
    isIncrease,
    percentage,
    icon: IconComponent,
    iconBgColor,
    iconColor
}) {
    const formattedValue = typeof value === "number" ? value.toLocaleString("vi-VN") : value;

    const renderGrowthIndicator = () => {
        if (growthPercentage !== undefined && growthPercentage !== null) {
            const pct = Number(growthPercentage);
            if (pct === 0) {
                return (
                    <div className="stat-percentage-row">
                        <Minus size={14} color="#6B7280" />
                        <span className="stat-percentage-text" style={{ color: "#6B7280" }}>
                            <strong>0%</strong> so với kỳ trước
                        </span>
                    </div>
                );
            }
            if (isIncrease) {
                return (
                    <div className="stat-percentage-row">
                        <TrendingUp size={14} color="#10B981" />
                        <span className="stat-percentage-text" style={{ color: "#10B981" }}>
                            <strong>+{pct}%</strong> so với kỳ trước
                        </span>
                    </div>
                );
            }
            return (
                <div className="stat-percentage-row">
                    <TrendingDown size={14} color="#EF4444" />
                    <span className="stat-percentage-text" style={{ color: "#EF4444" }}>
                        <strong>-{pct}%</strong> so với kỳ trước
                    </span>
                </div>
            );
        }

        // Fallback for custom or legacy string percentage
        return (
            <div className="stat-percentage-row">
                <TrendingUp size={14} color="#10B981" />
                <span className="stat-percentage-text">
                    <strong>{percentage || "Đang cập nhật"}</strong> {percentage?.includes?.("%") ? "so với kỳ trước" : ""}
                </span>
            </div>
        );
    };

    return (
        <div className="stat-card-item">
            <div className="stat-card-left">
                <div
                    className="stat-icon-wrapper"
                    style={{ backgroundColor: iconBgColor || "#E6F4F1" }}
                >
                    {IconComponent && <IconComponent size={24} color={iconColor || "#009080"} />}
                </div>
                <div className="stat-info">
                    <span className="stat-title-label">{title}</span>
                    <h3 className="stat-value-number">{formattedValue}</h3>
                    {renderGrowthIndicator()}
                </div>
            </div>
        </div>
    );
}

export default StatCard;
