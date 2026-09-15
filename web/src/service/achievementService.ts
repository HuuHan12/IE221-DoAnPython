import { getAuthToken } from "./userService";

const API_BASE_URL = "http://127.0.0.1:8000";

// ==========================================
// 1. DATA SCHEMAS & INTERFACES
// ==========================================

export interface AchievementItem {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    achievement_type: "streak" | "count" | "places" | "rank" | string;
    target_value: number;
    progress: number;
    progress_percent: number;
    is_unlocked: boolean;
    unlocked_at?: string | null;
}

export interface UserAchievementsResponse {
    status: string;
    total_achievements: number;
    unlocked_count: number;
    completion_rate: number;
    data: AchievementItem[];
}

export interface RecordCheckinResponse {
    status: string;
    message: string;
    total_checkins: number;
    new_unlocked: string[];
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
// 3. CORE ACHIEVEMENTS API CLIENTS
// ==========================================

/**
 * 1. Lấy danh sách thành tích và tiến độ của người dùng
 * GET /achievements/my
 */
export async function fetchMyAchievementsApi(): Promise<UserAchievementsResponse> {
    const response = await fetch(`${API_BASE_URL}/achievements/my`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể tải danh sách thành tích.");
    }

    return result;
}

/**
 * 2. Ghi nhận lượt check-in và tự động cộng dồn thành tích
 * POST /achievements/record-checkin
 */
export async function recordCheckinApi(): Promise<RecordCheckinResponse> {
    const response = await fetch(`${API_BASE_URL}/achievements/record-checkin`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể ghi nhận lượt check-in.");
    }

    return result;
}
