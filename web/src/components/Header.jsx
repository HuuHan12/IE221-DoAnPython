import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Bell,
    Calendar,
    Download,
    ChevronDown,
    FileSpreadsheet,
    FileText,
    CheckCheck,
    CreditCard,
    Award,
    Sparkles,
    Info,
    ExternalLink,
    Loader2,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    fetchNotificationsApi,
    markNotificationAsReadApi,
    markAllNotificationsAsReadApi,
} from "../service/notificationService";
import "../css/Header.css";

function Header({
    title,
    subtitle,
    showDateFilter = false,
    showExportBtn = false,
    notificationCount: externalNotificationCount,
    startDate: externalStartDate,
    endDate: externalEndDate,
    onDateRangeChange,
    onExport,
    isExporting = false,
}) {
    const [internalStartDate, setInternalStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d;
    });
    const [internalEndDate, setInternalEndDate] = useState(() => new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    // Notification dropdown state
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(
        externalNotificationCount !== undefined ? externalNotificationCount : 0
    );
    const [recentNotifications, setRecentNotifications] = useState([]);
    const [loadingNotifs, setLoadingNotifs] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);

    const startDate = externalStartDate !== undefined ? externalStartDate : internalStartDate;
    const endDate = externalEndDate !== undefined ? externalEndDate : internalEndDate;

    const datePickerRef = useRef(null);
    const exportRef = useRef(null);
    const notifRef = useRef(null);

    // Load initial unread count & notifications
    const loadNotificationData = async () => {
        try {
            const res = await fetchNotificationsApi({ limit: 5 });
            if (res && res.status === "success") {
                setUnreadCount(res.unread_count);
                setRecentNotifications(res.data || []);
            }
        } catch (err) {
            console.warn("Không thể tải thông báo:", err);
        }
    };

    useEffect(() => {
        loadNotificationData();
    }, []);

    // Close calendar, export, or notif popup on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setIsExportMenuOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleNotif = async () => {
        const nextState = !isNotifOpen;
        setIsNotifOpen(nextState);
        if (nextState) {
            setLoadingNotifs(true);
            try {
                const res = await fetchNotificationsApi({ limit: 5 });
                if (res && res.status === "success") {
                    setUnreadCount(res.unread_count);
                    setRecentNotifications(res.data || []);
                }
            } catch (err) {
                console.warn("Lỗi tải thông báo:", err);
            } finally {
                setLoadingNotifs(false);
            }
        }
    };

    const handleMarkOneRead = async (e, item) => {
        e.stopPropagation();
        if (item.is_read) return;

        // Cập nhật UI ngay lập tức
        setRecentNotifications((prev) =>
            prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            await markNotificationAsReadApi(item.id);
        } catch (err) {
            console.error("Lỗi đánh dấu đã đọc:", err);
        }
    };

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        if (unreadCount === 0 || isMarkingAll) return;

        setIsMarkingAll(true);
        // Cập nhật UI ngay lập tức
        setRecentNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);

        try {
            await markAllNotificationsAsReadApi();
        } catch (err) {
            console.error("Lỗi đánh dấu tất cả đã đọc:", err);
        } finally {
            setIsMarkingAll(false);
        }
    };

    const formatRelativeTime = (dateStr) => {
        if (!dateStr) return "";
        const notifDate = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - notifDate.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return "Vừa xong";
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;

        const d = String(notifDate.getDate()).padStart(2, "0");
        const m = String(notifDate.getMonth() + 1).padStart(2, "0");
        const y = notifDate.getFullYear();
        return `${d}/${m}/${y}`;
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case "payment":
                return <CreditCard size={15} />;
            case "achievement":
                return <Award size={15} />;
            case "scan":
                return <Sparkles size={15} />;
            default:
                return <Info size={15} />;
        }
    };

    const getNotifTypeClass = (type) => {
        switch (type) {
            case "payment":
                return "type-payment";
            case "achievement":
                return "type-achievement";
            case "scan":
                return "type-scan";
            default:
                return "type-system";
        }
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setInternalStartDate(start);
        setInternalEndDate(end);
        if (onDateRangeChange) {
            onDateRangeChange(start, end);
        }
        if (start && end) {
            setIsCalendarOpen(false);
        }
    };

    const handleExportSelect = (format) => {
        setIsExportMenuOpen(false);
        if (onExport) {
            onExport(format);
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
                    <div className="export-dropdown-container" ref={exportRef}>
                        <button
                            type="button"
                            className={`export-report-btn ${isExportMenuOpen ? "active" : ""}`}
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                            disabled={isExporting}
                        >
                            <Download size={16} />
                            <span>{isExporting ? "Đang xuất..." : "Xuất báo cáo"}</span>
                            <ChevronDown size={14} className={`chevron-icon ${isExportMenuOpen ? "rotate" : ""}`} />
                        </button>

                        {isExportMenuOpen && (
                            <div className="export-menu-popup">
                                <button
                                    type="button"
                                    className="export-menu-item"
                                    onClick={() => handleExportSelect("xlsx")}
                                >
                                    <FileSpreadsheet size={16} color="#10B981" />
                                    <span>Xuất Excel (.xlsx)</span>
                                </button>
                                <button
                                    type="button"
                                    className="export-menu-item"
                                    onClick={() => handleExportSelect("csv")}
                                >
                                    <FileText size={16} color="#3B82F6" />
                                    <span>Xuất CSV (.csv)</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="notification-bell-container" ref={notifRef}>
                    <button
                        type="button"
                        className={`notification-btn ${isNotifOpen ? "active" : ""}`}
                        aria-label="Notifications"
                        onClick={handleToggleNotif}
                    >
                        <Bell size={20} color={isNotifOpen ? "#009080" : "#4B5563"} />
                        {unreadCount > 0 && (
                            <span className="bell-badge">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="notification-dropdown-popup">
                            <div className="notif-popup-header">
                                <div className="notif-header-title">
                                    <span className="notif-title-text">Thông báo</span>
                                    {unreadCount > 0 && (
                                        <span className="notif-unread-pill">{unreadCount} mới</span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        className="notif-mark-all-btn"
                                        onClick={handleMarkAllRead}
                                        disabled={isMarkingAll}
                                        title="Đánh dấu tất cả là đã đọc"
                                    >
                                        <CheckCheck size={14} />
                                        <span>{isMarkingAll ? "Đang xử lý..." : "Đọc tất cả"}</span>
                                    </button>
                                )}
                            </div>

                            <div className="notif-popup-list">
                                {loadingNotifs ? (
                                    <div className="notif-state-box">
                                        <Loader2 size={20} className="notif-spin-icon" />
                                        <p>Đang tải thông báo...</p>
                                    </div>
                                ) : recentNotifications.length === 0 ? (
                                    <div className="notif-state-box">
                                        <Bell size={24} className="notif-empty-icon" />
                                        <p>Không có thông báo nào</p>
                                    </div>
                                ) : (
                                    recentNotifications.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`notif-item ${!item.is_read ? "unread" : ""}`}
                                            onClick={(e) => handleMarkOneRead(e, item)}
                                        >
                                            <div className={`notif-item-icon ${getNotifTypeClass(item.type)}`}>
                                                {getNotifIcon(item.type)}
                                            </div>
                                            <div className="notif-item-body">
                                                <div className="notif-item-title-row">
                                                    <span className="notif-item-title">{item.title}</span>
                                                    {!item.is_read && <span className="notif-dot" />}
                                                </div>
                                                {item.content && (
                                                    <p className="notif-item-content">{item.content}</p>
                                                )}
                                                <span className="notif-item-time">
                                                    {formatRelativeTime(item.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="notif-popup-footer">
                                <Link
                                    to="/dashboard/notifications"
                                    className="notif-view-all-link"
                                    onClick={() => setIsNotifOpen(false)}
                                >
                                    <span>Xem tất cả thông báo</span>
                                    <ExternalLink size={13} />
                                </Link>
                            </div>
                        </div>
                    )}
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
