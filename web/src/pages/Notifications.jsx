import React, { useState, useEffect, useCallback } from "react";
import {
    Bell,
    CheckCheck,
    RefreshCw,
    CreditCard,
    Award,
    Sparkles,
    Info,
    Mail,
    Check,
    Loader2,
    Calendar,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
    fetchNotificationsApi,
    markNotificationAsReadApi,
    markAllNotificationsAsReadApi,
} from "../service/notificationService";
import "../css/Notifications.css";

function Notifications() {
    const [activeTab, setActiveTab] = useState("all"); // "all" | "unread"
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [error, setError] = useState(null);

    const loadNotifications = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            const isUnreadOnly = activeTab === "unread";
            const res = await fetchNotificationsApi({
                unread_only: isUnreadOnly,
                limit: 50,
            });

            if (res && res.status === "success") {
                setNotifications(res.data || []);
                setUnreadCount(res.unread_count);
                if (!isUnreadOnly) {
                    setTotalCount(res.total);
                }
            }
        } catch (err) {
            setError(err.message || "Không thể tải danh sách thông báo.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // Đánh dấu 1 thông báo là đã đọc
    const handleMarkAsRead = async (notificationId) => {
        // Cập nhật UI ngay lập tức
        setNotifications((prev) =>
            prev.map((item) =>
                item.id === notificationId
                    ? { ...item, is_read: true, read_at: new Date().toISOString() }
                    : item
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            await markNotificationAsReadApi(notificationId);
        } catch (err) {
            console.error("Lỗi đánh dấu đã đọc:", err);
            // Re-fetch nếu có lỗi
            loadNotifications();
        }
    };

    // Đánh dấu tất cả là đã đọc
    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0 || isMarkingAll) return;

        setIsMarkingAll(true);
        // Cập nhật UI ngay lập tức
        setNotifications((prev) =>
            prev.map((item) => ({
                ...item,
                is_read: true,
                read_at: new Date().toISOString(),
            }))
        );
        setUnreadCount(0);

        try {
            await markAllNotificationsAsReadApi();
        } catch (err) {
            console.error("Lỗi đánh dấu tất cả đã đọc:", err);
            loadNotifications();
        } finally {
            setIsMarkingAll(false);
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${hours}:${minutes} - ${day}/${month}/${year}`;
    };

    const getNotificationTypeConfig = (type) => {
        switch (type?.toLowerCase()) {
            case "payment":
                return {
                    label: "Thanh toán",
                    icon: CreditCard,
                    className: "type-payment",
                };
            case "achievement":
                return {
                    label: "Thành tựu",
                    icon: Award,
                    className: "type-achievement",
                };
            case "scan":
                return {
                    label: "Quét ảnh",
                    icon: Sparkles,
                    className: "type-scan",
                };
            case "contact":
                return {
                    label: "Liên hệ",
                    icon: Mail,
                    className: "type-contact",
                };
            default:
                return {
                    label: "Hệ thống",
                    icon: Info,
                    className: "type-system",
                };
        }
    };

    return (
        <div className="notifications-page-container">
            <Sidebar activeMenu="notifications" />
            <div className="notifications-main-content">
                <Header
                    title="Thông Báo Hệ Thống"
                    subtitle="Quản lý lịch sử giao dịch, cập nhật thành tựu và thông báo dịch vụ"
                />

                <main className="notifications-body-padding">
                    {/* Thanh công cụ / Tabs */}
                    <div className="notif-controls-bar">
                        <div className="notif-tabs-group">
                            <button
                                type="button"
                                className={`notif-tab-btn ${activeTab === "all" ? "active" : ""}`}
                                onClick={() => setActiveTab("all")}
                            >
                                <Bell size={16} />
                                <span>Tất cả</span>
                                {totalCount > 0 && <span className="tab-pill">{totalCount}</span>}
                            </button>
                            <button
                                type="button"
                                className={`notif-tab-btn ${activeTab === "unread" ? "active" : ""}`}
                                onClick={() => setActiveTab("unread")}
                            >
                                <span>Chưa đọc</span>
                                {unreadCount > 0 && (
                                    <span className="tab-pill unread-pill">{unreadCount}</span>
                                )}
                            </button>
                        </div>

                        <div className="notif-actions-group">
                            <button
                                type="button"
                                className="notif-action-btn refresh-btn"
                                onClick={() => loadNotifications(true)}
                                disabled={refreshing || loading}
                                title="Tải lại danh sách"
                            >
                                <RefreshCw size={15} className={refreshing ? "spin-icon" : ""} />
                                <span>Làm mới</span>
                            </button>

                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    className="notif-action-btn mark-all-btn"
                                    onClick={handleMarkAllAsRead}
                                    disabled={isMarkingAll}
                                >
                                    <CheckCheck size={16} />
                                    <span>{isMarkingAll ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lỗi nếu có */}
                    {error && (
                        <div className="notif-error-banner">
                            <p>{error}</p>
                            <button type="button" onClick={() => loadNotifications()}>
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* Nội dung danh sách */}
                    <div className="notif-content-area">
                        {loading ? (
                            <div className="notif-loading-box">
                                <Loader2 size={32} className="spin-icon" />
                                <p>Đang đồng bộ thông báo từ máy chủ...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notif-empty-box">
                                <div className="empty-icon-wrapper">
                                    <Bell size={40} />
                                </div>
                                <h3>
                                    {activeTab === "unread"
                                        ? "Không có thông báo chưa đọc nào"
                                        : "Chưa có thông báo nào"}
                                </h3>
                                <p>
                                    {activeTab === "unread"
                                        ? "Bạn đã đọc hết tất cả các thông báo. Hãy tiếp tục trải nghiệm các tính năng của Travel AI nhé!"
                                        : "Các thông báo thanh toán, thành tựu và hệ thống sẽ xuất hiện tại đây khi có hoạt động mới."}
                                </p>
                            </div>
                        ) : (
                            <div className="notif-cards-grid">
                                {notifications.map((item) => {
                                    const typeConfig = getNotificationTypeConfig(item.type);
                                    const IconComponent = typeConfig.icon;

                                    return (
                                        <article
                                            key={item.id}
                                            className={`notif-card ${!item.is_read ? "is-unread" : "is-read"}`}
                                            onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                                        >
                                            <div className="notif-card-header">
                                                <div className="notif-badge-row">
                                                    <span className={`notif-type-tag ${typeConfig.className}`}>
                                                        <IconComponent size={13} />
                                                        <span>{typeConfig.label}</span>
                                                    </span>
                                                    {!item.is_read && (
                                                        <span className="notif-new-dot" title="Chưa đọc" />
                                                    )}
                                                </div>

                                                <div className="notif-time-badge">
                                                    <Calendar size={13} />
                                                    <span>{formatDateTime(item.created_at)}</span>
                                                </div>
                                            </div>

                                            <div className="notif-card-body">
                                                <h3 className="notif-card-title">{item.title}</h3>
                                                {item.content && (
                                                    <p className="notif-card-desc">{item.content}</p>
                                                )}
                                            </div>

                                            <div className="notif-card-footer">
                                                {!item.is_read ? (
                                                    <button
                                                        type="button"
                                                        className="notif-read-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(item.id);
                                                        }}
                                                    >
                                                        <Check size={14} />
                                                        <span>Đánh dấu đã đọc</span>
                                                    </button>
                                                ) : (
                                                    <span className="notif-read-status">
                                                        <Check size={13} />
                                                        <span>Đã đọc</span>
                                                    </span>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Notifications;
