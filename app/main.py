from dotenv import load_dotenv
import os

load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import users
from app.api import hello
from app.api import predict
from app.api import data
from app.api import gis
from app.api import media
from app.api import history
from app.api import statistics
from app.api import payments
from app.api import contact
from app.api import notifications
from app.api import achievements
from app.api import favorites


app = FastAPI(
    title="Vietnam Landmark Recognition API",
    description="AI-based Vietnamese landmark recognition system",
    version="1.0.0",
)


def custom_openapi():
    try:
        from fastapi.openapi.utils import get_openapi
    except Exception:
        return app.openapi_schema

    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    # Add bearer auth scheme so Swagger UI shows Authorize button
    components = openapi_schema.setdefault("components", {})
    security_schemes = components.setdefault("securitySchemes", {})
    security_schemes["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }

    # Apply global security requirement (UI will send header when authorized)
    openapi_schema.setdefault("security", []).append({"BearerAuth": []})

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký toàn bộ các API Routers
app.include_router(users.router)
app.include_router(hello.router)
app.include_router(predict.router)
app.include_router(data.router)
app.include_router(gis.router)
app.include_router(media.router)
app.include_router(history.router)
app.include_router(statistics.router)
app.include_router(statistics.router, prefix="/admin")  # Hỗ trợ backward-compatibility
app.include_router(payments.router)
app.include_router(contact.router)
app.include_router(notifications.router)
app.include_router(achievements.router)
app.include_router(favorites.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
