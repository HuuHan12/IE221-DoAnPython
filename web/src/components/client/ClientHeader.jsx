import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, Sparkles, User, LayoutDashboard, QrCode, LogOut, ChevronDown } from "lucide-react";
import { clearAuthToken } from "../../service/userService";
import "../../css/Client.css";

function ClientHeader({ activeTab }) {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const dropdownRef = useRef(null);

    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("access_token"));
    const [userInfo, setUserInfo] = useState(() => {
        try {
            const raw = localStorage.getItem("user_info");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        clearAuthToken();
        setUserDropdownOpen(false);
        navigate("/");
    };

    const navItems = [
        { id: "home", label: "Trang chủ", path: "/" },
        { id: "landmarks", label: "Địa danh", path: "/dia-danh" },
        { id: "pricing", label: "Bảng giá", path: "/bang-gia" },
        { id: "about", label: "Về dự án", path: "/ve-du-an" },
        { id: "contact", label: "Liên hệ", path: "/lien-he" },
    ];

    const displayName =
        userInfo?.full_name ||
        (userInfo?.email ? userInfo.email.split("@")[0] : "") ||
        "Tài khoản";

    const initialLetter = (displayName || "U")[0].toUpperCase();

    return (
        <header className="client-header">
            <div className="client-header-container">
                {/* BRAND LOGO */}
                <Link to="/" className="client-brand">
                    <div className="client-brand-icon">
                        <Compass size={22} color="#FFFFFF" />
                    </div>
                    <span className="client-brand-name">
                        Landmark<span>AI</span>
                    </span>
                </Link>

                {/* NAV MENU */}
                <nav className="client-nav-links">
                    {navItems.map((item) => {
                        const isActive =
                            activeTab === item.id ||
                            (item.path === "/"
                                ? currentPath === "/"
                                : currentPath.startsWith(item.path));

                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`client-nav-link ${isActive ? "active" : ""}`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* ACTIONS */}
                <div className="client-header-actions">
                    {isLoggedIn ? (
                        <div className="client-user-menu-container" ref={dropdownRef}>
                            <button
                                type="button"
                                className="client-user-btn"
                                onClick={() => setUserDropdownOpen((prev) => !prev)}
                                aria-expanded={userDropdownOpen}
                                title={displayName}
                            >
                                <div className="client-user-avatar">
                                    {initialLetter}
                                </div>
                                <span className="client-user-name">
                                    {displayName}
                                </span>
                                <ChevronDown size={14} className={`chevron-icon ${userDropdownOpen ? "open" : ""}`} />
                            </button>

                            {userDropdownOpen && (
                                <div className="client-user-dropdown">
                                    <div className="client-user-dropdown-header">
                                        <p className="user-dropdown-name">{userInfo?.full_name || displayName}</p>
                                        <p className="user-dropdown-email">{userInfo?.email || ""}</p>
                                    </div>
                                    <div className="client-user-dropdown-divider" />
                                    <Link
                                        to="/dashboard"
                                        className="user-dropdown-item"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <LayoutDashboard size={16} />
                                        <span>Tổng quan Dashboard</span>
                                    </Link>
                                    <Link
                                        to="/dashboard/scan"
                                        className="user-dropdown-item"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <QrCode size={16} />
                                        <span>Quét & Khám phá</span>
                                    </Link>
                                    <Link
                                        to="/dashboard/profile"
                                        className="user-dropdown-item"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <User size={16} />
                                        <span>Hồ sơ cá nhân</span>
                                    </Link>
                                    <div className="client-user-dropdown-divider" />
                                    <button
                                        type="button"
                                        className="user-dropdown-item logout"
                                        onClick={handleLogout}
                                    >
                                        <LogOut size={16} />
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn-client-login">
                            Đăng nhập
                        </Link>
                    )}

                    <Link to="/dashboard/scan" className="btn-client-scan">
                        <Sparkles size={16} />
                        <span>Nhận diện ảnh</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default React.memo(ClientHeader);
