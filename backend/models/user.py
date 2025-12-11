from pydantic import BaseModel, Field
from typing import Optional
from beanie import Document
from datetime import datetime
from app.collections import PydanticObjectId

class User(Document):
    id: Optional[PydanticObjectId] = Field(None, alias='_id')
    displayName: str
    email: str
    password: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        
class UserCreate(BaseModel):
    displayName: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    displayName: Optional[str] = None
    password: Optional[str] = None