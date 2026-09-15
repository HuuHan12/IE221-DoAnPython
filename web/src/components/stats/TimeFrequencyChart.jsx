import React, { useState, useRef, useEffect } from "react";
import { Info, ChevronDown, Check, Loader2 } from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

function formatPeriodLabel(period, groupBy) {
    if (!period) return "";
    // If format is YYYY-MM-DD
    if (period.includes("-") && period.length === 10) {
        const parts = period.split("-");
        return `${parts[2]}/${parts[1]}`;
    }
    // If format is YYYY-Www
    if (period.includes("-W")) {
        const weekNum = period.split("-W")[1];
        return `Tuần ${weekNum}`;
    }
    // If format is YYYY-MM
    if (period.includes("-") && period.length === 7) {
        const parts = period.split("-");
        return `T${parts[1]}/${parts[0]}`;
    }
    return period;
}

function TimeFrequencyChart({
    apiTrendsData,
    groupBy = "day",
    onGroupByChange,
    loading = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const modeLabels = {
        day: "Theo ngày",
        week: "Theo tuần",
        month: "Theo tháng",
    };

    const currentFilterLabel = modeLabels[groupBy] || "Theo ngày";

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectGroupBy = (selectedGroup) => {
        setIsOpen(false);
        if (onGroupByChange && selectedGroup !== groupBy) {
            onGroupByChange(selectedGroup);
        }
    };

    // Chuẩn hóa dữ liệu vẽ biểu đồ từ API SearchTrendItem (period, total)
    const chartData = (apiTrendsData || []).map((item) => {
        const periodStr = item.period || item.date || "";
        const countVal = item.total !== undefined ? item.total : (item.count || item.value || 0);
        return {
            period: periodStr,
            date: formatPeriodLabel(periodStr, groupBy),
            value: countVal,
        };
    });

    const totalPeriodSearches = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="chart-card-section">
            <div className="chart-card-header">
                <div className="chart-title-with-info">
                    <h3>Tần suất tìm kiếm theo thời gian</h3>
                    <Info size={16} className="info-icon" title="Tần suất lượt tìm kiếm được thống kê động theo mốc thời gian" />
                    {loading && (
                        <Loader2 size={16} className="animate-spin" color="#009080" style={{ marginLeft: 8 }} />
                    )}
                </div>

                <div className="chart-filter-dropdown-wrapper" ref={dropdownRef}>
                    <button
                        type="button"
                        className={`chart-filter-dropdown ${isOpen ? "active" : ""}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span>{currentFilterLabel}</span>
                        <ChevronDown size={16} className={`chevron-icon ${isOpen ? "rotate" : ""}`} />
                    </button>

                    {isOpen && (
                        <div className="chart-filter-menu-popup">
                            <div className="preset-options-list">
                                {[
                                    { key: "day", label: "Theo ngày" },
                                    { key: "week", label: "Theo tuần" },
                                    { key: "month", label: "Theo tháng" },
                                ].map((option) => (
                                    <div
                                        key={option.key}
                                        className={`preset-option-item ${groupBy === option.key ? "selected" : ""}`}
                                        onClick={() => handleSelectGroupBy(option.key)}
                                    >
                                        <span>{option.label}</span>
                                        {groupBy === option.key && <Check size={16} color="#009080" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="chart-y-legend-label">
                Lượt tìm kiếm {totalPeriodSearches > 0 && `(Tổng: ${totalPeriodSearches.toLocaleString("vi-VN")})`}
            </div>

            <div className="recharts-wrapper-container" style={{ width: "100%", height: 260 }}>
                {chartData.length === 0 ? (
                    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: "14px" }}>
                        Chưa có dữ liệu tìm kiếm trong khoảng thời gian đã chọn
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#009080" stopOpacity={0.28} />
                                    <stop offset="95%" stopColor="#009080" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6B7280", fontSize: 12 }}
                            />
                            <YAxis
                                dataKey="value"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6B7280", fontSize: 12 }}
                                tickFormatter={(v) => (v === 0 ? "0" : v >= 1000 ? `${(v / 1000).toFixed(0)}.000` : v)}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#FFFFFF",
                                    borderRadius: "8px",
                                    border: "1px solid #E5E7EB",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                                    fontSize: "13px"
                                }}
                                formatter={(val) => [`${Number(val).toLocaleString("vi-VN")} lượt`, "Tần suất"]}
                                labelFormatter={(label, payload) => {
                                    const raw = payload?.[0]?.payload?.period;
                                    return raw ? `Mốc: ${raw}` : label;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#009080"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                dot={{ r: 3, fill: "#009080", stroke: "#FFFFFF", strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: "#009080", stroke: "#FFFFFF", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default TimeFrequencyChart;
