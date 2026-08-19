import { useState, useRef } from "react";
import { User, Camera, Upload, Save } from "lucide-react";

function PersonalForm() {
    const [fullName, setFullName] = useState("Nguyễn Văn A");
    const [email, setEmail] = useState("nguyenvana@example.com");
    const [savedMsg, setSavedMsg] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("https://api.dicebear.com/7.x/bottts/svg?seed=NguyenVanA");
    const fileInputRef = useRef(null);

    const handleSave = (e) => {
        e.preventDefault();
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAvatarUrl(url);
        }
    };

    return (
        <section className="profile-card-section">
            <div className="card-header-title">
                <div className="title-icon-wrapper">
                    <User size={20} color="#009080" />
                </div>
                <h2>Thông tin cá nhân</h2>
            </div>

            <div className="personal-info-body">
                {/* Left: Avatar Upload */}
                <div className="avatar-upload-column">
                    <div className="avatar-container">
                        <img src={avatarUrl} alt="User Avatar" className="avatar-img" />
                        <button
                            type="button"
                            className="avatar-camera-btn"
                            onClick={() => fileInputRef.current?.click()}
                            title="Thay đổi ảnh đại diện"
                        >
                            <Camera size={16} color="#009080" />
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/png, image/jpeg, image/webp"
                        style={{ display: "none" }}
                    />

                    <button
                        type="button"
                        className="btn-upload-avatar"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload size={16} />
                        <span>Tải ảnh lên</span>
                    </button>
                    <span className="upload-hint">JPG, PNG tối đa 2MB</span>
                </div>

                {/* Right: Personal Info Fields */}
                <form className="personal-info-form" onSubmit={handleSave}>
                    <div className="form-group">
                        <label className="form-label">Họ và tên</label>
                        <input
                            type="text"
                            className="form-input"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Nhập họ và tên"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email của bạn"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-primary-teal">
                            <Save size={18} />
                            <span>Lưu thông tin</span>
                        </button>
                        {savedMsg && (
                            <span className="success-msg">✓ Đã lưu thay đổi!</span>
                        )}
                    </div>
                </form>
            </div>
        </section>
    );
}

export default PersonalForm;
