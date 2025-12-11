from pydantic import BaseModel, Field
from typing import List, Optional
from beanie import Document
from app.collections import PydanticObjectId
from datetime import datetime

class Reaction(Document):
    id: Optional[PydanticObjectId] = Field(None, alias='_id')
    reflectionId: PydanticObjectId
    userId: PydanticObjectId
    reactionType: str = "tell_me_more"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "reactions"

class Reflection(Document):
    id: Optional[PydanticObjectId] = Field(None, alias='_id')
    userId: PydanticObjectId
    highText: str
    lowText: str
    buffaloText: str
    sharedWithType: str  # 'self', 'friend', 'herd'
    sharedWithId: Optional[str] = None
    reactions: List[PydanticObjectId] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reflections"

class ReflectionCreate(BaseModel):
    highText: str
    lowText: str
    buffaloText: str
    sharedWithType: str
    sharedWithId: Optional[str] = None

class ReactionCreate(BaseModel):
    reactionType: str = "tell_me_more"