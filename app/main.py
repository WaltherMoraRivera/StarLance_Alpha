from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import mongodb
from app.db.init_data import init_app_data
from app.routers import (
    task_router,
    balance_router,
    reward_router,
    family_router,
)
from app.routers import auth_router, catalog_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await mongodb.connect_to_mongo()
    await init_app_data()
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
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(catalog_router.router)
app.include_router(family_router.router)
app.include_router(task_router.router)
app.include_router(reward_router.router)
app.include_router(balance_router.router)


@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to the StarLance API!"}
