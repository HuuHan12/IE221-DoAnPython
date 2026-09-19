const FALLBACK_API_BASE_URL = "http://127.0.0.1:8000";
const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL;
const API_BASE_URL = (configuredApiBaseUrl || FALLBACK_API_BASE_URL).replace(/\/+$/, "");

export interface UserLoginPayload {
    email: string;
    password: string;
}

export interface UserRegisterPayload {
    email: string;
    password: string;
    full_name?: string;
}

export interface RegisterApiResponse extends UserProfileResponse {
    message: string;
    requires_email_confirmation: boolean;
}

export interface LoginApiResponse {
    access_token: string;
    refresh_token?: string | null;
    token_type?: string;
    user: UserProfileResponse;
}

export interface UserProfileUpdatePayload {
    email?: string;
    full_name?: string;
    avatar_media_id?: string;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
}

export interface UserProfileResponse {
    id: string;
    email: string;
    status?: string;
    last_login_at?: string;
    created_at?: string;
    updated_at?: string;
    profile?: {
        id: string;
        user_id: string;
        full_name?: string;
        avatar_media_id?: string;
        created_at?: string;
        updated_at?: string;
    };
    user?: {
        id: string;
        email: string;
        status?: string;
        last_login_at?: string;
        created_at?: string;
        updated_at?: string;
    };
}

export function getAuthToken(): string | null {
    return localStorage.getItem("access_token");
}

export function setAuthToken(token: string): void {
    localStorage.setItem("access_token", token);
}

export function clearAuthToken(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
}

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

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) return error.message;
    if (typeof error === "string" && error.trim()) return error;
    return fallback;
}

function detailToMessage(detail: unknown): string | null {
    if (typeof detail === "string" && detail.trim()) return detail;

    if (Array.isArray(detail)) {
        const messages = detail
            .map((entry) => {
                if (typeof entry === "string") return entry;
                if (entry && typeof entry === "object") {
                    const item = entry as { msg?: unknown; message?: unknown; detail?: unknown };
                    return item.msg || item.message || item.detail;
                }
                return null;
            })
            .filter((message): message is string => typeof message === "string" && message.trim().length > 0);

        if (messages.length > 0) return messages.join("; ");
    }

    if (detail && typeof detail === "object") {
        const item = detail as { msg?: unknown; message?: unknown };
        const message = item.msg || item.message;
        if (typeof message === "string" && message.trim()) return message;
    }

    return null;
}

async function parseApiResponse<T>(response: Response, fallback: string): Promise<T> {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401) {
            clearAuthToken();
            try {
                localStorage.removeItem("user_info");
            } catch {
                // ignore
            }
        }
        let message = detailToMessage(data?.detail) || detailToMessage(data?.error) || fallback;
        if (typeof message === "string" && (message.toLowerCase().includes("token") || message.toLowerCase().includes("hết hạn"))) {
            message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
        }
        throw new Error(message);
    }
    return data as T;
}

async function request<T>(input: RequestInfo | URL, init: RequestInit, fallback: string): Promise<T> {
    let response: Response;
    try {
        response = await fetch(input, init);
    } catch {
        throw new Error("Không thể kết nối máy chủ API. Vui lòng kiểm tra backend và địa chỉ API.");
    }
    return parseApiResponse<T>(response, fallback);
}

/**
 * Đăng nhập người dùng qua API /users/login
 */
export async function loginUserApi(payload: UserLoginPayload): Promise<LoginApiResponse> {
    const data = await request<LoginApiResponse>(
        `${API_BASE_URL}/users/login`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: payload.email.trim(),
                password: payload.password,
            }),
        },
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.",
    );

    if (
        typeof data?.access_token !== "string"
        || !data.access_token.trim()
        || !data.user
        || typeof data.user !== "object"
        || typeof data.user.id !== "string"
        || typeof data.user.email !== "string"
    ) {
        throw new Error("Phản hồi đăng nhập từ máy chủ không hợp lệ. Vui lòng thử lại.");
    }

    setAuthToken(data.access_token);
    localStorage.setItem("user_info", JSON.stringify(data.user));
    return data;
}

/**
 * Đăng ký tài khoản mới qua API /users/register
 */
export async function registerUserApi(payload: UserRegisterPayload): Promise<RegisterApiResponse> {
    const bodyPayload: Record<string, any> = {
        email: payload.email.trim(),
        password: payload.password,
    };
    if (payload.full_name && payload.full_name.trim()) {
        bodyPayload.full_name = payload.full_name.trim();
    }

    const data = await request<RegisterApiResponse>(
        `${API_BASE_URL}/users/register`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bodyPayload),
        },
        "Đăng ký không thành công. Vui lòng thử lại.",
    );

    if (
        typeof data?.id !== "string"
        || !data.id.trim()
        || typeof data.email !== "string"
        || !data.email.trim()
        || typeof data.message !== "string"
        || !data.message.trim()
        || typeof data.requires_email_confirmation !== "boolean"
    ) {
        throw new Error("Phản hồi đăng ký từ máy chủ không hợp lệ. Vui lòng thử lại.");
    }

    return data;
}

/**
 * Lấy thông tin hồ sơ cá nhân từ API GET /users/me
 */
export async function getUserProfileApi(): Promise<UserProfileResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            let detail = data.detail || "Không thể tải thông tin hồ sơ cá nhân.";
            if (typeof detail === "string" && (detail.includes("WinError") || detail.includes("Failed to fetch") || detail.includes("NetworkError"))) {
                detail = "Kết nối máy chủ tạm thời bị gián đoạn. Vui lòng thử lại.";
            }
            throw new Error(detail);
        }

        return data;
    } catch (err: any) {
        console.warn("Lỗi getUserProfileApi:", err);
        let msg = err?.message || "Không thể tải thông tin hồ sơ cá nhân.";
        if (typeof msg === "string" && (msg.includes("WinError") || msg.includes("Failed to fetch") || msg.includes("NetworkError"))) {
            msg = "Kết nối máy chủ tạm thời bị gián đoạn. Vui lòng thử lại.";
        }
        throw new Error(msg);
    }
}

/**
 * Cập nhật thông tin hồ sơ từ API PUT /users/me
 */
export async function updateUserProfileApi(payload: UserProfileUpdatePayload): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            let detail = data.detail || "Không thể cập nhật hồ sơ cá nhân.";
            if (typeof detail === "string" && (detail.includes("WinError") || detail.includes("Failed to fetch") || detail.includes("NetworkError"))) {
                detail = "Kết nối máy chủ tạm thời bị gián đoạn. Vui lòng thử lại.";
            }
            throw new Error(detail);
        }

        return data;
    } catch (err: any) {
        console.warn("Lỗi updateUserProfileApi:", err);
        let msg = err?.message || "Không thể cập nhật hồ sơ cá nhân.";
        if (typeof msg === "string" && (msg.includes("WinError") || msg.includes("Failed to fetch") || msg.includes("NetworkError"))) {
            msg = "Kết nối máy chủ tạm thời bị gián đoạn. Vui lòng thử lại.";
        }
        throw new Error(msg);
    }
}

/**
 * Đổi mật khẩu qua API PUT /users/change-password
 */
export async function changePasswordApi(payload: ChangePasswordPayload): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            current_password: payload.current_password,
            new_password: payload.new_password,
        }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Không thể đổi mật khẩu.");
    }

    return data;
}
