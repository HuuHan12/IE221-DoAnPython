
export function calculateHaversineDistance(
    lat1: number | string,
    lon1: number | string,
    lat2: number | string,
    lon2: number | string
): number | null {
    const R = 6371.0; // Earth mean radius in km
    const lat1Num = Number(lat1);
    const lon1Num = Number(lon1);
    const lat2Num = Number(lat2);
    const lon2Num = Number(lon2);

    if (isNaN(lat1Num) || isNaN(lon1Num) || isNaN(lat2Num) || isNaN(lon2Num)) {
        return null;
    }

    const dLat = ((lat2Num - lat1Num) * Math.PI) / 180;
    const dLon = ((lon2Num - lon1Num) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1Num * Math.PI) / 180) *
        Math.cos((lat2Num * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export interface AccuracyBenchmarkResult {
    label: string;
    className: string;
}

/**
 *Trả về văn bản và lớp điểm chuẩn mức độ chính xác dựa trên khoảng cách tính bằng km
 */
export function getAccuracyBenchmark(distanceKm: number | null | undefined): AccuracyBenchmarkResult | null {
    if (distanceKm === null || distanceKm === undefined) return null;
    if (distanceKm <= 1.0) {
        return { label: "Đạt chuẩn Acc@1km (Cực kỳ chính xác)", className: "dist-excellent" };
    }
    if (distanceKm <= 5.0) {
        return { label: "Đạt chuẩn Acc@5km (Nội thành)", className: "dist-good" };
    }
    if (distanceKm <= 25.0) {
        return { label: "Đạt chuẩn Acc@25km (Quận/Huyện)", className: "dist-good" };
    }
    if (distanceKm <= 100.0) {
        return { label: "Đạt chuẩn Acc@100km (Cấp Tỉnh/Vùng)", className: "dist-far" };
    }
    return { label: "Ngoài bán kính 100km", className: "dist-far" };
}

/**
 * Định dạng tọa độ độc đáo đến 6 chữ số thập phân
 */
export function formatCoordinates(lat: number | string, lon: number | string): string {
    const latNum = Number(lat || 0);
    const lonNum = Number(lon || 0);
    return `${latNum.toFixed(6)}° N, ${lonNum.toFixed(6)}° E`;
}
