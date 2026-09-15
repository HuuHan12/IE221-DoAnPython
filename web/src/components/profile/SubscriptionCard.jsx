import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, ShieldCheck, Zap, ArrowUpRight, Loader2, Clock } from "lucide-react";
import { fetchMySubscriptionApi, createPaymentQRApi } from "../../service/paymentService";
import PaymentQRModal from "../payment/PaymentQRModal";

function SubscriptionCard() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [isCreatingQR, setIsCreatingQR] = useState(false);

    const loadSubscription = async () => {
        try {
            setLoading(true);
            const data = await fetchMySubscriptionApi();
            setSubscription(data);
        } catch {
            //
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubscription();
    }, []);

    const handleUpgradeClick = async () => {
        try {
            setIsCreatingQR(true);
            const qrRes = await createPaymentQRApi("pro", 1);
            setPaymentData(qrRes);
            setIsPaymentModalOpen(true);
        } catch (error) {
            alert(error.message || "Không thể tạo mã thanh toán.");
        } finally {
            setIsCreatingQR(false);
        }
    };

    const handlePaymentSuccess = () => {
        loadSubscription();
    };

    const isPro = subscription?.plan_code === "pro";

    return (
        <div className="profile-card-section">
            <div className="card-header-title space-between">
                <div className="left-title">
                    <div className="title-icon-wrapper" style={{ backgroundColor: "#E0F2FE" }}>
                        <CreditCard size={18} color="#0284C7" />
                    </div>
                    <div>
                        <h2>Gói Dịch vụ & Hạn mức sử dụng</h2>
                        <span style={{ fontSize: "13px", color: "#64748B" }}>
                            Thông tin gói tài khoản và đặc quyền trải nghiệm trên LandmarkAI
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="btn-profile-primary"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        backgroundColor: isPro ? "#0D9488" : "#009080",
                    }}
                    onClick={handleUpgradeClick}
                    disabled={isCreatingQR}
                >
                    {isCreatingQR ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Đang tạo QR...</span>
                        </>
                    ) : (
                        <>
                            <Zap size={16} />
                            <span>{isPro ? "Gia hạn gói Pro" : "Nâng cấp lên Pro"}</span>
                        </>
                    )}
                </button>
            </div>

            {loading ? (
                <div style={{ padding: "20px 0", display: "flex", alignItems: "center", gap: "10px", color: "#64748B" }}>
                    <Loader2 size={18} className="animate-spin" color="#009080" />
                    <span>Đang tải thông tin gói cước...</span>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "12px" }}>
                    {/* Thẻ 1: Gói hiện tại */}
                    <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                        <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>
                            Gói hiện tại
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: isPro ? "#009080" : "#0F172A" }}>
                                {subscription?.plan_name || "Free"}
                            </h3>
                            <span
                                style={{
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    backgroundColor: isPro ? "#D1FAE5" : "#E2E8F0",
                                    color: isPro ? "#065F46" : "#475569",
                                }}
                            >
                                {subscription?.subscription_status === "active" ? "Đang hoạt động" : "Hết hạn"}
                            </span>
                        </div>
                    </div>

                    {/* Thẻ 2: Hạn mức scan / ngày */}
                    <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                        <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>
                            Hạn mức scan ảnh
                        </span>
                        <div style={{ marginTop: "6px" }}>
                            <span style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A" }}>
                                {subscription?.scan_limit_per_day === -1
                                    ? "Không giới hạn"
                                    : `${subscription?.scan_limit_per_day || 10} lượt`}
                            </span>
                            <span style={{ fontSize: "13px", color: "#64748B", marginLeft: "4px" }}>/ ngày</span>
                        </div>
                    </div>

                    {/* Thẻ 3: Thời hạn sử dụng */}
                    <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px" }}>
                        <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>
                            Thời gian còn lại
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                            <Clock size={18} color="#F59E0B" />
                            <span style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A" }}>
                                {subscription?.days_remaining !== null && subscription?.days_remaining !== undefined
                                    ? `${subscription.days_remaining} ngày`
                                    : "Vô thời hạn (Gói Free)"}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thanh toán QR khi bấm Nâng cấp */}
            <PaymentQRModal
                isOpen={isPaymentModalOpen}
                paymentData={paymentData}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}

export default SubscriptionCard;
