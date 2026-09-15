import React from "react";
import { Info, Loader2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const PALETTE = [
    "#009080",
    "#36B3A0",
    "#FFB800",
    "#FF9900",
    "#8ADAD3",
    "#6366F1",
    "#EC4899",
    "#14B8A6",
    "#8B5CF6",
    "#9CA3AF",
];

function CategoryDonutChart({ apiCategoriesData, totalSearches: propTotalSearches, loading = false }) {
    // Chuẩn hóa dữ liệu từ CategoryDistributionItem (category_id, name, count, percentage)
    const rawCategories = apiCategoriesData || [];

    const categories = rawCategories.map((item, idx) => ({
        name: item.name || "Khác",
        count: item.count || 0,
        percentage: `${item.percentage ?? 0}%`,
        rawPercentage: item.percentage ?? 0,
        value: item.count || 0,
        color: PALETTE[idx % PALETTE.length],
    }));

    const calculatedTotal = categories.reduce((sum, item) => sum + item.count, 0);
    const displayTotal = propTotalSearches !== undefined && propTotalSearches !== null
        ? propTotalSearches
        : calculatedTotal;

    return (
        <div className="chart-card-section half-width">
            <div className="chart-card-header">
                <div className="chart-title-with-info">
                    <h3>Cơ cấu lượt tìm kiếm theo danh mục</h3>
                    <Info size={16} className="info-icon" title="Tỷ lệ phân bổ các danh mục địa danh theo lượt tìm kiếm" />
                    {loading && (
                        <Loader2 size={16} className="animate-spin" color="#009080" style={{ marginLeft: 8 }} />
                    )}
                </div>
            </div>

            <div className="donut-chart-container-flex">
                {/* Left: Recharts Donut Pie Chart with center text */}
                <div className="donut-graphic-wrapper">
                    {categories.length === 0 ? (
                        <div style={{ display: "flex", height: 260, alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: "14px" }}>
                            Chưa có dữ liệu danh mục
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={categories}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={105}
                                        paddingAngle={categories.length > 1 ? 3 : 0}
                                        stroke="none"
                                    >
                                        {categories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name, item) => [
                                            `${item.payload.percentage} (${Number(value).toLocaleString("vi-VN")} lượt)`,
                                            name,
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Donut Center Label Overlay */}
                            <div className="donut-center-label">
                                <span className="donut-label-title">Tổng</span>
                                <span className="donut-label-value">{displayTotal.toLocaleString("vi-VN")}</span>
                                <span className="donut-label-unit">lượt tìm kiếm</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Legend Breakdown List */}
                <div className="category-legend-list">
                    {categories.length === 0 ? (
                        <div style={{ color: "#9CA3AF", fontSize: "13px", padding: "16px" }}>
                            Không có dữ liệu trong kỳ
                        </div>
                    ) : (
                        categories.map((cat, idx) => (
                            <div key={idx} className="category-legend-item">
                                <div className="legend-left">
                                    <span
                                        className="legend-color-dot"
                                        style={{ backgroundColor: cat.color }}
                                    ></span>
                                    <span className="legend-name-text" title={cat.name}>{cat.name}</span>
                                </div>
                                <span className="legend-percentage-val">{cat.percentage}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="donut-footer-note">
                <Info size={14} color="#9CA3AF" />
                <span>Số liệu được tổng hợp thực tế theo danh mục từ người dùng</span>
            </div>
        </div>
    );
}

export default CategoryDonutChart;
