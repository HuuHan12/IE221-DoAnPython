import { Info } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const categories = [
    { name: "Di tích lịch sử", percentage: "34,6%", value: 14424, color: "#009080" },
    { name: "Văn hóa", percentage: "25,7%", value: 10714, color: "#36B3A0" },
    { name: "Kiến trúc", percentage: "17,8%", value: 7421, color: "#FFB800" },
    { name: "Danh lam thắng cảnh", percentage: "13,2%", value: 5503, color: "#FF9900" },
    { name: "Ẩm thực", percentage: "5,3%", value: 2210, color: "#8ADAD3" },
    { name: "Khác", percentage: "3,4%", value: 1417, color: "#D1D5DB" },
];

function CategoryDonutChart() {
    return (
        <div className="chart-card-section half-width">
            <div className="chart-card-header">
                <div className="chart-title-with-info">
                    <h3>Cơ cấu lượt tìm kiếm theo danh mục</h3>
                    <Info size={16} className="info-icon" title="Tỷ lệ phân bổ các danh mục địa danh" />
                </div>
            </div>

            <div className="donut-chart-container-flex">
                {/* Left: Recharts Donut Pie Chart with center text */}
                <div className="donut-graphic-wrapper">
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
                                paddingAngle={3}
                                stroke="none"
                            >
                                {categories.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name, item) => [
                                    `${item.payload.percentage} (${value.toLocaleString()} lượt)`,
                                    name
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Donut Center Label Overlay */}
                    <div className="donut-center-label">
                        <span className="donut-label-title">Tổng</span>
                        <span className="donut-label-value">41.689</span>
                        <span className="donut-label-unit">lượt tìm kiếm</span>
                    </div>
                </div>

                {/* Right: Legend Breakdown List */}
                <div className="category-legend-list">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="category-legend-item">
                            <div className="legend-left">
                                <span
                                    className="legend-color-dot"
                                    style={{ backgroundColor: cat.color }}
                                ></span>
                                <span className="legend-name-text">{cat.name}</span>
                            </div>
                            <span className="legend-percentage-val">{cat.percentage}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="donut-footer-note">
                <Info size={14} color="#9CA3AF" />
                <span>Số liệu được tổng hợp từ tất cả người dùng</span>
            </div>
        </div>
    );
}

export default CategoryDonutChart;
