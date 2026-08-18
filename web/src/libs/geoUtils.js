/**
 * Calculate Haversine distance in kilometers between two GPS coordinates
 * Formula: d = 2R * arcsin(sqrt(sin^2(dLat/2) + cos(lat1)*cos(lat2)*sin^2(dLon/2)))
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
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

/**
 * Return accuracy level benchmark text and class based on distance in km
 */
export function getAccuracyBenchmark(distanceKm) {
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
 * Format coordinates nicely to 6 decimal places
 */
export function formatCoordinates(lat, lon) {
    const latNum = Number(lat || 0);
    const lonNum = Number(lon || 0);
    return `${latNum.toFixed(6)}° N, ${lonNum.toFixed(6)}° E`;
}
