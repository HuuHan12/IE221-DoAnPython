import React, { useState, useEffect, useRef } from "react";
import {
    X,
    Copy,
    Check,
    Clock,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ShieldCheck,
    Send,
    Hourglass
} from "lucide-react";
import {
    checkPaymentStatusApi,
    submitTransferApi
} from "../../service/paymentService";
import "../../css/PaymentModal.css";

function PaymentQRModal({ isOpen, paymentData, onClose, onSuccess }) {
    const [copiedContent, setCopiedContent] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 phút
    const [transactionRef, setTransactionRef] = useState("");
    const [submittedRef, setSubmittedRef] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPendingVerification, setIsPendingVerification] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [statusError, setStatusError] = useState("");

    const orderCode = paymentData?.order_code;
    const pollingTimerRef = useRef(null);

    // Reset state khi modal mở với đơn hàng mới
    useEffect(() => {
        if (isOpen) {
            setIsCompleted(false);
            setIsPendingVerification(false);
            setTransactionRef("");
            setSubmittedRef("");
            setStatusError("");
        }
    }, [isOpen, paymentData?.order_code]);

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
                    setIsPendingVerification(false);
                    if (onSuccess) {
                        onSuccess(res);
                    }
                } else if (res.order_status === "pending_verification") {
                    setIsPendingVerification(true);
                    if (res.transaction_ref) {
                        setSubmittedRef(res.transaction_ref);
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

    // Xử lý gửi mã giao dịch ngân hàng (Chống khai báo khống)
    const handleSubmitTransfer = async (e) => {
        if (e) e.preventDefault();
        if (!orderCode || isSubmitting) return;

        const cleanRef = transactionRef.trim();
        if (!cleanRef || cleanRef.length < 4) {
            setStatusError("Vui lòng nhập mã giao dịch hợp lệ từ ứng dụng ngân hàng (tối thiểu 4 ký tự).");
            return;
        }

        try {
            setIsSubmitting(true);
            setStatusError("");
            const res = await submitTransferApi(orderCode, cleanRef);
            setSubmittedRef(cleanRef);
            setIsPendingVerification(true);
        } catch (err) {
            setStatusError(err.message || "Không thể gửi xác nhận chuyển khoản. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
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

                {/* 1. Màn hình thanh toán thành công */}
                {isCompleted ? (
                    <div className="payment-success-view">
                        <div className="success-icon-bounce">
                            <CheckCircle2 size={64} color="#10B981" />
                        </div>
                        <h2 className="success-main-title">Kích hoạt thành công!</h2>
                        <p className="success-desc">
                            Gói cước <strong>{paymentData.plan_name}</strong> của bạn đã được phê duyệt và kích hoạt thành công trên hệ thống.
                        </p>

                        <div className="success-details-card">
                            <div className="success-row">
                                <span>Mã đơn hàng:</span>
                                <strong>{paymentData.order_code}</strong>
                            </div>
                            <div className="success-row">
                                <span>Số tiền thanh toán:</span>
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
                ) : isPendingVerification ? (
                    /* 2. Màn hình chờ đối soát xác minh */
                    <div className="payment-pending-view">
                        <div className="pending-icon-pulse">
                            <Hourglass size={36} color="#D97706" />
                        </div>
                        <div className="pending-badge">
                            <Clock size={13} />
                            <span>ĐANG CHỜ ĐỐI SOÁT</span>
                        </div>
                        <h2 className="pending-main-title">Đã tiếp nhận thông tin chuyển khoản</h2>
                        <p className="pending-desc">
                            Thông tin giao dịch của bạn đã được gửi đến ban quản trị để đối soát với tài khoản ngân hàng. Gói cước Pro sẽ được kích hoạt ngay khi xác nhận thành công.
                        </p>

                        <div className="pending-details-card">
                            <div className="pending-row">
                                <span>Mã đơn hàng:</span>
                                <strong>{paymentData.order_code}</strong>
                            </div>
                            <div className="pending-row">
                                <span>Mã GD ngân hàng:</span>
                                <strong style={{ color: "#009080", fontFamily: "monospace" }}>
                                    {submittedRef || transactionRef}
                                </strong>
                            </div>
                            <div className="pending-row">
                                <span>Số tiền cần đối soát:</span>
                                <strong>{paymentData.formatted_amount}</strong>
                            </div>
                            <div className="pending-row">
                                <span>Trạng thái:</span>
                                <span className="pending-status-badge">
                                    <Loader2 size={12} className="animate-spin" />
                                    Chờ quản trị viên duyệt
                                </span>
                            </div>
                        </div>

                        <div className="auto-polling-indicator">
                            <Loader2 size={16} className="animate-spin" color="#009080" />
                            <span>Hệ thống đang tự động lắng nghe kết quả phê duyệt...</span>
                        </div>

                        <div className="pending-actions-row">
                            <button
                                type="button"
                                className="btn-close-pending"
                                onClick={onClose}
                            >
                                Đóng và tiếp tục trải nghiệm
                            </button>
                        </div>
                    </div>
                ) : (
                    /* 3. Màn hình quét mã QR chuyển khoản và nhập mã đối soát */
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
                                    Mở ứng dụng Ngân hàng (TPBank, Vietcombank, MB, Momo...) quét mã để chuyển đúng số tiền và nội dung.
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
                                    <span>Hệ thống tự động kiểm tra giao dịch mỗi 3s...</span>
                                </div>
                            </div>
                        </div>

                        {/* Form xác nhận đã chuyển khoản (Chống khai báo khống) */}
                        <div className="payment-confirmation-box">
                            <div className="confirmation-header">
                                <Send size={16} color="#009080" />
                                <h4>Xác nhận đã chuyển khoản</h4>
                            </div>
                            <p className="confirmation-desc">
                                Sau khi chuyển khoản thành công trên app ngân hàng, vui lòng nhập <strong>Mã giao dịch / Số tham chiếu</strong> (VD: FT26263..., 0879...) để quản trị viên đối soát:
                            </p>
                            <form onSubmit={handleSubmitTransfer} className="confirmation-form">
                                <div className="ref-input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Nhập mã giao dịch ngân hàng..."
                                        value={transactionRef}
                                        onChange={(e) => {
                                            setTransactionRef(e.target.value);
                                            if (statusError) setStatusError("");
                                        }}
                                        className="ref-input"
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="submit"
                                        className="btn-submit-ref"
                                        disabled={isSubmitting || !transactionRef.trim()}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Đang gửi...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send size={15} />
                                                <span>Tôi đã chuyển khoản</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaymentQRModal;
