import React, { useState } from "react";
import { Lock, Eye, EyeOff, Key } from "lucide-react";
import { changePasswordApi } from "../../service/userService";

function PasswordForm() {
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMsg(null);

        if (!currentPass || !newPass || !confirmPass) {
            setStatusMsg({ type: "error", text: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới." });
            return;
        }

        if (newPass.length < 8) {
            setStatusMsg({ type: "error", text: "Mật khẩu mới phải có ít nhất 8 ký tự." });
            return;
        }

        if (newPass !== confirmPass) {
            setStatusMsg({ type: "error", text: "Mật khẩu mới không trùng khớp." });
            return;
        }

        try {
            setLoading(true);
            await changePasswordApi({
                current_password: currentPass,
                new_password: newPass,
            });
            setStatusMsg({ type: "success", text: "✓ Cập nhật mật khẩu thành công!" });
            setCurrentPass("");
            setNewPass("");
            setConfirmPass("");
            setTimeout(() => setStatusMsg(null), 3500);
        } catch (err) {
            setStatusMsg({ type: "error", text: err.message || "Đổi mật khẩu thất bại." });
        } finally {
            setLoading(false);
        }
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
                            required
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
                            required
                            placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
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
                            required
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
                    <button type="submit" className="btn-primary-teal" disabled={loading}>
                        <Key size={18} />
                        <span>{loading ? "Đang đổi..." : "Cập nhật mật khẩu"}</span>
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
