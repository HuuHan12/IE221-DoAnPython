import { Link } from "react-router-dom";
import "../css/NotFound.css";

function NotFound() {
    return (
        <main className="not-found-page">

            <div className="not-found-card">

                <div className="not-found-code">
                    404
                </div>

                <h1>
                    Không tìm thấy trang
                </h1>

                <p>
                    Trang bạn đang tìm kiếm không tồn tại
                    hoặc đã được chuyển sang địa chỉ khác.
                </p>

                <Link
                    to="/"
                    className="back-home-button"
                >
                    ← Quay về trang chủ
                </Link>

            </div>

        </main>
    );
}

export default NotFound;