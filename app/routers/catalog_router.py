from fastapi import APIRouter, status
from typing import List
from app.schemas.catalog import CatalogTaskCreate, CatalogTaskUpdate, CatalogTaskResponse
from app.repositories import catalog_repository

router = APIRouter(prefix="/catalog", tags=["Task Catalog"])


@router.get("/", response_model=List[CatalogTaskResponse])
async def get_catalog(active_only: bool = False):
    return await catalog_repository.get_all_catalog_tasks(active_only)


@router.post("/", response_model=CatalogTaskResponse, status_code=status.HTTP_201_CREATED)
async def create_catalog_task(data: CatalogTaskCreate):
    return await catalog_repository.create_catalog_task(data)


@router.patch("/{task_id}", response_model=CatalogTaskResponse)
async def update_catalog_task(task_id: str, data: CatalogTaskUpdate):
    result = await catalog_repository.update_catalog_task(task_id, data)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return result


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_catalog_task(task_id: str):
    await catalog_repository.delete_catalog_task(task_id)
