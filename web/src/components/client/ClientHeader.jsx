import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, Sparkles, UserCheck } from "lucide-react";
import "../../css/Client.css";

function ClientHeader({ activeTab }) {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { id: "home", label: "Trang chủ", path: "/" },
        { id: "landmarks", label: "Địa danh", path: "/dia-danh" },
        { id: "pricing", label: "Bảng giá", path: "/bang-gia" },
        { id: "about", label: "Về dự án", path: "/ve-du-an" },
        { id: "contact", label: "Liên hệ", path: "/lien-he" },
    ];

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
                    <Link to="/login" className="btn-client-login">
                        Đăng nhập
                    </Link>

                    <Link to="/dashboard" className="btn-client-scan">
                        <Sparkles size={16} />
                        <span>Nhận diện ảnh</span>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default React.memo(ClientHeader);
