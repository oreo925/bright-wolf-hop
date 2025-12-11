from fastapi import APIRouter, Depends, HTTPException
from typing import List
from core.security import get_current_user
from models.user import User
from models.friend import Friend
from app.collections import PydanticObjectId
from routes.notifications import create_notification
from models.notification import NotificationCreate

router = APIRouter()

from fastapi.responses import JSONResponse

@router.post("/add/{friend_id}")
async def add_friend(friend_id: PydanticObjectId, current_user: User = Depends(get_current_user), notification_creation: bool = True):
    if friend_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot add yourself as a friend")

    friends_doc = await Friend.find_one(Friend.user_id == current_user.id)
    if not friends_doc:
        friends_doc = Friend(user_id=current_user.id)

    if friend_id in friends_doc.friend_ids:
        raise HTTPException(status_code=400, detail="User is already your friend")

    # Add friend to current user's friend list
    friends_doc.friend_ids.append(friend_id)
    await friends_doc.save()

    # Add current user to the friend's friend list (reciprocal relationship)
    friend_friends_doc = await Friend.find_one(Friend.user_id == friend_id)
    if not friend_friends_doc:
        friend_friends_doc = Friend(user_id=friend_id)
    
    if current_user.id not in friend_friends_doc.friend_ids:
        friend_friends_doc.friend_ids.append(current_user.id)
        await friend_friends_doc.save()

    if notification_creation:
        notification_data = NotificationCreate(
            recipientId=friend_id,
            type="friend_request",
            message=f"You have a new friend request from {current_user.email}"
        )
        await create_notification(notification_data, current_user)

    friend_users = await User.find({"_id": {"$in": friends_doc.friend_ids}}).to_list()
    return friend_users

@router.delete("/remove/{friend_id}")
async def remove_friend(friend_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    friends = await Friend.find_one(Friend.user_id == current_user.id)
    if friends and friend_id in friends.friend_ids:
        friends.friend_ids.remove(friend_id)
        await friends.save()
    return JSONResponse(content={"friends": friends.model_dump_json()})

@router.get("/", response_model=List[User])
async def get_friends(current_user: User = Depends(get_current_user)):
    friends = await Friend.find_one(Friend.user_id == current_user.id)
    if friends:
        friend_users = await User.find({"_id": {"$in": friends.friend_ids}}).to_list()
        return friend_users
    return []