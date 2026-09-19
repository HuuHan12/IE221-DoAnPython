const FALLBACK_API_BASE_URL = "http://127.0.0.1:8000";
const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL;
const API_BASE_URL = (configuredApiBaseUrl || FALLBACK_API_BASE_URL).replace(/\/+$/, "");

export interface FavoriteCoords {
    lat: number;
    lng: number;
}

export interface FavoriteLandmarkItem {
    id: string;
    place_id: string;
    name: string;
    shortName: string;
    province: string;
    country?: string;
    description?: string;
    address?: string;
    coords: FavoriteCoords;
    url: string;
    note?: string;
    created_at?: string;
}

export interface FavoritesResponse {
    items: FavoriteLandmarkItem[];
    total: number;
}

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Lấy danh sách địa điểm yêu thích của tài khoản đang đăng nhập
 */
export async function fetchFavoritesApi(): Promise<FavoritesResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: "GET",
            headers: getAuthHeaders(),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            let detail = data.detail || "Không thể tải danh sách địa điểm yêu thích.";
            if (typeof detail === "string" && (detail.includes("WinError") || detail.includes("socket") || detail.includes("non-blocking"))) {
                detail = "Kết nối máy chủ tạm thời bị gián đoạn. Vui lòng thử lại.";
            }
            throw new Error(detail);
        }

        return {
            items: data.items || [],
            total: data.total || 0,
        };
    } catch (err: any) {
        console.warn("Lỗi fetchFavoritesApi:", err);
        let msg = err.message || "Không thể tải danh sách địa điểm yêu thích.";
        if (typeof msg === "string" && (msg.includes("WinError") || msg.includes("socket") || msg.includes("non-blocking") || msg.includes("Failed to fetch"))) {
            msg = "Kết nối máy chủ tạm thời bị gián đoạn. Vui lòng thử lại.";
        }
        throw new Error(msg);
    }
}

/**
 * Thêm một địa danh vào danh sách yêu thích (hỗ trợ lưu kèm media_id của ảnh đã quét)
 */
export async function addFavoriteApi(placeId: string, mediaId?: string): Promise<FavoriteLandmarkItem> {
    try {
        const payload: { place_id: string; media_id?: string } = { place_id: placeId };
        if (mediaId) {
            payload.media_id = mediaId;
        }

        const response = await fetch(`${API_BASE_URL}/favorites`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.detail || "Không thể thêm địa danh vào yêu thích.");
        }

        return data as FavoriteLandmarkItem;
    } catch (err: any) {
        throw err;
    }
}

/**
 * Xóa một địa danh khỏi danh sách yêu thích
 */
export async function removeFavoriteApi(targetId: string): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/${encodeURIComponent(targetId)}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.detail || "Không thể xóa địa danh khỏi yêu thích.");
        }

        return data;
    } catch (err: any) {
        throw err;
    }
}

/**
 * Kiểm tra địa danh đã được yêu thích hay chưa
 */
export async function checkIsFavoriteApi(placeId: string): Promise<{ is_favorite: boolean; favorite_id: string | null }> {
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/check/${encodeURIComponent(placeId)}`, {
            method: "GET",
            headers: getAuthHeaders(),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            return { is_favorite: false, favorite_id: null };
        }
        return data;
    } catch {
        return { is_favorite: false, favorite_id: null };
    }
}

export interface PublicLandmarkItem {
    id: string;
    name: string;
    description: string;
    province: string;
    country: string;
    latitude: number;
    longitude: number;
    coords: string;
    address: string;
    heroImg: string;
}

/**
 * Lấy danh sách địa danh công khai từ database
 */
export async function fetchPublicPlacesApi(): Promise<PublicLandmarkItem[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/data/places`, {
            method: "GET",
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && Array.isArray(data.items)) {
            return data.items;
        }
        return [];
    } catch {
        return [];
    }
}

