import { useState, useRef, useEffect } from "react";
import { Bell, Calendar, Download, ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../css/Header.css";

function Header({
    title,
    subtitle,
    showDateFilter = false,
    showExportBtn = false,
    notificationCount = 2
}) {
    const [startDate, setStartDate] = useState(new Date(2024, 4, 1));
    const [endDate, setEndDate] = useState(new Date(2024, 4, 31));
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const datePickerRef = useRef(null);

    // Close calendar on outside click
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

    const dateText =
        startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : startDate
            ? `${formatDate(startDate)} - Chọn ngày kết thúc`
            : "Chọn khoảng thời gian";

    return (
        <header className="app-header">
            <div className="header-titles">
                <h1 className="header-main-title">{title}</h1>
                {subtitle && <p className="header-subtitle">{subtitle}</p>}
            </div>

            <div className="header-actions">
                {showDateFilter && (
                    <div className="date-filter-container" ref={datePickerRef}>
                        <button
                            type="button"
                            className={`date-filter-picker ${isCalendarOpen ? "active" : ""}`}
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        >
                            <Calendar size={16} className="date-icon" />
                            <span>{dateText}</span>
                            <ChevronDown
                                size={16}
                                className={`chevron-icon ${isCalendarOpen ? "rotate" : ""}`}
                            />
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
                )}

                {showExportBtn && (
                    <button type="button" className="export-report-btn">
                        <Download size={16} />
                        <span>Xuất báo cáo</span>
                    </button>
                )}

                <div className="notification-bell-container">
                    <button type="button" className="notification-btn" aria-label="Notifications">
                        <Bell size={20} color="#4B5563" />
                        {notificationCount > 0 && (
                            <span className="bell-badge">{notificationCount}</span>
                        )}
                    </button>
                </div>

                <div className="user-profile-widget">
                    <div
                        className="user-info-trigger"
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    >
                        <div className="user-avatar-mini">
                            <img
                                src="https://api.dicebear.com/7.x/bottts/svg?seed=NguyenVanA"
                                alt="Avatar"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
                                }}
                            />
                        </div>
                        <span className="user-name-text">Nguyễn Văn A</span>
                        <ChevronDown size={16} className="dropdown-arrow" />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
