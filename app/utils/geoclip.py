from functools import lru_cache
from pathlib import Path

from src import GeoCLIPService


@lru_cache(maxsize=1)
def get_geoclip_service() -> GeoCLIPService:
    """
    Khởi tạo GeoCLIPService một lần duy nhất.

    Data structure:
        app/
        ├── data/
        └── weights/
    """

    app_dir = Path(__file__).resolve().parent.parent

    print("[GeoCLIP] Initializing service...")

    service = GeoCLIPService(
        root_dir=str(app_dir),
        scope="vietnam"
    )

    print("[GeoCLIP] Service ready!")

    return service


def predict_image(image_path: str, top_k: int = 5):
    """
    Predict địa danh từ đường dẫn ảnh.

    Args:
        image_path: đường dẫn tới file ảnh
        top_k: số kết quả trả về

    Returns:
        list predictions
    """

    service = get_geoclip_service()

    return service.predict(
        image_path,
        top_k=top_k
    )