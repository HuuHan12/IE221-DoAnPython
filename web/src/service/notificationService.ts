import { getAuthToken } from "./userService";

const API_BASE_URL = "http://127.0.0.1:8000";

// ==========================================
// 1. DATA SCHEMAS & INTERFACES
// ==========================================

export interface NotificationItem {
    id: string;
    user_id: string;
    type: "payment" | "achievement" | "system" | "contact" | "scan" | string;
    title: string;
    content?: string | null;
    is_read: boolean;
    read_at?: string | null;
    created_at: string;
}

export interface NotificationListResponse {
    status: string;
    unread_count: number;
    total: number;
    data: NotificationItem[];
}

export interface UnreadCountResponse {
    status: string;
    unread_count: number;
}

export interface MarkReadResponse {
    status: string;
    message: string;
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
// 3. CORE NOTIFICATIONS API CLIENTS
// ==========================================

/**
 * 1. Lấy số lượng thông báo chưa đọc
 * GET /notifications/unread-count
 */
export async function fetchUnreadCountApi(): Promise<UnreadCountResponse> {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể lấy số lượng thông báo chưa đọc.");
    }

    return result;
}

/**
 * 2. Lấy danh sách thông báo mới nhất
 * GET /notifications?unread_only=...&limit=...
 */
export async function fetchNotificationsApi(params?: {
    unread_only?: boolean;
    limit?: number;
}): Promise<NotificationListResponse> {
    const query = new URLSearchParams();
    if (params?.unread_only !== undefined) {
        query.set("unread_only", String(params.unread_only));
    }
    if (params?.limit !== undefined) {
        query.set("limit", String(params.limit));
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await fetch(`${API_BASE_URL}/notifications${queryString}`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể tải danh sách thông báo.");
    }

    return result;
}

/**
 * 3. Đánh dấu một thông báo cụ thể là đã đọc
 * PATCH /notifications/{notification_id}/read
 */
export async function markNotificationAsReadApi(notification_id: string): Promise<MarkReadResponse> {
    const response = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(notification_id)}/read`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể cập nhật trạng thái thông báo.");
    }

    return result;
}

/**
 * 4. Đánh dấu tất cả thông báo là đã đọc
 * PATCH /notifications/read-all
 */
export async function markAllNotificationsAsReadApi(): Promise<MarkReadResponse> {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể đánh dấu tất cả thông báo là đã đọc.");
    }

    return result;
}
