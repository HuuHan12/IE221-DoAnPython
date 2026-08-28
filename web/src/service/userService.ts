const API_BASE_URL = "http://127.0.0.1:8000";

export interface UserLoginPayload {
    email: string;
    password: string;
}

export interface UserRegisterPayload {
    email: string;
    password: string;
    full_name?: string;
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

/**
 * Đăng nhập người dùng qua API /users/login
 */
export async function loginUserApi(payload: UserLoginPayload): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: payload.email.trim(),
            password: payload.password,
        }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.");
    }

    if (data.access_token) {
        setAuthToken(data.access_token);
        if (data.user) {
            localStorage.setItem("user_info", JSON.stringify(data.user));
        }
    }

    return data;
}

/**
 * Đăng ký tài khoản mới qua API /users/register
 */
export async function registerUserApi(payload: UserRegisterPayload): Promise<any> {
    const bodyPayload: Record<string, any> = {
        email: payload.email.trim(),
        password: payload.password,
    };
    if (payload.full_name && payload.full_name.trim()) {
        bodyPayload.full_name = payload.full_name.trim();
    }

    const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Đăng ký không thành công. Vui lòng thử lại.");
    }

    return data;
}

/**
 * Lấy thông tin hồ sơ cá nhân từ API GET /users/me
 */
export async function getUserProfileApi(): Promise<UserProfileResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: "GET",
            headers: getAuthHeaders(),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.detail || "Không thể tải thông tin hồ sơ cá nhân.");
        }

        return data;
    } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
    }
}

/**
 * Cập nhật thông tin hồ sơ từ API PUT /users/me
 */
export async function updateUserProfileApi(payload: UserProfileUpdatePayload): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.detail || "Không thể cập nhật hồ sơ cá nhân.");
        }

        return data;
    } catch (err: any) {
        clearTimeout(timeoutId);
        throw err;
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
