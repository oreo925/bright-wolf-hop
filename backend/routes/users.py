from fastapi import APIRouter, Depends, HTTPException
from typing import List
from core.security import get_current_user, hash_password
from models.user import User, UserUpdate

router = APIRouter()

@router.get("/", response_model=List[User])
async def get_all_users(current_user: User = Depends(get_current_user)):
    users = await User.find_all().to_list()
    return users

@router.get("/email/{email}", response_model=User)
async def get_user_by_email(email: str, current_user: User = Depends(get_current_user)):
    user = await User.find_one(User.email == email)
    if user:
        return user
    raise HTTPException(status_code=404, detail="User not found")

@router.put("/me", response_model=User)
async def update_user(user_update: UserUpdate, current_user: User = Depends(get_current_user)):
    if user_update.displayName:
        current_user.displayName = user_update.displayName
    if user_update.password:
        current_user.password = hash_password(user_update.password)
    
    await current_user.save()
    return current_user