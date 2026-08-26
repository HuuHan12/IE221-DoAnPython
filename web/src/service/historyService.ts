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

    const response = await fetch(`${API_BASE_URL}/history?${params.toString()}`);
    return parseResponse<HistoryListResponse>(response);
}

export async function fetchHistoryDetail(id: string): Promise<HistoryItem> {
    const response = await fetch(
        `${API_BASE_URL}/history/${encodeURIComponent(id)}`,
    );
    return parseResponse<HistoryItem>(response);
}

export async function deleteHistory(
    id: string,
): Promise<{ deleted: boolean; history_id: string }> {
    const response = await fetch(
        `${API_BASE_URL}/history/${encodeURIComponent(id)}`,
        { method: "DELETE" },
    );
    return parseResponse(response);
}
