import { getAuthToken } from "./userService";

const API_BASE_URL = "http://127.0.0.1:8000";

// ==========================================
// 1. DATA SCHEMAS & INTERFACES
// ==========================================

export interface PricingPlanItem {
    code: string;
    name: string;
    tagline?: string | null;
    price: number;
    currency: string;
    formatted_price: string;
    billing_period: string;
    duration_days: number;
    scan_limit_per_day: number;
    max_resolution?: string | null;
    gps_radius?: string | null;
    history_limit?: number | null;
    features: string[];
    badge?: string | null;
    is_active: boolean;
}

export interface PricingPlansResponse {
    status: string;
    total_plans: number;
    data: PricingPlanItem[];
}

export interface BankInfo {
    bank_id: string;
    bank_name: string;
    account_no: string;
    account_name: string;
}

export interface PaymentQRResponse {
    status: string;
    order_code: string;
    plan_code: string;
    plan_name: string;
    amount: number;
    formatted_amount: string;
    currency: string;
    qr_url: string;
    bank_info: BankInfo;
    payment_content: string;
    expires_at: string;
    expires_in_seconds: number;
}

export interface PaymentStatusResponse {
    status: string;
    order_code: string;
    order_status: "pending" | "completed" | "expired" | "cancelled" | string;
    plan_code: string;
    amount: number;
    is_completed: boolean;
    completed_at?: string | null;
}

export interface UserSubscriptionResponse {
    status: string;
    user_id: string;
    plan_code: "free" | "pro" | "enterprise" | string;
    plan_name: string;
    subscription_status: "active" | "expired" | string;
    scan_limit_per_day: number;
    start_date?: string | null;
    end_date?: string | null;
    days_remaining?: number | null;
    is_active: boolean;
}

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

// ==========================================
// 3. CORE PAYMENTS & PRICING API CLIENTS
// ==========================================

/**
 * 1. Lấy danh sách tất cả các gói cước
 * GET /payments/plans
 */
export async function fetchPricingPlansApi(): Promise<PricingPlansResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/plans`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể tải danh sách gói cước.");
    }

    return result;
}

/**
 * 2. Tạo đơn hàng và sinh mã VietQR thanh toán
 * POST /payments/create-qr?plan_code=...&duration_months=...
 */
export async function createPaymentQRApi(
    plan_code: string = "pro",
    duration_months: number = 1
): Promise<PaymentQRResponse> {
    const response = await fetch(
        `${API_BASE_URL}/payments/create-qr?plan_code=${encodeURIComponent(plan_code)}&duration_months=${duration_months}`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ plan_code, duration_months }),
        }
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể tạo mã QR thanh toán.");
    }

    return result;
}

/**
 * 3. Kiểm tra trạng thái thanh toán của đơn hàng
 * GET /payments/status/{order_code}
 */
export async function checkPaymentStatusApi(order_code: string): Promise<PaymentStatusResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/status/${encodeURIComponent(order_code)}`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể kiểm tra trạng thái thanh toán.");
    }

    return result;
}

/**
 * 4. Giả lập thanh toán thành công (Phục vụ Demo/Test)
 * POST /payments/simulate-success?order_code=...
 */
export async function simulatePaymentSuccessApi(order_code: string): Promise<PaymentStatusResponse> {
    const response = await fetch(
        `${API_BASE_URL}/payments/simulate-success?order_code=${encodeURIComponent(order_code)}`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ order_code }),
        }
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể giả lập thanh toán thành công.");
    }

    return result;
}

/**
 * 5. Lấy thông tin gói cước hiện tại của người dùng
 * GET /payments/my-subscription
 */
export async function fetchMySubscriptionApi(): Promise<UserSubscriptionResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/my-subscription`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể tải thông tin gói cước của bạn.");
    }

    return result;
}
