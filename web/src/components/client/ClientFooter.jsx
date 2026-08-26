import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import "../../css/Client.css";

function ClientFooter() {
    return (
        <footer className="client-footer">
            <div className="client-footer-container">
                <div className="client-footer-grid">
                    {/* Brand Info */}
                    <div className="footer-brand-col">
                        <Link to="/" className="client-brand" style={{ marginBottom: "16px" }}>
                            <div className="client-brand-icon">
                                <Compass size={22} color="#FFFFFF" />
                            </div>
                            <span className="client-brand-name" style={{ color: "#ffffff" }}>
                                Landmark<span style={{ color: "#0d9488" }}>AI</span>
                            </span>
                        </Link>
                        <p>
                            Nền tảng nhận diện địa danh Việt Nam qua hình ảnh bằng Vision Transformers / GeoCLIP. Đồ án môn Python — Trường Đại học FPT.
                        </p>
                    </div>

                    {/* Sản phẩm */}
                    <div>
                        <h4 className="footer-col-title">SẢN PHẨM</h4>
                        <ul className="footer-links-list">
                            <li><Link to="/dia-danh">Chi tiết địa danh</Link></li>
                            <li><Link to="/bang-gia">Bảng giá dịch vụ</Link></li>
                        </ul>
                    </div>

                    {/* Dự án */}
                    <div>
                        <h4 className="footer-col-title">DỰ ÁN</h4>
                        <ul className="footer-links-list">
                            <li><Link to="/ve-du-an">Giới thiệu</Link></li>
                            <li><Link to="/lien-he">Liên hệ & hỗ trợ</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom-bar">
                    <p>© 2026 LandmarkAI – GeoSpot AI. Đồ án học thuật, dữ liệu minh hoạ.</p>
                </div>
            </div>
        </footer>
    );
}

export default React.memo(ClientFooter);
