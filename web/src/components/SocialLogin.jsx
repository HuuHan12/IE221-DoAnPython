import { Apple } from "lucide-react";
import "../css/SocialLogin.css";

function SocialLogin() {
    return (
        <>
            <div className="social-divider">
                <span></span>
                <p>hoặc đăng nhập với</p>
                <span></span>
            </div>

            <div className="social-buttons">
                <button type="button" className="social-button">
                    <span className="google-icon">G</span>
                    Google
                </button>

                <button type="button" className="social-button">
                    <Apple size={20} fill="black" />
                    Apple
                </button>
            </div>
        </>
    );
}

export default SocialLogin;