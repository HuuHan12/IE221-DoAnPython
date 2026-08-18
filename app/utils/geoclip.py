import os
from functools import lru_cache
from typing import List, Dict, Any, Optional, Tuple

try:
    from geoclip_vietnam import GeoCLIPService
    from geoclip_vietnam.gis.distance_metrics import (
        calculate_geodesic_distance,
        haversine_distance,
        compute_distance_accuracy_metrics,
    )
except ImportError:
    from src import GeoCLIPService
    from src.gis.distance_metrics import (
        calculate_geodesic_distance,
        haversine_distance,
        compute_distance_accuracy_metrics,
    )

SCOPE_MAPPING = {
    "iconic": "vietnam_iconic",
    "vietnam_iconic": "vietnam_iconic",
    "expanded": "vietnam_all",
    "vietnam_all": "vietnam_all",
    "vietnam": "vietnam_all",
    "global": "global",
    "coordinates_100k": "global",
    "100k": "global",
}


@lru_cache(maxsize=6)
def get_geoclip_service(scope: str = "expanded") -> GeoCLIPService:
    """
    Khởi tạo và cache GeoCLIPService trong RAM cho 3 phạm vi dữ liệu:
    - iconic: vietnam_landmarks_iconic.csv (68 địa danh biểu tượng)
    - expanded: vietnam_landmarks.csv (26,353 điểm POI toàn quốc)
    - global: coordinates_100K.csv (100,000 tọa độ toàn cầu)
    """
    mapped_scope = SCOPE_MAPPING.get(scope.lower(), "vietnam_all")
    print(f"[GeoCLIP] Initializing service for scope='{mapped_scope}'...")

    current_dir = os.path.dirname(os.path.abspath(__file__))
    app_data_dir = os.path.abspath(os.path.join(current_dir, "..", "data"))

    if os.path.exists(app_data_dir):
        try:
            service = GeoCLIPService(scope=mapped_scope, data_dir=app_data_dir)
        except TypeError:
            service = GeoCLIPService(scope=mapped_scope)
    else:
        service = GeoCLIPService(scope=mapped_scope)

    print(f"[GeoCLIP] Service ready for scope='{mapped_scope}'!")
    return service


def predict_image(image_path: str, top_k: int = 5, scope: str = "iconic") -> List[Dict[str, Any]]:
    """
    Dự đoán địa danh và tọa độ GPS thực tế từ đường dẫn ảnh bằng mô hình AI GeoCLIP.
    """
    service = get_geoclip_service(scope=scope)

    return service.predict(
        image_path,
        top_k=top_k
    )


def compute_gis_error(
    ground_truth_coords: Tuple[float, float],
    predicted_coords: Tuple[float, float]
) -> Dict[str, Any]:
    """
    Tính toán sai số khoảng cách Geodesic (km) và phân loại Acc@K trực tiếp từ thư viện src.gis bằng Python.
    """
    gt_lat, gt_lon = ground_truth_coords
    pred_lat, pred_lon = predicted_coords

    # Gọi trực tiếp hàm calculate_geodesic_distance từ thư viện
    distance_km = calculate_geodesic_distance((gt_lat, gt_lon), (pred_lat, pred_lon))

    # Đánh giá phân cấp chính xác theo chuẩn GeoCLIP
    if distance_km <= 1.0:
        acc_label = "Đạt chuẩn Acc@1km (Cực kỳ chính xác)"
        acc_level = "dist-excellent"
    elif distance_km <= 5.0:
        acc_label = "Đạt chuẩn Acc@5km (Khu vực nội thành)"
        acc_level = "dist-good"
    elif distance_km <= 25.0:
        acc_label = "Đạt chuẩn Acc@25km (Cấp quận / huyện)"
        acc_level = "dist-good"
    elif distance_km <= 100.0:
        acc_label = "Đạt chuẩn Acc@100km (Cấp tỉnh / vùng)"
        acc_level = "dist-far"
    else:
        acc_label = "Ngoài bán kính 100km"
        acc_level = "dist-far"

    formatted_dist = f"{distance_km:.2f} km" if distance_km >= 1.0 else f"{int(round(distance_km * 1000))} mét"

    return {
        "distance_km": round(distance_km, 3),
        "distance_meters": round(distance_km * 1000, 1),
        "formatted_distance": formatted_dist,
        "accuracy_label": acc_label,
        "accuracy_level": acc_level,
    }