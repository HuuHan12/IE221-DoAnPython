import { getAuthToken } from "./userService";

const API_BASE_URL = "http://127.0.0.1:8000";

// ==========================================
// 1. DATA SCHEMAS & INTERFACES
// ==========================================

export interface KPICardItem {
    value: number;
    growth_percentage: number;
    is_increase: boolean;
}

export interface StatisticsOverviewData {
    total_scans: KPICardItem;
    active_users: KPICardItem;
    total_searches: KPICardItem;
    favorite_places: KPICardItem;
}

export interface StatisticsOverviewResponse {
    status: string;
    data: StatisticsOverviewData;
}

export interface SearchTrendItem {
    period: string;
    total: number;
}

export interface SearchTrendsResponse {
    status: string;
    group_by: "day" | "week" | "month";
    data: SearchTrendItem[];
}

export interface TopPlaceItem {
    place_id: string;
    name: string;
    province?: string | null;
    search_count: number;
}

export interface TopPlacesResponse {
    status: string;
    total_places: number;
    data: TopPlaceItem[];
}

export interface CategoryDistributionItem {
    category_id?: string | null;
    name: string;
    count: number;
    percentage: number;
}

export interface CategoryDistributionResponse {
    status: string;
    total_searches: number;
    data: CategoryDistributionItem[];
}

export interface DateRangeParams {
    from_date?: string;
    to_date?: string;
}

export interface SearchTrendsParams extends DateRangeParams {
    group_by?: "day" | "week" | "month";
}

export interface TopPlacesParams extends DateRangeParams {
    limit?: number;
}

export interface ExportStatisticsParams extends DateRangeParams {
    format?: "xlsx" | "csv";
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

function buildQueryString(params: Record<string, string | number | undefined | null>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    }
    const qs = searchParams.toString();
    return qs ? `?${qs}` : "";
}

// ==========================================
// 3. CORE STATISTICS API CLIENTS
// ==========================================

/**
 * 1. Lấy 4 số liệu KPI tổng quan
 * GET /admin/statistics/overview?from_date=...&to_date=...
 */
export async function fetchStatisticsOverviewApi(
    params: DateRangeParams = {}
): Promise<StatisticsOverviewResponse> {
    const query = buildQueryString({
        from_date: params.from_date,
        to_date: params.to_date,
    });

    const response = await fetch(`${API_BASE_URL}/admin/statistics/overview${query}`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể tải dữ liệu tổng quan thống kê.");
    }

    return result;
}

/**
 * 2. Lấy biểu đồ tìm kiếm theo thời gian
 * GET /admin/statistics/search-trends?from_date=...&to_date=...&group_by=...
 */
export async function fetchSearchTrendsApi(
    params: SearchTrendsParams = {}
): Promise<SearchTrendsResponse> {
    const query = buildQueryString({
        from_date: params.from_date,
        to_date: params.to_date,
        group_by: params.group_by || "day",
    });

    const response = await fetch(`${API_BASE_URL}/admin/statistics/search-trends${query}`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể tải biểu đồ xu hướng tìm kiếm.");
    }

    return result;
}

/**
 * 3. Lấy Top các địa điểm được tìm kiếm nhiều nhất
 * GET /admin/statistics/top-places?from_date=...&to_date=...&limit=...
 */
export async function fetchTopPlacesApi(
    params: TopPlacesParams = {}
): Promise<TopPlacesResponse> {
    const query = buildQueryString({
        from_date: params.from_date,
        to_date: params.to_date,
        limit: params.limit ?? 10,
    });

    const response = await fetch(`${API_BASE_URL}/admin/statistics/top-places${query}`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể tải danh sách Top địa danh.");
    }

    return result;
}

/**
 * 4. Lấy cơ cấu lượt tìm kiếm theo danh mục
 * GET /admin/statistics/category-distribution?from_date=...&to_date=...
 */
export async function fetchCategoryDistributionApi(
    params: DateRangeParams = {}
): Promise<CategoryDistributionResponse> {
    const query = buildQueryString({
        from_date: params.from_date,
        to_date: params.to_date,
    });

    const response = await fetch(`${API_BASE_URL}/admin/statistics/category-distribution${query}`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(result.detail || "Không thể tải cơ cấu danh mục tìm kiếm.");
    }

    return result;
}

/**
 * 5. Xuất báo cáo thống kê định dạng Excel (.xlsx) hoặc CSV (.csv)
 * GET /admin/statistics/export?from_date=...&to_date=...&format=...
 * Tự động tạo thẻ download để lưu file về máy người dùng.
 */
export async function exportStatisticsReportApi(
    params: ExportStatisticsParams = {}
): Promise<{ filename: string; blob: Blob }> {
    const query = buildQueryString({
        from_date: params.from_date,
        to_date: params.to_date,
        format: params.format || "xlsx",
    });

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/admin/statistics/export${query}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.detail || "Không thể xuất file báo cáo thống kê.");
    }

    const blob = await response.blob();

    // Lấy tên file từ header Content-Disposition nếu có
    let filename = `Bao_Cao_Thong_Ke_${params.from_date || "all"}_${params.to_date || "now"}.${params.format || "xlsx"}`;
    const disposition = response.headers.get("Content-Disposition");
    if (disposition && disposition.includes("filename=")) {
        const matches = disposition.match(/filename="?([^"]+)"?/);
        if (matches && matches[1]) {
            filename = matches[1];
        }
    }

    // Tự động kích hoạt hành động tải file trên trình duyệt
    try {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    } catch {
        // Trình duyệt không hỗ trợ trực tiếp
    }

    return { filename, blob };
}

// ==========================================
// 4. BACKWARD COMPATIBILITY ALIASES
// ==========================================

export async function fetchTopLandmarksApi(limit: number = 10) {
    const res = await fetchTopPlacesApi({ limit });
    return {
        items: res.data.map((item) => ({
            name: item.name,
            province: item.province,
            count: item.search_count,
            place_id: item.place_id,
        })),
    };
}

export async function fetchStatisticsTrendsApi(days: number = 7) {
    const res = await fetchSearchTrendsApi({ group_by: "day" });
    return {
        items: res.data.map((item) => ({
            date: item.period,
            count: item.total,
        })),
    };
}
