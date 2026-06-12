from fastapi import HTTPException, status
from typing import List, Optional
from app.repositories import family_repository
from app.schemas.family import FamilyCreate, FamilyUpdate


async def create_family_service(family_data: FamilyCreate) -> dict:
    # Additional business logic can be added here, e.g.,
    # - Check for duplicate family names
    # - Validate member roles and initial balances
    return await family_repository.create_family(family_data)


async def get_all_families_service() -> List[dict]:
    return await family_repository.get_all_families()


async def get_family_by_id_service(family_id: str) -> Optional[dict]:
    family = await family_repository.get_family_by_id(family_id)
    if not family:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
    return family


async def update_family_service(family_id: str, family_data: FamilyUpdate) -> Optional[dict]:
    # Ensure at least one parent remains in the family if members are updated
    if family_data.members is not None:
        if not any(member.role == "parent" for member in family_data.members):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A family must have at least one parent.",
            )

    updated_family = await family_repository.update_family(family_id, family_data)
    if not updated_family:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
    return updated_family


async def delete_family_service(family_id: str) -> None:
    # Add logic here to handle cascading deletes if necessary
    # For example, delete all tasks, rewards, and transactions associated with the family
    deleted = await family_repository.delete_family(family_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Family not found")
    return {"detail": "Family deleted successfully"}
