import { useState, useRef, useEffect } from "react";
import { Search, Calendar as CalendarIcon, RotateCcw, ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function HistoryFilterCard({ onFilter, onReset }) {
    const [landmarkSearch, setLandmarkSearch] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const datePickerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        if (start && end) {
            setIsCalendarOpen(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onFilter({ landmarkSearch, startDate, endDate });
    };

    const handleResetAll = () => {
        setLandmarkSearch("");
        setStartDate(null);
        setEndDate(null);
        onReset();
    };

    return (
        <form className="history-filter-card" onSubmit={handleSearchSubmit}>
            {/* Field 1: Landmark Name */}
            <div className="filter-field-group flex-2">
                <label className="filter-label">Tên địa danh</label>
                <div className="input-with-search-icon">
                    <Search size={18} color="#9CA3AF" className="field-icon" />
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Nhập tên địa danh"
                        value={landmarkSearch}
                        onChange={(e) => setLandmarkSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Field 2: Date Range Picker */}
            <div className="filter-field-group flex-3" ref={datePickerRef}>
                <label className="filter-label">Khoảng thời gian</label>
                <div className="date-range-field-wrapper">
                    <button
                        type="button"
                        className={`date-range-picker-trigger ${isCalendarOpen ? "active" : ""}`}
                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    >
                        <CalendarIcon size={16} className="date-icon" />
                        <span className="date-text-range">
                            {formatDate(startDate)} &nbsp;→&nbsp; {formatDate(endDate) || "Chọn ngày"}
                        </span>
                    </button>

                    {isCalendarOpen && (
                        <div className="calendar-dropdown-popup">
                            <DatePicker
                                selected={startDate}
                                onChange={handleDateChange}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="filter-field-actions">
                <button type="submit" className="btn-filter-search">
                    <Search size={16} />
                    <span>Tìm kiếm</span>
                </button>

                <button
                    type="button"
                    className="btn-filter-reset"
                    onClick={handleResetAll}
                >
                    <RotateCcw size={16} />
                    <span>Xóa bộ lọc</span>
                </button>
            </div>
        </form>
    );
}

export default HistoryFilterCard;
