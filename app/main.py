from contextlib import asynccontextmanager

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
#from app.api import history
from app.database.database import init_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    yield


app = FastAPI(
    title="Vietnam Landmark Recognition API",
    description="AI-based Vietnamese landmark recognition system",
    version="1.0.0",
    lifespan=lifespan
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
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(hello.router)
app.include_router(predict.router)
app.include_router(data.router)
app.include_router(gis.router)
app.include_router(media.router)
# app.include_router(history.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)