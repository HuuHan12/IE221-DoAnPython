import { Link } from "react-router-dom";
import "../css/Login.css";

function Login() {
    return (
        <div className="auth-page">
            <main className="auth-main">
                <div className="auth-card">
                    <div className="auth-illustration">
                        🗼
                    </div>

                    <h1>
                        Chào mừng trở lại!
                    </h1>

                    <p>
                        Đăng nhập để tiếp tục khám phá thế giới cùng AI
                    </p>

                    <form>

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Nhập email của bạn"
                        />

                        <label>
                            Mật khẩu
                        </label>

                        <input
                            type="password"
                            placeholder="Nhập mật khẩu của bạn"
                        />

                        <div className="forgot-password">
                            Quên mật khẩu?
                        </div>

                        <button type="submit">
                            Đăng nhập
                        </button>

                    </form>

                    <div className="auth-divider">
                        hoặc đăng nhập với
                    </div>

                    <div className="social-login">

                        <button type="button">
                            Google
                        </button>

                        <button type="button">
                            Apple
                        </button>

                    </div>

                    <div className="register-link">
                        Chưa có tài khoản?{" "}

                        <Link to="/register">
                            Đăng ký ngay
                        </Link>
                    </div>

                </div>

            </main>

        </div>
    );
}

export default Login;