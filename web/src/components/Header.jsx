import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    Loader2,
    User,
    LogOut,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    fetchNotificationsApi,
    markNotificationAsReadApi,
    markAllNotificationsAsReadApi,
} from "../service/notificationService";
import { getUserProfileApi, clearAuthToken } from "../service/userService";
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
    const navigate = useNavigate();
    const [internalStartDate, setInternalStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d;
    });
    const [internalEndDate, setInternalEndDate] = useState(() => new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    // User profile state
    const [userProfile, setUserProfile] = useState(() => {
        try {
            const cached = localStorage.getItem("user_info");
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });

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
    const userRef = useRef(null);

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

    // Load user profile
    const loadUserProfile = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            setUserProfile(null);
            return;
        }
        try {
            const profile = await getUserProfileApi();
            if (profile) {
                setUserProfile(profile);
                localStorage.setItem("user_info", JSON.stringify(profile));
            }
        } catch (err) {
            // Giữ lại dữ liệu cache nếu có
        }
    };

    useEffect(() => {
        loadNotificationData();
        loadUserProfile();

        const handleAuth = () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setUserProfile(null);
            } else {
                loadUserProfile();
            }
        };
        window.addEventListener("authChange", handleAuth);
        return () => window.removeEventListener("authChange", handleAuth);
    }, []);

    // Close calendar, export, notif, or user popup on outside click
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
            if (userRef.current && !userRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        clearAuthToken();
        navigate("/");
    };

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
    const formatDisplayDate = formatDate;
    const handleDatePickerChange = handleDateChange;
    const handleExportFormat = handleExportSelect;

    const displayName =
        userProfile?.profile?.full_name?.trim()
        || userProfile?.full_name?.trim()
        || (userProfile?.email ? userProfile.email.split("@")[0] : "")
        || "Người dùng";

    const avatarUrl =
        userProfile?.profile?.avatar_url
        || userProfile?.avatar_url
        || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || "User")}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

    return (
        <header className="app-header stats-top-header">
            <div className="header-titles">
                <h1 className="header-main-title">{title}</h1>
                {subtitle && <p className="header-subtitle">{subtitle}</p>}
            </div>

            <div className="header-actions-group">
                {/* 1. Bộ lọc khoảng ngày (Date Range Picker) */}
                {showDateFilter && (
                    <div className="date-filter-wrapper" ref={datePickerRef}>
                        <button
                            type="button"
                            className={`date-filter-btn ${isCalendarOpen ? "active" : ""}`}
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                            aria-label="Chọn khoảng thời gian lọc dữ liệu"
                        >
                            <Calendar size={18} className="calendar-icon" />
                            <span className="date-range-text">
                                {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}
                            </span>
                            <ChevronDown size={16} className={`chevron-icon ${isCalendarOpen ? "open" : ""}`} />
                        </button>

                        {isCalendarOpen && (
                            <div className="calendar-popup-container">
                                <DatePicker
                                    selected={startDate}
                                    onChange={handleDatePickerChange}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectsRange
                                    inline
                                    maxDate={new Date()}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Nút Xuất báo cáo (Export Menu) */}
                {showExportBtn && (
                    <div className="export-menu-wrapper" ref={exportRef}>
                        <button
                            type="button"
                            className="export-primary-btn"
                            disabled={isExporting}
                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                        >
                            {isExporting ? (
                                <>
                                    <div className="export-spinner" />
                                    <span>Đang xuất...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    <span>Xuất báo cáo</span>
                                    <ChevronDown size={14} />
                                </>
                            )}
                        </button>

                        {isExportMenuOpen && !isExporting && (
                            <div className="export-dropdown-menu">
                                <button
                                    type="button"
                                    className="export-dropdown-item"
                                    onClick={() => handleExportFormat("xlsx")}
                                >
                                    <FileSpreadsheet size={16} color="#10B981" />
                                    <div className="export-item-text">
                                        <span className="export-format-name">Xuất Excel (.xlsx)</span>
                                        <span className="export-format-desc">Đầy đủ 4 Sheet thống kê</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="export-dropdown-item"
                                    onClick={() => handleExportFormat("csv")}
                                >
                                    <FileText size={16} color="#3B82F6" />
                                    <div className="export-item-text">
                                        <span className="export-format-name">Xuất CSV (.csv)</span>
                                        <span className="export-format-desc">Dữ liệu tổng quan KPI</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Chuông thông báo (Notification Bell with Dropdown) */}
                <div className="notification-bell-wrapper" ref={notifRef}>
                    <button
                        type="button"
                        className={`notification-btn ${isNotifOpen ? "active" : ""}`}
                        aria-label={`Thông báo (${unreadCount} chưa đọc)`}
                        title={unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Thông báo"}
                        onClick={handleToggleNotif}
                    >
                        <Bell size={21} className="header-bell-icon" />
                        {unreadCount > 0 && (
                            <span className="notification-badge" aria-hidden="true" />
                        )}
                    </button>

                    {/* Dropdown Popup Danh sách thông báo */}
                    {isNotifOpen && (
                        <div className="notification-dropdown-popup">
                            <div className="notif-popup-header">
                                <div className="notif-header-title">
                                    <span className="notif-title-text">Thông báo</span>
                                    {unreadCount > 0 && (
                                        <span className="notif-count-pill">{unreadCount} mới</span>
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
                                        {isMarkingAll ? (
                                            <Loader2 size={13} className="spin-icon" />
                                        ) : (
                                            <CheckCheck size={13} />
                                        )}
                                        <span>Đọc tất cả</span>
                                    </button>
                                )}
                            </div>

                            <div className="notif-popup-body">
                                {loadingNotifs ? (
                                    <div className="notif-loading-state">
                                        <Loader2 size={24} className="spin-icon text-teal" />
                                        <span>Đang tải thông báo...</span>
                                    </div>
                                ) : recentNotifications.length === 0 ? (
                                    <div className="notif-empty-state">
                                        <Bell size={32} className="notif-empty-icon" />
                                        <p className="notif-empty-title">Không có thông báo nào</p>
                                        <p className="notif-empty-desc">Bạn đã xem hết các thông báo mới.</p>
                                    </div>
                                ) : (
                                    recentNotifications.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`notif-item-row ${!item.is_read ? "unread" : ""}`}
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
                        </div>
                    )}
                </div>

                {/* 4. Hồ sơ người dùng (User Profile Widget) */}
                <div className="user-profile-widget" ref={userRef}>
                    <div
                        className="user-info-trigger"
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    >
                        <div className="user-avatar-mini">
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/4140/4140048.png";
                                }}
                            />
                        </div>
                        <span className="user-name-text">{displayName}</span>
                        <ChevronDown size={16} className={`dropdown-arrow ${userDropdownOpen ? "open" : ""}`} />
                    </div>

                    {userDropdownOpen && (
                        <div className="user-dropdown-menu" style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            right: 0,
                            background: "#FFFFFF",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                            border: "1px solid #E2E8F0",
                            padding: "8px 0",
                            minWidth: "190px",
                            zIndex: 1000
                        }}>
                            <div style={{ padding: "8px 16px", borderBottom: "1px solid #F1F5F9" }}>
                                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1E293B" }}>{displayName}</div>
                                {userProfile?.email && (
                                    <div style={{ fontSize: "0.75rem", color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userProfile.email}</div>
                                )}
                            </div>
                            <Link
                                to="/dashboard/profile"
                                onClick={() => setUserDropdownOpen(false)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "10px 16px",
                                    color: "#334155",
                                    textDecoration: "none",
                                    fontSize: "0.875rem"
                                }}
                            >
                                <User size={16} />
                                <span>Hồ sơ cá nhân</span>
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    width: "100%",
                                    padding: "10px 16px",
                                    color: "#EF4444",
                                    background: "none",
                                    border: "none",
                                    textAlign: "left",
                                    cursor: "pointer",
                                    fontSize: "0.875rem"
                                }}
                            >
                                <LogOut size={16} />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
