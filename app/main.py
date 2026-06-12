from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.db import mongodb
from app.db.init_data import init_app_data
from app.routers import (
    task_router,
    balance_router,
    reward_router,
    family_router,
)
from app.routers import auth_router, catalog_router

FRONTEND_DIST = Path("frontend/dist")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await mongodb.connect_to_mongo()
    try:
        await init_app_data()
    except Exception as e:
        print(f"[WARNING] init_app_data failed: {e} — continuing startup")
    yield
    await mongodb.close_mongo_connection()


app = FastAPI(
    title="StarLance API",
    description="A gamified task management system for families.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers — must be registered BEFORE static file catch-all
app.include_router(auth_router.router)
app.include_router(catalog_router.router)
app.include_router(family_router.router)
app.include_router(task_router.router)
app.include_router(reward_router.router)
app.include_router(balance_router.router)


@app.get("/health", tags=["Root"])
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


# Serve React SPA — handles both static assets and client-side routing
if FRONTEND_DIST.exists():
    # Mount compiled assets with proper cache headers
    if (FRONTEND_DIST / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/", include_in_schema=False)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str = ""):
        # Serve existing static files directly (favicon, svg, etc.)
        if full_path:
            candidate = FRONTEND_DIST / full_path
            if candidate.is_file():
                return FileResponse(candidate)
        # All other routes → index.html (React Router takes over)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/", tags=["Root"])
    async def root():
        return {"message": "StarLance API — frontend not built yet"}
