import React, { useState, useEffect, useRef } from "react";
import {
    X,
    Copy,
    Check,
    Clock,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    Zap,
    ExternalLink
} from "lucide-react";
import { checkPaymentStatusApi, simulatePaymentSuccessApi } from "../../service/paymentService";
import "../../css/PaymentModal.css";

function PaymentQRModal({ isOpen, paymentData, onClose, onSuccess }) {
    const [copiedContent, setCopiedContent] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 phút
    const [isSimulating, setIsSimulating] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [statusError, setStatusError] = useState("");

    const orderCode = paymentData?.order_code;
    const pollingTimerRef = useRef(null);

    // Đồng hồ đếm ngược
    useEffect(() => {
        if (!isOpen || isCompleted) return;
        setTimeLeft(paymentData?.expires_in_seconds || 900);

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, paymentData, isCompleted]);

    // Polling tự động kiểm tra trạng thái đơn hàng (mỗi 3 giây)
    useEffect(() => {
        if (!isOpen || !orderCode || isCompleted) return;

        const pollStatus = async () => {
            try {
                const res = await checkPaymentStatusApi(orderCode);
                if (res.is_completed || res.order_status === "completed") {
                    setIsCompleted(true);
                    if (onSuccess) {
                        onSuccess(res);
                    }
                }
            } catch (err) {
                // Bỏ qua lỗi kết nối tạm thời trong polling
            }
        };

        // Poll ngay lần đầu
        pollStatus();
        pollingTimerRef.current = setInterval(pollStatus, 3000);

        return () => {
            if (pollingTimerRef.current) {
                clearInterval(pollingTimerRef.current);
            }
        };
    }, [isOpen, orderCode, isCompleted, onSuccess]);

    if (!isOpen || !paymentData) return null;

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const handleCopy = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === "content") {
            setCopiedContent(true);
            setTimeout(() => setCopiedContent(false), 2000);
        } else if (type === "account") {
            setCopiedAccount(true);
            setTimeout(() => setCopiedAccount(false), 2000);
        }
    };

    // Xử lý nút Giả lập thanh toán thành công (Phục vụ Demo kiểm thử)
    const handleSimulateSuccess = async () => {
        if (!orderCode || isSimulating) return;
        try {
            setIsSimulating(true);
            setStatusError("");
            const res = await simulatePaymentSuccessApi(orderCode);
            setIsCompleted(true);
            if (onSuccess) {
                onSuccess(res);
            }
        } catch (err) {
            setStatusError(err.message || "Không thể giả lập thanh toán.");
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="payment-modal-backdrop" onClick={onClose}>
            <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
                {/* Header Modal */}
                <div className="payment-modal-header">
                    <div className="header-title-box">
                        <div className="header-icon-badge">
                            <ShieldCheck size={20} color="#009080" />
                        </div>
                        <div>
                            <h3 className="payment-title">Thanh toán gói {paymentData.plan_name}</h3>
                            <p className="payment-subtitle">Quét mã QR bằng App Ngân hàng hoặc Ví điện tử</p>
                        </div>
                    </div>
                    <button type="button" className="btn-close-modal" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {isCompleted ? (
                    /* Màn hình thanh toán thành công */
                    <div className="payment-success-view">
                        <div className="success-icon-bounce">
                            <CheckCircle2 size={64} color="#10B981" />
                        </div>
                        <h2 className="success-main-title">Thanh toán thành công!</h2>
                        <p className="success-desc">
                            Gói cước <strong>{paymentData.plan_name}</strong> của bạn đã được kích hoạt thành công trên hệ thống.
                        </p>

                        <div className="success-details-card">
                            <div className="success-row">
                                <span>Mã đơn hàng:</span>
                                <strong>{paymentData.order_code}</strong>
                            </div>
                            <div className="success-row">
                                <span>Số tiền đã thanh toán:</span>
                                <strong>{paymentData.formatted_amount}</strong>
                            </div>
                            <div className="success-row">
                                <span>Thời hạn gói:</span>
                                <strong>30 ngày sử dụng</strong>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="btn-complete-modal"
                            onClick={onClose}
                        >
                            Bắt đầu khám phá ngay
                        </button>
                    </div>
                ) : (
                    /* Màn hình quét mã QR chuyển khoản */
                    <div className="payment-modal-body">
                        {statusError && (
                            <div className="payment-alert-error">
                                <AlertCircle size={16} />
                                <span>{statusError}</span>
                            </div>
                        )}

                        <div className="payment-grid-2cols">
                            {/* Cột trái: Ảnh QR VietQR Napas 247 */}
                            <div className="qr-image-container">
                                <div className="qr-frame-wrapper">
                                    <img
                                        src={paymentData.qr_url}
                                        alt="VietQR Payment Code"
                                        className="vietqr-image"
                                    />
                                </div>
                                <div className="qr-countdown-badge">
                                    <Clock size={15} color="#F59E0B" />
                                    <span>Hết hạn sau: <strong>{formatCountdown(timeLeft)}</strong></span>
                                </div>
                                <div className="qr-hint-text">
                                    Mở ứng dụng Ngân hàng (TPBank, Vietcombank, MB, Momo...) chọn <strong>Quét mã QR</strong>
                                </div>
                            </div>

                            {/* Cột phải: Thông tin chuyển khoản chi tiết */}
                            <div className="payment-info-container">
                                <div className="payment-amount-box">
                                    <span className="amount-label">Số tiền thanh toán</span>
                                    <span className="amount-val">{paymentData.formatted_amount}</span>
                                </div>

                                <div className="transfer-info-list">
                                    <div className="info-field-group">
                                        <label>Ngân hàng thụ hưởng</label>
                                        <div className="info-readonly-val">
                                            <strong>{paymentData.bank_info?.bank_name} ({paymentData.bank_info?.bank_id})</strong>
                                        </div>
                                    </div>

                                    <div className="info-field-group">
                                        <label>Số tài khoản</label>
                                        <div className="info-with-copy-row">
                                            <span className="value-code">{paymentData.bank_info?.account_no}</span>
                                            <button
                                                type="button"
                                                className="btn-copy-action"
                                                onClick={() => handleCopy(paymentData.bank_info?.account_no, "account")}
                                            >
                                                {copiedAccount ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                                                <span>{copiedAccount ? "Đã chép" : "Sao chép"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="info-field-group">
                                        <label>Chủ tài khoản</label>
                                        <div className="info-readonly-val">
                                            <strong>{paymentData.bank_info?.account_name}</strong>
                                        </div>
                                    </div>

                                    <div className="info-field-group highlighted-group">
                                        <label>Nội dung chuyển khoản (Bắt buộc đúng)</label>
                                        <div className="info-with-copy-row highlight-box">
                                            <span className="value-code highlight-text">{paymentData.payment_content}</span>
                                            <button
                                                type="button"
                                                className="btn-copy-action primary"
                                                onClick={() => handleCopy(paymentData.payment_content, "content")}
                                            >
                                                {copiedContent ? <Check size={14} color="#FFFFFF" /> : <Copy size={14} />}
                                                <span>{copiedContent ? "Đã chép" : "Sao chép"}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="auto-polling-indicator">
                                    <Loader2 size={16} className="animate-spin" color="#009080" />
                                    <span>Hệ thống đang tự động kiểm tra giao dịch...</span>
                                </div>
                            </div>
                        </div>

                        {/* Nút hành động bổ trợ: Giả lập thanh toán thành công (Phục vụ Demo) */}
                        <div className="payment-modal-footer">
                            <div className="demo-notice-text">
                                <Zap size={14} color="#009080" />
                                <span>Chế độ Demo: Bạn có thể giả lập hoàn tất chuyển khoản để kích hoạt gói ngay mà không cần chuyển tiền.</span>
                            </div>
                            <button
                                type="button"
                                className="btn-simulate-payment"
                                onClick={handleSimulateSuccess}
                                disabled={isSimulating}
                            >
                                {isSimulating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Đang kích hoạt gói cước...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        <span>Giả lập thanh toán thành công (Demo)</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentQRModal;
