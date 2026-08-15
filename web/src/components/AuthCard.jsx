import { useState } from "react";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react";

import SocialLogin from "./SocialLogin";
import "../css/AuthCard.css";

function AuthCard() {
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log("Login:", form);

        // TODO:
        // gọi API login ở đây
    };

    return (
        <section className="auth-card">

            {/* Illustration */}

            <div className="auth-illustration">
                <div className="illustration-circle">
                    <span>🗼</span>
                    <span>🏛️</span>
                    <span>🏔️</span>
                </div>
            </div>

            {/* Heading */}

            <div className="auth-heading">
                <h1>Chào mừng trở lại!</h1>

                <p>
                    Đăng nhập để tiếp tục khám phá thế giới cùng AI
                </p>
            </div>

            <form onSubmit={handleSubmit}>

                {/* Email */}

                <div className="form-group">
                    <label htmlFor="email">
                        Email
                    </label>

                    <div className="input-wrapper">
                        <Mail size={20} />

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Nhập email của bạn"
                            required
                        />
                    </div>
                </div>

                {/* Password */}

                <div className="form-group">
                    <label htmlFor="password">
                        Mật khẩu
                    </label>

                    <div className="input-wrapper">
                        <Lock size={20} />

                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu của bạn"
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowPassword((prev) => !prev)
                            }
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Forgot password */}

                <div className="forgot-password">
                    <a href="#">
                        Quên mật khẩu?
                    </a>
                </div>

                {/* Login */}

                <button
                    type="submit"
                    className="login-button"
                >
                    Đăng nhập
                </button>

            </form>

            <SocialLogin />

            {/* Register */}

            <div className="register-text">
                Chưa có tài khoản?

                <a href="#">
                    Đăng ký ngay
                </a>
            </div>

        </section>
    );
}

export default AuthCard;