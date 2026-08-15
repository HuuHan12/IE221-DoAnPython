import { Link } from "react-router-dom";
import "../css/Navbar.css";

function Navbar() {
    return (
        <header className="site-navbar">
            <div className="site-brand">
                <Link to="/" className="site-brand-link">
                    <div className="site-brand-icon">
                        AI
                    </div>

                    <span className="site-brand-name">
                        Landmark<span>AI</span>
                    </span>
                </Link>
            </div>

            <nav className="site-nav-links">
                <Link to="/">
                    Trang chủ
                </Link>

                <a href="#features">
                    Tính năng
                </a>

                <a href="#explore">
                    Khám phá
                </a>

                <a href="#about">
                    Về chúng tôi
                </a>
            </nav>
        </header>
    );
}

export default Navbar;