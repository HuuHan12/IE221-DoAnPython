import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    QrCode,
    Clock,
    MapPin,
    BarChart3,
    Bell,
    User,
    Settings,
    LogOut,
    Heart,
    Compass,
    Image as ImageIcon
} from "lucide-react";
import "../css/Sidebar.css";

function Sidebar({ activeMenu }) {
    const location = useLocation();

    // Menu list based on the mockup designs
    const menuItems = [
        { id: "overview", label: "Tổng quan", icon: LayoutDashboard, path: "/" },
        { id: "scan", label: "Quét & Khám phá", icon: QrCode, path: "/" },
        { id: "history", label: "Lịch sử quét", icon: Clock, path: "/" },
        { id: "favorites", label: "Địa điểm yêu thích", icon: Heart, path: "/" },
        { id: "journey", label: "Hành trình của tôi", icon: Compass, path: "/" },
        { id: "gallery", label: "Kho ảnh", icon: ImageIcon, path: "/gallery" },
        { id: "statistics", label: "Bảng Thống kê", icon: BarChart3, path: "/statistics" },
        { id: "notifications", label: "Thông báo", icon: Bell, path: "/" },
        { id: "profile", label: "Hồ sơ", icon: User, path: "/profile" },
        { id: "settings", label: "Cài đặt", icon: Settings, path: "/" },
    ];

    const currentPath = location.pathname;

    return (
        <aside className="app-sidebar">
            <div className="sidebar-header">
                <Link to="/" className="sidebar-brand">
                    <div className="brand-logo-icon">
                        <MapPin size={22} color="#FFFFFF" fill="#FFFFFF" />
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">Travel AI</span>
                        <span className="brand-subtitle">Khám phá Việt Nam</span>
                    </div>
                </Link>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive =
                        activeMenu === item.id ||
                        (item.path !== "/" && currentPath.startsWith(item.path));

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`nav-item ${isActive ? "active" : ""}`}
                        >
                            <IconComponent size={20} className="nav-icon" />
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button type="button" className="logout-btn">
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>

            {/* Pagoda landscape vector graphic at sidebar bottom matching mockup */}
            <div className="sidebar-illustration">
                <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 120C40 110 80 115 120 108C160 101 200 115 240 120V120H0V120Z" fill="#009080" opacity="0.15" />
                    <path d="M0 120C60 100 120 112 180 102C210 97 230 110 240 120V120H0V120Z" fill="#009080" opacity="0.25" />
                    {/* Pagoda silhouette */}
                    <path d="M50 110V85H60V110H50Z" fill="#009080" opacity="0.5" />
                    <path d="M45 85H65L55 75L45 85Z" fill="#009080" opacity="0.6" />
                    <path d="M48 75V60H57V75H48Z" fill="#009080" opacity="0.5" />
                    <path d="M43 60H67L55 50L43 60Z" fill="#009080" opacity="0.6" />
                    <path d="M50 50V40H55V50H50Z" fill="#009080" opacity="0.6" />
                    <path d="M46 40H64L55 32L46 40Z" fill="#009080" opacity="0.7" />
                    <path d="M54 32V24H56V32H54Z" fill="#009080" opacity="0.8" />
                    {/* Trees */}
                    <circle cx="25" cy="100" r="12" fill="#009080" opacity="0.4" />
                    <circle cx="35" cy="105" r="10" fill="#009080" opacity="0.3" />
                    <circle cx="80" cy="105" r="14" fill="#009080" opacity="0.35" />
                </svg>
            </div>
        </aside>
    );
}

export default Sidebar;
