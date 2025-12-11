from pydantic import Field
from typing import List
from beanie import Document
from app.collections import PydanticObjectId

class Friend(Document):
    user_id: PydanticObjectId
    friend_ids: List[PydanticObjectId] = Field(default_factory=list)

    class Settings:
        name = "friends"