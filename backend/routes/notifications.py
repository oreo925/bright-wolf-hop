from fastapi import APIRouter, Depends, HTTPException
from typing import List
from beanie import PydanticObjectId

from core.security import get_current_user
from models.user import User
from models.notification import Notification, NotificationCreate

router = APIRouter()

@router.post("/", response_model=Notification)
async def create_notification(notification_data: NotificationCreate, current_user: User = Depends(get_current_user)):
    new_notification = Notification(
        **notification_data.dict(),
        sender_id=current_user.id
    )
    await new_notification.insert()
    return new_notification

@router.get("/", response_model=List[Notification])
async def read_notifications(current_user: User = Depends(get_current_user)):
    notifications = await Notification.find({"recipientId": current_user.id}).to_list()
    return notifications

@router.put("/{notification_id}/read")
async def mark_notification_as_read(notification_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    notification = await Notification.get(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    if notification.recipient_id != current_user.id:
        raise HTTPException(status_code=403, detail="User is not the recipient of this notification")
        
    notification.read = True
    await notification.save()
    return {"message": "Notification marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    notification = await Notification.get(notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notification.recipient_id != current_user.id and notification.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="User is not authorized to delete this notification")

    await notification.delete()
    return {"message": "Notification deleted"}