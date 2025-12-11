from pydantic import BaseModel, Field
from typing import List, Optional
from beanie import Document
from app.collections import PydanticObjectId
from models.user import User

class Herd(Document):
    id: Optional[PydanticObjectId] = Field(None, alias='_id')
    name: str
    owner_id: PydanticObjectId = Field(..., alias="ownerId")
    member_ids: List[PydanticObjectId] = Field(default_factory=list, alias="memberIds")
    members: Optional[List[User]] = None

    class Settings:
        name = "herds"

class HerdCreate(BaseModel):
    name: str
    member_emails: Optional[List[str]] = Field(default_factory=list, alias="memberEmails")

class HerdUpdate(BaseModel):
    name: Optional[str] = None
    member_emails: Optional[List[str]] = Field(None, alias="memberEmails")
