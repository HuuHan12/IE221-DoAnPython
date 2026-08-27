import { getAuthToken } from "./userService";

const API_BASE_URL = "http://127.0.0.1:8000";

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

/**
 * Lấy danh sách ảnh trong kho cá nhân từ API GET /media/
 */
export async function fetchMediaListApi(): Promise<MediaListResponse> {
    const response = await fetch(`${API_BASE_URL}/media/`, {
        method: "GET",
        headers: getAuthHeaders(true),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Không thể tải danh sách ảnh từ kho.");
    }

    return data;
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

    const response = await fetch(`${API_BASE_URL}/media/`, {
        method: "POST",
        headers: headers,
        body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Không thể tải ảnh lên kho lưu trữ.");
    }

    return data;
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

    const response = await fetch(`${API_BASE_URL}/media/${encodeURIComponent(mediaId)}`, {
        method: "PUT",
        headers: headers,
        body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Không thể cập nhật ghi chú ảnh.");
    }

    return data;
}

/**
 * Xóa ảnh khỏi kho từ API DELETE /media/{media_id}
 */
export async function deleteMediaApi(mediaId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/media/${encodeURIComponent(mediaId)}`, {
        method: "DELETE",
        headers: getAuthHeaders(true),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Không thể xóa ảnh khỏi kho.");
    }

    return data;
}

/**
 * Lấy URL tải xuống an toàn qua API GET /media/{media_id}/download
 */
export async function getMediaDownloadUrlApi(mediaId: string): Promise<{ download_url: string; file_name: string; expires_in: number }> {
    const response = await fetch(`${API_BASE_URL}/media/${encodeURIComponent(mediaId)}/download`, {
        method: "GET",
        headers: getAuthHeaders(true),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Không thể lấy đường dẫn tải ảnh.");
    }

    return data;
}
