import { getAuthToken } from "./userService";

const API_BASE_URL = "http://127.0.0.1:8000";

// ==========================================
// 1. DATA SCHEMAS & INTERFACES
// ==========================================

export interface ContactFormPayload {
    full_name: string;
    email: string;
    subject: string;
    phone?: string;
    message: string;
}

export interface ContactMessageItem {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    status: string;
    created_at?: string;
}

export interface ContactSubmitResponse {
    status: string;
    message: string;
    data?: ContactMessageItem;
}

export interface ContactSubjectsResponse {
    status: string;
    subjects: string[];
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
// 3. CORE CONTACT API CLIENTS
// ==========================================

/**
 * 1. Lấy danh sách các chủ đề liên hệ
 * GET /contact/subjects
 */
export async function fetchContactSubjectsApi(): Promise<ContactSubjectsResponse> {
    const response = await fetch(`${API_BASE_URL}/contact/subjects`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể tải danh sách chủ đề liên hệ.");
    }

    return result;
}

/**
 * 2. Gửi form lời nhắn liên hệ
 * POST /contact/submit
 */
export async function submitContactMessageApi(
    payload: ContactFormPayload
): Promise<ContactSubmitResponse> {
    const response = await fetch(`${API_BASE_URL}/contact/submit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể gửi lời nhắn. Vui lòng thử lại.");
    }

    return result;
}
