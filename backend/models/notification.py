from pydantic import BaseModel, Field
from typing import Optional
from beanie import Document
from app.collections import PydanticObjectId

class Notification(Document):
    id: Optional[PydanticObjectId] = Field(None, alias='_id')
    sender_id: PydanticObjectId = Field(..., alias="senderId")
    recipient_id: PydanticObjectId = Field(..., alias="recipientId")
    type: str
    read: bool = False
    message: str

    class Settings:
        name = "notifications"

class NotificationCreate(BaseModel):
    recipient_id: PydanticObjectId = Field(..., alias="recipientId")
    type: str
    message: str