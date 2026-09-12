import { getAuthToken } from "./userService";

const FALLBACK_API_BASE_URL = "http://127.0.0.1:8000";
const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL;
export const API_BASE_URL = (configuredApiBaseUrl || FALLBACK_API_BASE_URL).replace(/\/+$/, "");

export interface MediaItem {
    id: string;
    gallery_id?: string;
    url?: string;
    file_url?: string;
    file_name: string;
    mime_type?: string;
    size?: number | string;
    file_size?: number;
    storage_path?: string;
    note?: string;
    place_id?: string;
    taken_at?: string;
    created_at?: string;
}

export interface MediaListResponse {
    items: MediaItem[];
    count: number;
}

function getAuthHeaders(isJson: boolean = true): HeadersInit {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (isJson) {
        headers["Content-Type"] = "application/json";
    }
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    if (typeof error === "string" && error.trim()) {
        return error;
    }

    return fallback;
}

function detailToMessage(detail: unknown): string | null {
    if (typeof detail === "string" && detail.trim()) {
        return detail;
    }

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

        if (messages.length > 0) {
            return messages.join("; ");
        }
    }

    if (detail && typeof detail === "object") {
        const item = detail as { msg?: unknown; message?: unknown };
        const message = item.msg || item.message;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
    }

    return null;
}

export async function parseApiResponse<T>(response: Response, fallback: string): Promise<T> {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = detailToMessage(data?.detail) || detailToMessage(data?.error) || fallback;
        throw new Error(message);
    }

    return data as T;
}

async function request<T>(
    input: RequestInfo | URL,
    init: RequestInit,
    fallback: string,
): Promise<T> {
    let response: Response;
    try {
        response = await fetch(input, init);
    } catch (error) {
        throw new Error(getApiErrorMessage(error, `${fallback} Vui lòng kiểm tra kết nối máy chủ.`));
    }

    return parseApiResponse<T>(response, fallback);
}

/**
 * Lấy danh sách ảnh trong kho cá nhân từ API GET /media/
 */
export async function fetchMediaListApi(): Promise<MediaListResponse> {
    return request<MediaListResponse>(
        `${API_BASE_URL}/media/`,
        {
            method: "GET",
            headers: getAuthHeaders(true),
        },
        "Không thể tải danh sách ảnh từ kho.",
    );
}

/**
 * Tải ảnh mới lên kho từ API POST /media/
 */
export async function uploadMediaApi(file: File, note?: string): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    if (note) {
        formData.append("note", note);
    }

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return request<any>(
        `${API_BASE_URL}/media/`,
        {
            method: "POST",
            headers: headers,
            body: formData,
        },
        "Không thể tải ảnh lên kho lưu trữ.",
    );
}

/**
 * Cập nhật ghi chú của ảnh qua API PUT /media/{media_id}
 */
export async function updateMediaNoteApi(mediaId: string, note: string): Promise<any> {
    const formData = new FormData();
    formData.append("note", note);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return request<any>(
        `${API_BASE_URL}/media/${encodeURIComponent(mediaId)}`,
        {
            method: "PUT",
            headers: headers,
            body: formData,
        },
        "Không thể cập nhật ghi chú ảnh.",
    );
}

/**
 * Xóa ảnh khỏi kho từ API DELETE /media/{media_id}
 */
export async function deleteMediaApi(mediaId: string): Promise<any> {
    return request<any>(
        `${API_BASE_URL}/media/${encodeURIComponent(mediaId)}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(true),
        },
        "Không thể xóa ảnh khỏi kho.",
    );
}

/**
 * Lấy URL tải xuống an toàn qua API GET /media/{media_id}/download
 */
export async function getMediaDownloadUrlApi(mediaId: string): Promise<{ download_url: string; file_name: string; expires_in: number }> {
    return request<{ download_url: string; file_name: string; expires_in: number }>(
        `${API_BASE_URL}/media/${encodeURIComponent(mediaId)}/download`,
        {
            method: "GET",
            headers: getAuthHeaders(true),
        },
        "Không thể lấy đường dẫn tải ảnh.",
    );
}
