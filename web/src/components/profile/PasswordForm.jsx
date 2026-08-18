import { useState } from "react";
import { Lock, Eye, EyeOff, Key } from "lucide-react";

function PasswordForm() {
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [statusMsg, setStatusMsg] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!currentPass || !newPass || !confirmPass) {
            setStatusMsg({ type: "error", text: "Vui lòng nhập đầy đủ thông tin mật khẩu." });
            return;
        }
        if (newPass !== confirmPass) {
            setStatusMsg({ type: "error", text: "Mật khẩu mới không trùng khớp." });
            return;
        }
        setStatusMsg({ type: "success", text: "Cập nhật mật khẩu thành công!" });
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
        setTimeout(() => setStatusMsg(null), 3500);
    };

    return (
        <section className="profile-card-section">
            <div className="card-header-title">
                <div className="title-icon-wrapper">
                    <Lock size={20} color="#009080" />
                </div>
                <h2>Đổi mật khẩu</h2>
            </div>

            <form className="password-form-grid" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Mật khẩu hiện tại</label>
                    <div className="input-with-icon">
                        <input
                            type={showCurrent ? "text" : "password"}
                            className="form-input"
                            placeholder="Nhập mật khẩu hiện tại"
                            value={currentPass}
                            onChange={(e) => setCurrentPass(e.target.value)}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowCurrent(!showCurrent)}
                        >
                            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Mật khẩu mới</label>
                    <div className="input-with-icon">
                        <input
                            type={showNew ? "text" : "password"}
                            className="form-input"
                            placeholder="Nhập mật khẩu mới"
                            value={newPass}
                            onChange={(e) => setNewPass(e.target.value)}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowNew(!showNew)}
                        >
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Xác nhận mật khẩu mới</label>
                    <div className="input-with-icon">
                        <input
                            type={showConfirm ? "text" : "password"}
                            className="form-input"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPass}
                            onChange={(e) => setConfirmPass(e.target.value)}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowConfirm(!showConfirm)}
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="password-action-container">
                    <button type="submit" className="btn-primary-teal">
                        <Key size={18} />
                        <span>Cập nhật mật khẩu</span>
                    </button>
                </div>
            </form>

            {statusMsg && (
                <div className={`form-feedback-alert ${statusMsg.type}`}>
                    {statusMsg.text}
                </div>
            )}
        </section>
    );
}

export default PasswordForm;
