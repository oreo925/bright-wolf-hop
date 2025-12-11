from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models.user import User, UserCreate, UserLogin
from core.security import hash_password, create_access_token, verify_password, get_current_user
from app.database import get_collection

router = APIRouter()

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate):
    existing_user = await User.find_one(User.email == user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = hash_password(user.password)
    user_data = user.dict()
    del user_data["password"]
    new_user = User(
        **user_data,
        password=hashed_password
    )
    await new_user.insert()
    
    access_token = create_access_token(data={"sub": str(new_user.id)})
    
    return {"token": access_token}

@router.post("/login")
async def login(user: UserLogin):
    existing_user = await User.find_one(User.email == user.email)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    if not verify_password(user.password, existing_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
        
    access_token = create_access_token(data={"sub": str(existing_user.id)})
    
    return {"token": access_token}

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
