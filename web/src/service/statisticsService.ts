import { getAuthToken } from "./userService";

const API_BASE_URL = "http://127.0.0.1:8000";

export interface StatisticsOverviewResponse {
    total_scans: number;
    total_landmarks: number;
    avg_accuracy: number;
    total_gallery: number;
    accuracy_level?: string;
}

export interface TopLandmarkItem {
    name: string;
    province?: string;
    category?: string;
    count: number;
    percentage: number;
}

export interface StatisticsTrendItem {
    date: string;
    count: number;
    avg_confidence?: number;
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
 * Lấy tổng quan số liệu thống kê từ API GET /statistics/overview
 */
export async function fetchStatisticsOverviewApi(): Promise<StatisticsOverviewResponse> {
    const response = await fetch(`${API_BASE_URL}/statistics/overview`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Không thể tải dữ liệu tổng quan thống kê.");
    }

    return data;
}

/**
 * Lấy danh sách Top địa danh được scan nhiều nhất từ API GET /statistics/top-landmarks
 */
export async function fetchTopLandmarksApi(limit: number = 5): Promise<{ items: TopLandmarkItem[] }> {
    const response = await fetch(`${API_BASE_URL}/statistics/top-landmarks?limit=${limit}`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Không thể tải danh sách Top địa danh.");
    }

    return data;
}

/**
 * Lấy dữ liệu xu hướng nhận diện theo thời gian từ API GET /statistics/trends
 */
export async function fetchStatisticsTrendsApi(days: number = 7): Promise<{ items: StatisticsTrendItem[] }> {
    const response = await fetch(`${API_BASE_URL}/statistics/trends?days=${days}`, {
        method: "GET",
        headers: getAuthHeaders(),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.detail || "Không thể tải dữ liệu xu hướng thống kê.");
    }

    return data;
}
