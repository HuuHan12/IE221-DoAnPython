from fastapi import APIRouter, Depends

from app.core.auth import get_current_user


router = APIRouter(
    prefix="/api/favorites",
    tags=["Favorites"],
)


@router.get("")
async def get_favorites(current_user=Depends(get_current_user)):
    return {
        "user_id": current_user.id,
        "message": "Authenticated request",
    }