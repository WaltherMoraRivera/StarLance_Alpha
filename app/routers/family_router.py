from fastapi import APIRouter, status
from typing import List
from app.schemas.family import FamilyCreate, FamilyUpdate, FamilyResponse
from app.services import family_service

router = APIRouter(prefix="/families", tags=["Families"])


@router.post("/", response_model=FamilyResponse, status_code=status.HTTP_201_CREATED)
async def create_family(family: FamilyCreate):
    return await family_service.create_family_service(family)


@router.get("/", response_model=List[FamilyResponse])
async def get_families():
    return await family_service.get_all_families_service()


@router.get("/{family_id}", response_model=FamilyResponse)
async def get_family(family_id: str):
    return await family_service.get_family_by_id_service(family_id)


@router.patch("/{family_id}", response_model=FamilyResponse)
async def update_family(family_id: str, family: FamilyUpdate):
    return await family_service.update_family_service(family_id, family)


@router.delete("/{family_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family(family_id: str):
    await family_service.delete_family_service(family_id)
    return {}
