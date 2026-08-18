const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Send image file to FastAPI backend /predict endpoint
 * @param {File} file - Image file object
 * @param {number} topK - Number of predictions (1 - 10)
 * @param {string} scope - Dataset scope ('iconic' or 'expanded')
 * @param {Object} groundTruth - Optional ground truth coordinates {lat, lon}
 * @returns {Promise<Object>} API JSON response from GeoCLIP AI model with GIS distance errors
 */
export async function predictLandmarkApi(file, topK = 5, scope = "iconic", groundTruth = null) {
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

    const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Không thể nhận diện hình ảnh từ máy chủ AI.");
    }

    if (!data.predictions || data.predictions.length === 0) {
        throw new Error("Mô hình AI không tìm thấy tọa độ phù hợp.");
    }

    return data;
}

/**
 * Call Python backend when user clicks 'Chọn vị trí này' on Top-K to recompute metrics
 */
export async function selectLocationApi(selectedItem, groundTruth = null) {
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

/**
 * Call Python backend to calculate full Task 2.3 GIS Geodesic Error & Benchmarks
 */
export async function calculateGisErrorApi(payload) {
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
 * Call Python backend to calculate Geodesic distance using src.gis.distance_metrics
 */
export async function calculateGisDistanceApi(lat1, lon1, lat2, lon2) {
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
 * Fetch dataset explorer overview & distribution statistics calculated by Python backend
 */
export async function fetchDataExplorerApi(scope = "expanded") {
    const response = await fetch(`${API_BASE_URL}/data/explorer?scope=${encodeURIComponent(scope)}`);
    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Không thể tải dữ liệu thống kê từ máy chủ.");
    }
    return await response.json();
}

/**
 * Fetch paginated & filtered records calculated by Python backend
 */
export async function fetchDataRecordsApi(scope = "expanded", page = 1, pageSize = 10, search = "") {
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
