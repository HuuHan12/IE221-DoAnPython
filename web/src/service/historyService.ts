const API_BASE_URL = "http://127.0.0.1:8000";

export interface HistoryItem {
    id: string;
    input_media_id?: string | null;
    place_id?: string | null;
    confidence_value?: number | null;
    search_type?: string | null;
    searched_at: string;
    name: string;
    location: string;
    confidence?: number | null;
    date: string;
    time: string;
    url?: string | null;
    description?: string | null;
    input_media?: Record<string, unknown> | null;
    place?: Record<string, unknown> | null;
    predicted_name?: string | null;
    predicted_province?: string | null;
    predicted_lat?: number | null;
    predicted_lon?: number | null;
    all_predictions?: Array<Record<string, any>> | null;
}

export interface HistoryListResponse {
    items: HistoryItem[];
    page: number;
    page_size: number;
    total_records: number;
    total_pages: number;
}

export interface HistoryFilters {
    page?: number;
    pageSize?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
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

async function parseResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => ({})) as T & {
        detail?: string;
    };
    if (!response.ok) {
        throw new Error(data.detail || "Không thể xử lý lịch sử tìm kiếm.");
    }
    return data as T;
}

export async function fetchHistory(
    filters: HistoryFilters = {},
): Promise<HistoryListResponse> {
    const params = new URLSearchParams({
        page: String(filters.page || 1),
        page_size: String(filters.pageSize || 10),
    });

    if (filters.search?.trim()) {
        params.set("search", filters.search.trim());
    }
    if (filters.startDate) {
        params.set("start_date", filters.startDate);
    }
    if (filters.endDate) {
        params.set("end_date", filters.endDate);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/history?${params.toString()}`, {
            headers: getAuthHeaders(),
        });
        return await parseResponse<HistoryListResponse>(response);
    } catch (err: any) {
        console.warn("Lỗi fetchHistory:", err);
        let msg = err?.message || "Không thể tải lịch sử tìm kiếm.";
        if (typeof msg === "string" && (msg.includes("WinError") || msg.includes("Failed to fetch") || msg.includes("NetworkError"))) {
            msg = "Kết nối máy chủ tạm thời bị gián đoạn. Vui lòng thử lại.";
        }
        throw new Error(msg);
    }
}

export async function fetchHistoryDetail(id: string): Promise<HistoryItem> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/history/${encodeURIComponent(id)}`,
            {
                headers: getAuthHeaders(),
            }
        );
        return await parseResponse<HistoryItem>(response);
    } catch (err: any) {
        console.warn("Lỗi fetchHistoryDetail:", err);
        let msg = err?.message || "Không thể tải chi tiết lịch sử.";
        if (typeof msg === "string" && (msg.includes("WinError") || msg.includes("Failed to fetch") || msg.includes("NetworkError"))) {
            msg = "Kết nối máy chủ tạm thời bị gián đoạn. Vui lòng thử lại.";
        }
        throw new Error(msg);
    }
}

export async function deleteHistory(
    id: string,
): Promise<{ deleted: boolean; history_id: string }> {
    const response = await fetch(
        `${API_BASE_URL}/history/${encodeURIComponent(id)}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        },
    );
    return parseResponse(response);
}

export interface SelectPredictionPayload {
    name: string;
    province?: string;
    lat?: number;
    lon?: number;
    prob_percent?: number;
    confidence?: number;
}

export async function selectHistoryPrediction(
    historyId: string,
    payload: SelectPredictionPayload,
): Promise<any> {
    const response = await fetch(
        `${API_BASE_URL}/history/${encodeURIComponent(historyId)}/select-prediction`,
        {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        },
    );
    return parseResponse(response);
}

