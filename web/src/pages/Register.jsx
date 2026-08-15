import { Link } from "react-router-dom";
import "../css/Register.css";

function Register() {
    return (
        <main className="register-page">

            <div className="register-main">

                <div className="register-card">

                    {/* =========================================
                        ILLUSTRATION
                    ========================================= */}

                    <div className="register-illustration">
                        AI
                    </div>


                    {/* =========================================
                        TITLE
                    ========================================= */}

                    <h1>
                        Tạo tài khoản
                    </h1>

                    <p>
                        Đăng ký để bắt đầu khám phá thế giới cùng AI
                    </p>


                    {/* =========================================
                        FORM
                    ========================================= */}

                    <form>

                        {/* NAME */}

                        <div className="register-field">

                            <label htmlFor="name">
                                Họ và tên
                            </label>

                            <input
                                id="name"
                                type="text"
                                placeholder="Nhập họ và tên của bạn"
                            />

                        </div>


                        {/* EMAIL */}

                        <div className="register-field">

                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Nhập email của bạn"
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="register-field">

                            <label htmlFor="password">
                                Mật khẩu
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Nhập mật khẩu của bạn"
                            />

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="register-field">

                            <label htmlFor="confirm-password">
                                Xác nhận mật khẩu
                            </label>

                            <input
                                id="confirm-password"
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                            />

                        </div>


                        {/* REGISTER BUTTON */}

                        <button
                            type="submit"
                            className="register-button"
                        >
                            Đăng ký
                        </button>

                    </form>


                    {/* =========================================
                        DIVIDER
                    ========================================= */}

                    <div className="register-divider">
                        hoặc đăng ký với
                    </div>


                    {/* =========================================
                        SOCIAL REGISTER
                    ========================================= */}

                    <div className="social-register">

                        <button type="button">
                            Google
                        </button>

                        <button type="button">
                            Apple
                        </button>

                    </div>


                    {/* =========================================
                        LOGIN LINK
                    ========================================= */}

                    <div className="login-link">

                        Đã có tài khoản?{" "}

                        <Link to="/login">
                            Đăng nhập
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}

export default Register;