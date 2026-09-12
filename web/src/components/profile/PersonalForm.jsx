import React, { useState, useEffect, useRef } from "react";
import { User, Camera, Upload, Save } from "lucide-react";
import { getUserProfileApi, updateUserProfileApi } from "../../service/userService";
import { uploadMediaApi } from "../../service/mediaService";

function PersonalForm() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("https://api.dicebear.com/7.x/bottts/svg?seed=LandmarkAI");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const data = await getUserProfileApi();
                if (data.email) setEmail(data.email);
                else if (data.user?.email) setEmail(data.user.email);

                if (data.profile?.full_name) setFullName(data.profile.full_name);
                else if (data.full_name) setFullName(data.full_name);
            } catch (err) {
                const cached = localStorage.getItem("user_info");
                if (cached) {
                    try {
                        const parsed = JSON.parse(cached);
                        if (parsed.email) setEmail(parsed.email);
                        if (parsed.full_name) setFullName(parsed.full_name);
                        else if (parsed.profile?.full_name) setFullName(parsed.profile.full_name);
                    } catch (e) { }
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setStatusMsg(null);

        try {
            setSaving(true);
            await updateUserProfileApi({ full_name: fullName.trim() });
            setStatusMsg({ type: "success", text: "✓ Cập nhật thông tin cá nhân thành công!" });
            setTimeout(() => setStatusMsg(null), 3500);
        } catch (err) {
            setStatusMsg({ type: "error", text: err.message || "Không thể lưu thông tin. Vui lòng thử lại." });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatarUrl(previewUrl);
            try {
                const uploaded = await uploadMediaApi(file, "Ảnh đại diện avatar");
                if (uploaded?.media?.id) {
                    await updateUserProfileApi({ avatar_media_id: uploaded.media.id });
                    setStatusMsg({ type: "success", text: "✓ Đã cập nhật ảnh đại diện mới!" });
                    setTimeout(() => setStatusMsg(null), 3500);
                }
            } catch (err) {
                setStatusMsg({ type: "error", text: "Tải ảnh đại diện thất bại." });
            }
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

            {loading ? (
                <div className="api-loading-overlay" style={{ padding: "30px 0" }}>
                    <div className="api-loading-spinner"></div>
                    <p>Đang tải hồ sơ cá nhân từ API...</p>
                </div>
            ) : (
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
                                disabled
                                value={email}
                                placeholder="Nhập email của bạn"
                                style={{ backgroundColor: "#f8fafc", cursor: "not-allowed" }}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary-teal" disabled={saving || loading}>
                                <Save size={18} />
                                <span>{saving ? "Đang lưu..." : "Lưu thông tin"}</span>
                            </button>
                            {statusMsg && (
                                <span className={statusMsg.type === "success" ? "success-msg" : "error-msg"} style={{ color: statusMsg.type === "success" ? "#047857" : "#ef4444" }}>
                                    {statusMsg.text}
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
}

export default PersonalForm;
