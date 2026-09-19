import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    QrCode,
    Clock,
    Heart,
    Image as ImageIcon,
    User,
    MapPin,
    LogOut,
    LogIn,
    ChevronLeft,
    ChevronRight,
    Home,
} from "lucide-react";
import { clearAuthToken } from "../service/userService";
import "../css/Sidebar.css";

function Sidebar({ activeMenu }) {
    const location = useLocation();
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("access_token"));
    const [userInfo, setUserInfo] = useState(() => {
        try {
            const raw = localStorage.getItem("user_info");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("access_token");
            setIsLoggedIn(!!token);
            try {
                const raw = localStorage.getItem("user_info");
                setUserInfo(raw ? JSON.parse(raw) : null);
            } catch {
                setUserInfo(null);
            }
        };

        window.addEventListener("authChange", checkAuth);
        window.addEventListener("storage", checkAuth);
        return () => {
            window.removeEventListener("authChange", checkAuth);
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    // State quản lý trạng thái thu gọn / mở rộng, lưu vào localStorage để ghi nhớ
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem("sidebar_collapsed") === "true";
        } catch {
            return false;
        }
    });

    const toggleCollapse = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem("sidebar_collapsed", String(next));
            } catch {
                // Bỏ qua nếu môi trường private browsing chặn localStorage
            }
            return next;
        });
    };

    // Khi CHƯA đăng nhập: chỉ hiện mục "Quét & Khám phá"
    // Khi ĐÃ đăng nhập: hiện đầy đủ thanh catalog
    const menuItems = isLoggedIn
        ? [
            { id: "overview", label: "Tổng quan", icon: LayoutDashboard, path: "/dashboard" },
            { id: "scan", label: "Quét & Khám phá", icon: QrCode, path: "/dashboard/scan" },
            { id: "history", label: "Lịch sử Tìm kiếm", icon: Clock, path: "/dashboard/history" },
            { id: "favorites", label: "Địa điểm yêu thích", icon: Heart, path: "/dashboard/favorites" },
            { id: "gallery", label: "Kho ảnh", icon: ImageIcon, path: "/dashboard/gallery" },
            { id: "profile", label: "Hồ sơ", icon: User, path: "/dashboard/profile" },
        ]
        : [
            { id: "scan", label: "Quét & Khám phá", icon: QrCode, path: "/dashboard/scan" },
        ];

    const currentPath = location.pathname;

    const handleLogout = () => {
        clearAuthToken();
        navigate("/");
    };

    const displayName =
        userInfo?.full_name ||
        (userInfo?.email ? userInfo.email.split("@")[0] : "") ||
        "Tài khoản";
    const initialLetter = (displayName || "U")[0].toUpperCase();

    return (
        <aside className={`app-sidebar ${isCollapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                <Link to={isLoggedIn ? "/dashboard" : "/dashboard/scan"} className="sidebar-brand" title="Travel AI - Khám phá Việt Nam">
                    <div className="brand-logo-icon">
                        <MapPin size={22} color="#FFFFFF" fill="#FFFFFF" />
                    </div>
                    {!isCollapsed && (
                        <div className="brand-text">
                            <span className="brand-title">Travel AI</span>
                            <span className="brand-subtitle">Khám phá Việt Nam</span>
                        </div>
                    )}
                </Link>

                <button
                    type="button"
                    className="sidebar-toggle-btn"
                    onClick={toggleCollapse}
                    title={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
                    aria-label={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive =
                        activeMenu === item.id ||
                        (item.path === "/dashboard"
                            ? currentPath === "/dashboard" || currentPath === "/dashboard/"
                            : currentPath.startsWith(item.path));

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`nav-item ${isActive ? "active" : ""}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <IconComponent size={20} className="nav-icon" />
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                {isLoggedIn && !isCollapsed && (
                    <div className="sidebar-user-brief">
                        <div className="sidebar-user-avatar">{initialLetter}</div>
                        <div className="sidebar-user-meta">
                            <span className="sidebar-user-name">{displayName}</span>
                            <span className="sidebar-user-email">{userInfo?.email || ""}</span>
                        </div>
                    </div>
                )}

                <Link
                    to="/"
                    className="home-nav-btn"
                    title="Quay về trang chủ website"
                >
                    <Home size={20} />
                    {!isCollapsed && <span>Về trang chủ</span>}
                </Link>

                {isLoggedIn ? (
                    <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Đăng xuất khỏi hệ thống"
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span>Đăng xuất</span>}
                    </button>
                ) : (
                    <Link
                        to="/login"
                        className="login-nav-btn"
                        title="Đăng nhập để mở khóa đầy đủ tính năng"
                    >
                        <LogIn size={20} />
                        {!isCollapsed && <span>Đăng nhập</span>}
                    </Link>
                )}
            </div>

            {/* Pagoda landscape vector graphic at sidebar bottom */}
            <div className="sidebar-illustration">
                <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 120C40 110 80 115 120 108C160 101 200 115 240 120V120H0V120Z" fill="#009080" opacity="0.15" />
                    <path d="M0 120C60 100 120 112 180 102C210 97 230 110 240 120V120H0V120Z" fill="#009080" opacity="0.25" />
                    <path d="M50 110V85H60V110H50Z" fill="#009080" opacity="0.5" />
                    <path d="M45 85H65L55 75L45 85Z" fill="#009080" opacity="0.6" />
                    <path d="M48 75V60H57V75H48Z" fill="#009080" opacity="0.5" />
                    <path d="M43 60H67L55 50L43 60Z" fill="#009080" opacity="0.6" />
                    <path d="M50 50V40H55V50H50Z" fill="#009080" opacity="0.6" />
                    <path d="M46 40H64L55 32L46 40Z" fill="#009080" opacity="0.7" />
                    <path d="M54 32V24H56V32H54Z" fill="#009080" opacity="0.8" />
                    <circle cx="25" cy="100" r="12" fill="#009080" opacity="0.4" />
                    <circle cx="35" cy="105" r="10" fill="#009080" opacity="0.3" />
                    <circle cx="80" cy="105" r="14" fill="#009080" opacity="0.35" />
                </svg>
            </div>
        </aside>
    );
}

export default Sidebar;
