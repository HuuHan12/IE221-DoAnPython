import { useState, useRef, useEffect } from "react";
import { Info, ChevronDown, Calendar as CalendarIcon, Check } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

const dailyData = [
    { date: "01/05", value: 2000 },
    { date: "04/05", value: 2500 },
    { date: "07/05", value: 3400 },
    { date: "10/05", value: 2200 },
    { date: "13/05", value: 3800 },
    { date: "16/05", value: 2200 },
    { date: "19/05", value: 4600 },
    { date: "22/05", value: 2600 },
    { date: "25/05", value: 2000 },
    { date: "28/05", value: 3200 },
    { date: "31/05", value: 3700 },
];

const weeklyData = [
    { date: "Tuần 1", value: 9900 },
    { date: "Tuần 2", value: 11400 },
    { date: "Tuần 3", value: 12600 },
    { date: "Tuần 4", value: 10900 },
];

const monthlyData = [
    { date: "Tháng 1", value: 32000 },
    { date: "Tháng 2", value: 28000 },
    { date: "Tháng 3", value: 35000 },
    { date: "Tháng 4", value: 39000 },
    { date: "Tháng 5", value: 41689 },
];

function TimeFrequencyChart() {
    const [filterMode, setFilterMode] = useState("Theo ngày");
    const [selectedSingleDate, setSelectedSingleDate] = useState(new Date(2024, 4, 19));
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("calendar"); // 'calendar' | 'preset'

    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateSelect = (date) => {
        if (!date) return;
        setSelectedSingleDate(date);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        setFilterMode(`Ngày ${day}/${month}`);
        setIsOpen(false);
    };

    const handlePresetSelect = (presetLabel) => {
        setFilterMode(presetLabel);
        setIsOpen(false);
    };

    const getChartData = () => {
        if (filterMode.startsWith("Theo tuần")) return weeklyData;
        if (filterMode.startsWith("Theo tháng")) return monthlyData;
        return dailyData;
    };

    return (
        <div className="chart-card-section">
            <div className="chart-card-header">
                <div className="chart-title-with-info">
                    <h3>Tần suất tìm kiếm theo thời gian</h3>
                    <Info size={16} className="info-icon" title="Tần suất được tính theo ngày/tuần/tháng" />
                </div>

                <div className="chart-filter-dropdown-wrapper" ref={dropdownRef}>
                    <button
                        type="button"
                        className={`chart-filter-dropdown ${isOpen ? "active" : ""}`}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span>{filterMode}</span>
                        <ChevronDown size={16} className={`chevron-icon ${isOpen ? "rotate" : ""}`} />
                    </button>

                    {isOpen && (
                        <div className="chart-filter-menu-popup">
                            <div className="filter-popup-tabs">
                                <button
                                    type="button"
                                    className={`popup-tab-btn ${activeTab === "calendar" ? "active" : ""}`}
                                    onClick={() => setActiveTab("calendar")}
                                >
                                    <CalendarIcon size={14} />
                                    <span>Chọn ngày</span>
                                </button>
                                <button
                                    type="button"
                                    className={`popup-tab-btn ${activeTab === "preset" ? "active" : ""}`}
                                    onClick={() => setActiveTab("preset")}
                                >
                                    <span>Chế độ xem</span>
                                </button>
                            </div>

                            {activeTab === "calendar" ? (
                                <div className="single-date-picker-body">
                                    <DatePicker
                                        selected={selectedSingleDate}
                                        onChange={handleDateSelect}
                                        inline
                                    />
                                </div>
                            ) : (
                                <div className="preset-options-list">
                                    {["Theo ngày", "Theo tuần", "Theo tháng"].map((option) => (
                                        <div
                                            key={option}
                                            className={`preset-option-item ${filterMode === option ? "selected" : ""}`}
                                            onClick={() => handlePresetSelect(option)}
                                        >
                                            <span>{option}</span>
                                            {filterMode === option && <Check size={16} color="#009080" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="chart-y-legend-label">
                Lượt tìm kiếm
            </div>

            <div className="recharts-wrapper-container" style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#009080" stopOpacity={0.25} />
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
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#6B7280", fontSize: 12 }}
                            domain={[0, 50000]}
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
                            formatter={(val) => [`${val.toLocaleString("vi-VN")} lượt`, "Tần suất"]}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#009080"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            dot={{ r: 4, fill: "#009080", stroke: "#FFFFFF", strokeWidth: 2 }}
                            activeDot={{ r: 7, fill: "#009080", stroke: "#FFFFFF", strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default TimeFrequencyChart;
