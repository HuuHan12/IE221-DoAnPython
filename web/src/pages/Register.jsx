import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApiErrorMessage, registerUserApi } from "../service/userService";
import "../css/Register.css";

function Register() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setError("");
        setSuccessMsg("");
        setRequiresEmailConfirmation(false);

        if (!email.trim() || !password) {
            setError("Vui lòng nhập đầy đủ email và mật khẩu.");
            return;
        }

        if (fullName.trim().length > 255) {
            setError("Họ và tên không được vượt quá 255 ký tự.");
            return;
        }

        if (password.length < 8 || password.length > 128) {
            setError("Mật khẩu phải có từ 8 đến 128 ký tự.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không trùng khớp.");
            return;
        }

        try {
            setLoading(true);
            const response = await registerUserApi({
                email: email.trim(),
                password,
                full_name: fullName.trim() || undefined,
            });

            const needsConfirmation = Boolean(response?.requires_email_confirmation);
            const message = response?.message || (
                needsConfirmation
                    ? "Tài khoản đã được tạo. Vui lòng xác nhận email trước khi đăng nhập."
                    : "Tạo tài khoản thành công."
            );
            setSuccessMsg(message);
            setRequiresEmailConfirmation(needsConfirmation);
            setPassword("");
            setConfirmPassword("");

            if (!needsConfirmation) {
                navigate("/login", { state: { successMessage: message } });
            }
        } catch (err) {
            setError(getApiErrorMessage(err, "Đăng ký không thành công. Vui lòng thử lại."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="register-page">
            <div className="register-main">
                <div className="register-card">
                    <div className="register-illustration">AI</div>

                    <h1>Tạo tài khoản</h1>
                    <p>Đăng ký để bắt đầu khám phá thế giới cùng AI</p>

                    {error && (
                        <div role="alert" style={{ padding: "10px 14px", backgroundColor: "#fef2f2", color: "#ef4444", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "16px", border: "1px solid #fecaca" }}>
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div role="status" style={{ padding: "10px 14px", backgroundColor: "#ecfdf5", color: "#047857", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "16px", border: "1px solid #a7f3d0" }}>
                            {successMsg}
                            {requiresEmailConfirmation && (
                                <div style={{ marginTop: "8px" }}>
                                    <Link to="/login">Đến trang đăng nhập</Link>
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="register-field">
                            <label htmlFor="name">Họ và tên</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Nhập họ và tên của bạn"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                maxLength={255}
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                required
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="password">Mật khẩu</label>
                            <input
                                id="password"
                                type="password"
                                required
                                placeholder="Nhập mật khẩu của bạn"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                maxLength={128}
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="confirm-password">Xác nhận mật khẩu</label>
                            <input
                                id="confirm-password"
                                type="password"
                                required
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                maxLength={128}
                            />
                        </div>

                        <button type="submit" className="register-button" disabled={loading}>
                            {loading ? "Đang xử lý..." : "Đăng ký"}
                        </button>
                    </form>

                    <div className="register-divider">hoặc đăng ký với</div>

                    <div className="social-register">
                        <button type="button">Google</button>
                        <button type="button">Apple</button>
                    </div>

                    <div className="login-link">
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Register;
