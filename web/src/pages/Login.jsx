import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUserApi } from "../service/userService";
import "../css/Login.css";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Vui lòng nhập đầy đủ email và mật khẩu.");
            return;
        }

        try {
            setLoading(true);
            await loginUserApi({ email: email.trim(), password });
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Đăng nhập không thành công. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <main className="auth-main">
                <div className="auth-card">
                    <div className="auth-illustration">🗼</div>

                    <h1>Chào mừng trở lại!</h1>
                    <p>Đăng nhập để tiếp tục khám phá thế giới cùng AI</p>

                    {error && (
                        <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "16px", border: "1px solid #fecaca" }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            placeholder="Nhập email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            required
                            placeholder="Nhập mật khẩu của bạn"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div className="forgot-password">Quên mật khẩu?</div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Đăng nhập"}
                        </button>
                    </form>

                    <div className="auth-divider">hoặc đăng nhập với</div>

                    <div className="social-login">
                        <button type="button">Google</button>
                        <button type="button">Apple</button>
                    </div>

                    <div className="register-link">
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Login;