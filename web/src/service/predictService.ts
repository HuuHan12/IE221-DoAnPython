const API_BASE_URL = "http://127.0.0.1:8000";

export interface GroundTruthCoords {
    lat: number | string;
    lon: number | string;
}

export interface PredictionItem {
    rank?: number;
    name?: string;
    province?: string;
    category?: string;
    description?: string;
    lat: number;
    lon: number;
    prob_percent?: number;
    gmaps_url?: string;
}

export interface GisErrorData {
    ground_truth?: { lat: number; lon: number };
    distance_km?: number;
    distance_meters?: number;
    haversine_km?: number;
    formatted_distance?: string;
    bearing_degrees?: number;
    bearing_compass?: string;
    accuracy_label?: string;
    accuracy_short_label?: string;
    accuracy_icon?: string;
    accuracy_level?: string;
}

export interface PredictResponse {
    status?: string;
    landmark?: string;
    prediction?: PredictionItem;
    predictions?: PredictionItem[];
    gis_error?: GisErrorData;
    time_ms?: number;
    [key: string]: any;
}

/**
 * Send image file to FastAPI backend /predict endpoint
 */
export async function predictLandmarkApi(
    file: File | Blob | any,
    topK: number = 5,
    scope: string = "iconic",
    groundTruth: GroundTruthCoords | null = null,
    guestToken?: string
): Promise<PredictResponse> {
    if (!file) {
        throw new Error("Vui lòng chọn một file ảnh hợp lệ.");
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("top_k", String(topK || 5));
    formData.append("scope", scope || "iconic");

    if (groundTruth && groundTruth.lat && groundTruth.lon) {
        formData.append("ground_truth_lat", String(groundTruth.lat));
        formData.append("ground_truth_lon", String(groundTruth.lon));
    }

    const token = localStorage.getItem("access_token");
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    } else if (guestToken) {
        headers["X-Guest-Token"] = guestToken;
    }

    const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: headers,
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem("access_token");
            try {
                localStorage.removeItem("user_info");
            } catch {
                // ignore
            }
            throw new Error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.");
        }
        let detail = data?.detail;
        if (typeof detail === "string" && (detail.toLowerCase().includes("token") || detail.toLowerCase().includes("hết hạn"))) {
            detail = "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
        }
        throw new Error(detail || "Không thể nhận diện hình ảnh từ máy chủ AI.");
    }

    if (!data.predictions || data.predictions.length === 0) {
        throw new Error("Mô hình AI không tìm thấy tọa độ phù hợp.");
    }

    return data;
}

/**
 * Call Python backend when user clicks 'Chọn vị trí này' on Top-K to recompute metrics
 */
export async function selectLocationApi(
    selectedItem: PredictionItem,
    groundTruth: GroundTruthCoords | null = null
): Promise<{ prediction: PredictionItem; gis_error: GisErrorData | null }> {
    const response = await fetch(`${API_BASE_URL}/gis/select-location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            selected_item: selectedItem,
            ground_truth: groundTruth,
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Không thể xử lý chọn địa điểm từ máy chủ.");
    }

    return await response.json();
}

export interface GisErrorCalculationPayload {
    ground_truth_lat: number;
    ground_truth_lon: number;
    predicted_lat: number;
    predicted_lon: number;
    predictions?: PredictionItem[];
}

/**
 * Gọi phần phụ trợ Python để tính toán đầy đủ Lỗi trắc địa & điểm chuẩn
 */
export async function calculateGisErrorApi(payload: GisErrorCalculationPayload): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/gis/calculate-error`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Không thể đo đạc sai số GIS từ máy chủ.");
    }

    return await response.json();
}

/**
 * Gọi chương trình phụ trợ Python để tính khoảng cách trắc địa
 */
export async function calculateGisDistanceApi(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): Promise<{ distance_km: number; distance_meters: number }> {
    const response = await fetch(`${API_BASE_URL}/gis/distance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat1, lon1, lat2, lon2 }),
    });

    if (!response.ok) {
        throw new Error("Không thể tính toán khoảng cách GIS từ máy chủ.");
    }

    return await response.json();
}

/**
 * Tìm nạp tổng quan về trình khám phá tập dữ liệu và số liệu thống kê phân phối
 */
export async function fetchDataExplorerApi(scope: string = "iconic"): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/data/explorer?scope=${encodeURIComponent(scope)}`);
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Không thể tải dữ liệu thống kê từ máy chủ.");
    }
    return await response.json();
}

/**
 * Tìm nạp các bản ghi được phân trang và lọc được tính toán
 */
export async function fetchDataRecordsApi(
    scope: string = "iconic",
    page: number = 1,
    pageSize: number = 10,
    search: string = ""
): Promise<any> {
    let url = `${API_BASE_URL}/data/records?scope=${encodeURIComponent(scope)}&page=${page}&page_size=${pageSize}`;
    if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Không thể tải danh sách dữ liệu từ máy chủ.");
    }
    return await response.json();
}
