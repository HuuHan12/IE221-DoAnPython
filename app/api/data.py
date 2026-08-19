import os
import math
from functools import lru_cache
from typing import Optional, Dict, Any, List
import pandas as pd
from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/data", tags=["Data Explorer"])

BASE_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

DATASET_CONFIG = {
    "iconic": {
        "file_name": "vietnam_landmarks_iconic.csv",
        "title": "Danh Lam Biểu Tượng Việt Nam (Iconic Landmarks)",
        "subtitle": "Tập dữ liệu các công trình và danh lam thắng cảnh tiêu biểu của 63 tỉnh thành",
        "accuracy_target": "Độ chính xác nhận diện > 92%",
        "badge_icon": "🏛️",
    },
    "vietnam_iconic": {
        "file_name": "vietnam_landmarks_iconic.csv",
        "title": "Danh Lam Biểu Tượng Việt Nam (Iconic Landmarks)",
        "subtitle": "Tập dữ liệu các công trình và danh lam thắng cảnh tiêu biểu của 63 tỉnh thành",
        "accuracy_target": "Độ chính xác nhận diện > 92%",
        "badge_icon": "🏛️",
    },
}


def normalize_scope(scope: str) -> str:
    return "iconic"


@lru_cache(maxsize=2)
def load_dataset_df(scope: str = "iconic") -> pd.DataFrame:
    cfg = DATASET_CONFIG["iconic"]
    csv_path = os.path.join(BASE_DATA_DIR, cfg["file_name"])

    if not os.path.exists(csv_path):
        # Fallback check in source/data
        src_data_path = os.path.abspath(os.path.join(BASE_DATA_DIR, "..", "..", "source", "data", cfg["file_name"]))
        if os.path.exists(src_data_path):
            csv_path = src_data_path
        else:
            raise FileNotFoundError(f"Không tìm thấy file dữ liệu: {cfg['file_name']}")

    df = pd.read_csv(csv_path)
    df.fillna("", inplace=True)
    return df


@router.get("/explorer")
def get_data_explorer_summary(scope: str = Query("iconic")) -> Dict[str, Any]:
    """
    API tính toán 100% bằng Python trả về thông tin tổng quan,
    phân bố địa lý và phân loại theo dataset vietnam_landmarks_iconic.csv.
    """
    cfg = DATASET_CONFIG["iconic"]

    try:
        df = load_dataset_df("iconic")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    total_records = len(df)
    columns = list(df.columns)

    regions_dist = []
    categories_dist = []

    # 1. Xử lý phân bố địa lý theo Tỉnh / Thành
    if "PROVINCE" in df.columns:
        prov_counts = df["PROVINCE"].value_counts().head(8)
        for prov_name, count in prov_counts.items():
            if prov_name:
                pct = round((count / total_records) * 100, 1)
                regions_dist.append({
                    "name": str(prov_name),
                    "count": int(count),
                    "percentage": f"{pct}%",
                })

    # 2. Xử lý phân loại hạng mục
    if "CATEGORY" in df.columns:
        cat_counts = df["CATEGORY"].value_counts().head(8)
        for cat_name, count in cat_counts.items():
            if cat_name:
                pct = round((count / total_records) * 100, 1)
                categories_dist.append({
                    "name": str(cat_name),
                    "count": int(count),
                    "percentage": f"{pct}%",
                })

    return {
        "scope": "iconic",
        "file_name": cfg["file_name"],
        "title": cfg["title"],
        "subtitle": cfg["subtitle"],
        "accuracy_target": cfg["accuracy_target"],
        "badge_icon": cfg["badge_icon"],
        "total_records": total_records,
        "columns": columns,
        "regions": regions_dist,
        "categories": categories_dist,
    }


@router.get("/records")
def get_data_records(
    scope: str = Query("iconic"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
) -> Dict[str, Any]:
    """
    API phân trang, tìm kiếm và định dạng dữ liệu bảng CSV bằng Python.
    """
    try:
        df = load_dataset_df("iconic")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Tìm kiếm theo từ khóa nếu có
    filtered_df = df
    if search and search.strip():
        search_query = search.strip().lower()
        mask = False
        for col in df.columns:
            mask = mask | df[col].astype(str).str.lower().str.contains(search_query, na=False)
        filtered_df = df[mask]

    total_matches = len(filtered_df)
    total_pages = max(1, math.ceil(total_matches / page_size))
    current_page = min(page, total_pages)

    start_idx = (current_page - 1) * page_size
    end_idx = start_idx + page_size

    sliced_df = filtered_df.iloc[start_idx:end_idx].copy()
    
    # Chuyển đổi DataFrame thành danh sách dict chuẩn
    records = []
    for idx, row in sliced_df.iterrows():
        lat_val = float(row["LAT"]) if "LAT" in row and str(row["LAT"]).strip() != "" else 0.0
        lon_val = float(row["LON"]) if "LON" in row and str(row["LON"]).strip() != "" else 0.0

        item = {
            "index": int(idx) + 1,
            "lat": lat_val,
            "lon": lon_val,
            "name": str(row.get("NAME", "")),
            "category": str(row.get("CATEGORY", "")),
            "province": str(row.get("PROVINCE", "")),
            "description": str(row.get("DESCRIPTION", "")),
            "gmaps_url": f"https://www.google.com/maps?q={lat_val:.6f},{lon_val:.6f}",
        }
        records.append(item)

    return {
        "scope": "iconic",
        "page": current_page,
        "page_size": page_size,
        "total_records": total_matches,
        "total_pages": total_pages,
        "records": records,
        "columns": list(df.columns),
    }
