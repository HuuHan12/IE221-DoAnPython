import math
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

try:
    from src.gis.distance_metrics import calculate_geodesic_distance, calculate_haversine_distance
except ImportError:
    try:
        from geopy.distance import geodesic
        def calculate_geodesic_distance(c1, c2):
            return geodesic(c1, c2).kilometers
    except ImportError:
        def calculate_geodesic_distance(c1, c2):
            lat1, lon1 = math.radians(c1[0]), math.radians(c1[1])
            lat2, lon2 = math.radians(c2[0]), math.radians(c2[1])
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return 6371.0 * c

    def calculate_haversine_distance(c1, c2):
        lat1, lon1 = math.radians(c1[0]), math.radians(c1[1])
        lat2, lon2 = math.radians(c2[0]), math.radians(c2[1])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return 6371.0 * c


router = APIRouter(prefix="/gis", tags=["GIS Measurements"])


class GisDistanceRequest(BaseModel):
    lat1: float = Field(..., ge=-90.0, le=90.0)
    lon1: float = Field(..., ge=-180.0, le=180.0)
    lat2: float = Field(..., ge=-90.0, le=90.0)
    lon2: float = Field(..., ge=-180.0, le=180.0)


class GisErrorCalculationRequest(BaseModel):
    ground_truth_lat: float = Field(..., ge=-90.0, le=90.0)
    ground_truth_lon: float = Field(..., ge=-180.0, le=180.0)
    predicted_lat: float = Field(..., ge=-90.0, le=90.0)
    predicted_lon: float = Field(..., ge=-180.0, le=180.0)
    predictions: Optional[List[Dict[str, Any]]] = None


class SelectLocationRequest(BaseModel):
    selected_item: Dict[str, Any]
    ground_truth: Optional[Dict[str, Any]] = None


def compute_bearing_angle(lat1: float, lon1: float, lat2: float, lon2: float) -> tuple[float, str]:
    """
    Tính góc phương vị (Bearing) và hướng la bàn từ điểm 1 đến điểm 2 bằng công thức trắc địa.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)

    theta = math.atan2(y, x)
    bearing_deg = (math.degrees(theta) + 360) % 360

    # Chuyển đổi sang 8 hướng la bàn
    compass_sectors = [
        (22.5, "Bắc (N)"),
        (67.5, "Đông Bắc (NE)"),
        (112.5, "Đông (E)"),
        (157.5, "Đông Nam (SE)"),
        (202.5, "Nam (S)"),
        (247.5, "Tây Nam (SW)"),
        (292.5, "Tây (W)"),
        (337.5, "Tây Bắc (NW)"),
        (360.0, "Bắc (N)"),
    ]

    compass_str = "Bắc (N)"
    for limit, name in compass_sectors:
        if bearing_deg <= limit:
            compass_str = name
            break

    return round(bearing_deg, 1), compass_str


def classify_accuracy_benchmark(dist_km: float) -> Dict[str, Any]:
    """
    Phân loại sai số không gian theo các mốc chuẩn của bài báo GeoCLIP (ICCV 2023).
    """
    if dist_km <= 1.0:
        return {
            "level": "excellent",
            "tag": "Acc@1km",
            "label": "Đạt chuẩn Acc@1km (Cực kỳ chính xác / Điểm mốc cụ thể)",
            "short_label": "Cực kỳ chính xác (Acc@1km)",
            "icon": "🟢",
            "badge_class": "badge-excellent",
        }
    elif dist_km <= 5.0:
        return {
            "level": "good",
            "tag": "Acc@5km",
            "label": "Đạt chuẩn Acc@5km (Khu vực nội thành / Cấp phường xã)",
            "short_label": "Khu vực nội thành (Acc@5km)",
            "icon": "🟢",
            "badge_class": "badge-good",
        }
    elif dist_km <= 25.0:
        return {
            "level": "city",
            "tag": "Acc@25km",
            "label": "Cấp Thành phố (City-Level / Acc@25km)",
            "short_label": "Cấp Thành phố (City-Level / Acc@25km)",
            "icon": "🟢",
            "badge_class": "badge-city",
        }
    elif dist_km <= 100.0:
        return {
            "level": "province",
            "tag": "Acc@100km",
            "label": "Cấp Tỉnh / Vùng (Province-Level / Acc@100km)",
            "short_label": "Cấp Tỉnh / Vùng (Acc@100km)",
            "icon": "🟡",
            "badge_class": "badge-province",
        }
    else:
        return {
            "level": "country",
            "tag": "Acc@Country",
            "label": "Ngoài bán kính 100km (Cấp Quốc gia / Vùng lãnh thổ)",
            "short_label": "Ngoài bán kính 100km",
            "icon": "🔴",
            "badge_class": "badge-far",
        }


@router.post("/calculate-error")
def calculate_gis_error(req: GisErrorCalculationRequest) -> Dict[str, Any]:
    """
    API tính toán toàn diện sai số GIS (Task 2.3) bằng thuật toán trắc địa Python.
    """
    gt_coord = (req.ground_truth_lat, req.ground_truth_lon)
    pred_coord = (req.predicted_lat, req.predicted_lon)

    # 1. Tính khoảng cách Geodesic (WGS-84) & Haversine
    geodesic_km = calculate_geodesic_distance(gt_coord, pred_coord)
    haversine_km = calculate_haversine_distance(gt_coord, pred_coord)
    geodesic_meters = geodesic_km * 1000.0

    # 2. Tính góc phương vị
    bearing_deg, bearing_compass = compute_bearing_angle(
        req.ground_truth_lat, req.ground_truth_lon,
        req.predicted_lat, req.predicted_lon
    )

    # 3. Phân cấp đánh giá chuẩn xác
    benchmark = classify_accuracy_benchmark(geodesic_km)

    # 4. Định dạng chuỗi hiển thị
    if geodesic_km < 1.0:
        formatted_distance = f"{int(round(geodesic_meters))} mét"
    else:
        formatted_distance = f"{geodesic_km:.2f} km"

    # 5. Đánh giá khoảng cách cho từng vị trí trong Top-K (nếu có)
    top_k_distances = []
    if req.predictions and isinstance(req.predictions, list):
        for idx, item in enumerate(req.predictions):
            try:
                i_lat = float(item.get("lat", 0.0))
                i_lon = float(item.get("lon", 0.0))
                i_dist_km = calculate_geodesic_distance(gt_coord, (i_lat, i_lon))
                i_bench = classify_accuracy_benchmark(i_dist_km)

                top_k_distances.append({
                    "rank": item.get("rank", idx + 1),
                    "name": item.get("name", "Địa danh"),
                    "province": item.get("province", "Việt Nam"),
                    "category": item.get("category", ""),
                    "lat": i_lat,
                    "lon": i_lon,
                    "prob_percent": float(item.get("prob_percent", 0.0)),
                    "distance_km": round(i_dist_km, 3),
                    "formatted_distance": f"{i_dist_km:.2f} km" if i_dist_km >= 1.0 else f"{int(round(i_dist_km * 1000))} m",
                    "accuracy_tag": i_bench["tag"],
                    "accuracy_icon": i_bench["icon"],
                })
            except Exception:
                continue

    return {
        "is_valid": True,
        "ground_truth": {
            "lat": req.ground_truth_lat,
            "lon": req.ground_truth_lon,
            "formatted": f"({req.ground_truth_lat:.6f}, {req.ground_truth_lon:.6f})",
        },
        "prediction": {
            "lat": req.predicted_lat,
            "lon": req.predicted_lon,
            "formatted": f"({req.predicted_lat:.6f}, {req.predicted_lon:.6f})",
        },
        "distance_km": round(geodesic_km, 3),
        "distance_meters": round(geodesic_meters, 1),
        "haversine_km": round(haversine_km, 3),
        "formatted_distance": formatted_distance,
        "bearing_degrees": bearing_deg,
        "bearing_compass": bearing_compass,
        "accuracy_benchmark": benchmark,
        "accuracy_label": benchmark["label"],
        "accuracy_short_label": benchmark["short_label"],
        "accuracy_icon": benchmark["icon"],
        "accuracy_level": benchmark["level"],
        "top_k_distances": top_k_distances,
    }


@router.post("/distance")
def calculate_simple_distance(req: GisDistanceRequest) -> Dict[str, Any]:
    c1 = (req.lat1, req.lon1)
    c2 = (req.lat2, req.lon2)
    dist_km = calculate_geodesic_distance(c1, c2)
    return {
        "distance_km": round(dist_km, 3),
        "distance_meters": round(dist_km * 1000, 1),
    }


@router.post("/select-location")
def select_location(req: SelectLocationRequest) -> Dict[str, Any]:
    """
    API xử lý 100% nghiệp vụ khi người dùng click chọn một vị trí trong Top-K dự đoán:
    Đo đạc lại sai số Geodesic WGS-84, Haversine, góc phương vị Bearing và phân loại Acc@K.
    """
    item = req.selected_item
    gt = req.ground_truth

    pred_lat = float(item.get("lat", 0.0))
    pred_lon = float(item.get("lon", 0.0))
    prob_percent = float(item.get("prob_percent", 0.0))
    name = str(item.get("name", "Địa danh không xác định"))
    province = str(item.get("province", "Việt Nam"))
    category = str(item.get("category", "Địa điểm tham quan"))
    description = str(item.get("description", ""))
    rank = item.get("rank", 1)

    gis_error = None
    if gt and gt.get("lat") is not None and gt.get("lon") is not None and str(gt.get("lat")).strip() != "" and str(gt.get("lon")).strip() != "":
        try:
            gt_lat = float(gt["lat"])
            gt_lon = float(gt["lon"])

            # 1. Tính khoảng cách Geodesic trên WGS-84 & Haversine
            geodesic_km = calculate_geodesic_distance((gt_lat, gt_lon), (pred_lat, pred_lon))
            haversine_km = calculate_haversine_distance((gt_lat, gt_lon), (pred_lat, pred_lon))
            bearing_deg, bearing_compass = compute_bearing_angle(gt_lat, gt_lon, pred_lat, pred_lon)
            bench = classify_accuracy_benchmark(geodesic_km)

            formatted_dist = f"{geodesic_km:.2f} km" if geodesic_km >= 1.0 else f"{int(round(geodesic_km * 1000))} mét"

            gis_error = {
                "ground_truth": {"lat": gt_lat, "lon": gt_lon},
                "distance_km": round(geodesic_km, 3),
                "distance_meters": round(geodesic_km * 1000.0, 1),
                "haversine_km": round(haversine_km, 3),
                "formatted_distance": formatted_dist,
                "bearing_degrees": bearing_deg,
                "bearing_compass": bearing_compass,
                "accuracy_label": bench["label"],
                "accuracy_short_label": bench["short_label"],
                "accuracy_icon": bench["icon"],
                "accuracy_level": bench["badge_class"],
            }
        except Exception as e:
            print(f"[Select Location Error] {e}")

    gmaps_url = item.get("gmaps_url") or f"https://www.google.com/maps?q={pred_lat:.6f},{pred_lon:.6f}"

    return {
        "prediction": {
            "rank": rank,
            "name": name,
            "province": province,
            "category": category,
            "description": description,
            "lat": pred_lat,
            "lon": pred_lon,
            "prob_percent": prob_percent,
            "gmaps_url": gmaps_url,
        },
        "gis_error": gis_error,
    }
