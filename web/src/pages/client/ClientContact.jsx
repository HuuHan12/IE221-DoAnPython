import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import ClientLayout from "../../components/client/ClientLayout";
import "../../css/Client.css";

function ClientContact() {
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    return (
        <ClientLayout activeTab="contact">
            <section className="client-hero-section">
                <span className="client-hero-subtitle">LIÊN HỆ & HỖ TRỢ</span>
                <h1 className="client-hero-title">
                    Chúng tôi luôn sẵn sàng <span className="highlight-text">hỗ trợ</span> bạn
                </h1>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "40px", marginTop: "24px" }}>
                {/* Contact Info Card */}
                <div style={{ backgroundColor: "#ffffff", padding: "36px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "20px" }}>Thông tin liên hệ</h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", color: "#0d9488", flexShrink: 0 }}>
                                <MapPin size={20} />
                            </div>
                            <div>
                                <strong style={{ display: "block", fontSize: "0.95rem", color: "#0f172a" }}>Địa chỉ</strong>
                                <span style={{ fontSize: "0.88rem", color: "#64748b" }}>Trường Đại học FPT, Khu Công nghệ cao Hòa Lạc, Hà Nội</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", color: "#0d9488", flexShrink: 0 }}>
                                <Mail size={20} />
                            </div>
                            <div>
                                <strong style={{ display: "block", fontSize: "0.95rem", color: "#0f172a" }}>Email hỗ trợ</strong>
                                <span style={{ fontSize: "0.88rem", color: "#64748b" }}>support@landmarkai.vn</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                            <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", color: "#0d9488", flexShrink: 0 }}>
                                <Phone size={20} />
                            </div>
                            <div>
                                <strong style={{ display: "block", fontSize: "0.95rem", color: "#0f172a" }}>Hotline / Zalo</strong>
                                <span style={{ fontSize: "0.88rem", color: "#64748b" }}>+84 (0)988 123 456</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div style={{ backgroundColor: "#ffffff", padding: "36px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "var(--shadow-sm)" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "20px" }}>Gửi tin nhắn cho chúng tôi</h3>

                    {submitted ? (
                        <div style={{ padding: "20px", backgroundColor: "#ecfdf5", color: "#047857", borderRadius: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <CheckCircle2 size={24} />
                            <span>Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>Họ và tên</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nhập họ tên"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="client-search-input"
                                        style={{ paddingLeft: "16px" }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Nhập email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="client-search-input"
                                        style={{ paddingLeft: "16px" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>Chủ đề</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Chủ đề tin nhắn"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="client-search-input"
                                    style={{ paddingLeft: "16px" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>Lời nhắn</label>
                                <textarea
                                    rows="4"
                                    required
                                    placeholder="Nội dung bạn muốn trao đổi..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="client-search-input"
                                    style={{ paddingLeft: "16px", borderRadius: "14px", resize: "vertical" }}
                                />
                            </div>

                            <button type="submit" className="btn-client-scan" style={{ justifyContent: "center", borderRadius: "14px", marginTop: "8px" }}>
                                <Send size={16} /> Gửi tin nhắn
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}

export default ClientContact;
