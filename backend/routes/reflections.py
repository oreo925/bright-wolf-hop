from fastapi import APIRouter, Depends, HTTPException
from typing import List
from beanie import PydanticObjectId
from beanie.operators import In

from core.security import get_current_user
from models.user import User
from models.reflection import Reflection, ReflectionCreate, Reaction, ReactionCreate
from models.herd import Herd
from models.notification import Notification

router = APIRouter()

@router.post("/", response_model=Reflection)
async def create_reflection(reflection_data: ReflectionCreate, current_user: User = Depends(get_current_user)):
    new_reflection = Reflection(
        userId=current_user.id,
        **reflection_data.model_dump()
    )
    await new_reflection.insert()


    if new_reflection.sharedWithType == "herd" and new_reflection.sharedWithId:
        herd = await Herd.get(PydanticObjectId(new_reflection.sharedWithId))
        if herd:
            for member_id in herd.member_ids:
                if member_id != current_user.id:
                    notification = Notification(
                        recipient_id=member_id,
                        sender_id=current_user.id,
                        type="reflection_shared",
                        message=f"{current_user.displayName} shared a reflection with your herd: {herd.name}"
                    )
                    await notification.insert()
    elif new_reflection.sharedWithType == "friend" and new_reflection.sharedWithId:
        notification = Notification(
            recipient_id=PydanticObjectId(new_reflection.sharedWithId),
            sender_id=current_user.id,
            type="reflection_shared",
            message=f"{current_user.displayName} shared a reflection with you"
        )
        await notification.insert()

    return new_reflection

@router.get("/", response_model=List[Reflection])
async def get_reflections(current_user: User = Depends(get_current_user)):
    # Find reflections created by the user
    user_reflections = await Reflection.find(Reflection.userId == current_user.id).to_list()
    
    # Find herds the user is a member of
    herds = await Herd.find(In(Herd.member_ids, [current_user.id])).to_list()
    herd_ids = [str(herd.id) for herd in herds]
    
    # Find reflections shared with those herds
    herd_reflections = await Reflection.find(
        Reflection.sharedWithType == "herd",
        In(Reflection.sharedWithId, herd_ids)
    ).to_list()

    # Find reflections shared with the user as a friend
    friend_reflections = await Reflection.find(
        Reflection.sharedWithType == "friend",
        Reflection.sharedWithId == str(current_user.id)
    ).to_list()
    
    # Combine and deduplicate
    all_reflections = {r.id: r for r in user_reflections + herd_reflections + friend_reflections}
    
    # Manually populate reactions for each reflection
    populated_reflections = []
    for r in all_reflections.values():
        populated_r = r.model_dump()
        populated_r["id"] = str(r.id)
        reactions = await Reaction.find(In("_id", r.reactions)).to_list()
        populated_r["reactions"] = [reaction.model_dump() for reaction in reactions]
        populated_reflections.append(populated_r)

    return populated_reflections

@router.get("/{reflection_id}", response_model=Reflection)
async def get_reflection(reflection_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    reflection = await Reflection.get(reflection_id)
    if not reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")
    
    # Basic authorization: check if user is the creator or part of the shared herd/friend group
    # This is a simplified check. A more robust system would be needed for 'friend' sharing.
    is_owner = reflection.userId == current_user.id
    is_in_shared_herd = False
    if reflection.sharedWithType == 'herd':
        herd = await Herd.get(PydanticObjectId(reflection.sharedWithId))
        if herd and current_user.id in herd.memberIds:
            is_in_shared_herd = True
            
    if not is_owner and not is_in_shared_herd:
        raise HTTPException(status_code=403, detail="Not authorized to view this reflection")

    populated_reflection = reflection.model_dump()
    populated_reflection["id"] = str(reflection.id)
    populated_reactions = []
    for reaction_id in reflection.reactions:
        reaction = await Reaction.get(reaction_id)
        if reaction:
            populated_reactions.append(reaction.model_dump())
    populated_reflection["reactions"] = populated_reactions
    
    return populated_reflection

@router.post("/{reflection_id}/react", response_model=Reaction)
async def create_reaction(reflection_id: PydanticObjectId, reaction_data: ReactionCreate, current_user: User = Depends(get_current_user)):
    reflection = await Reflection.get(reflection_id)
    if not reflection:
        raise HTTPException(status_code=404, detail="Reflection not found")

    # Check if the user has already reacted
    existing_reaction = await Reaction.find_one(
        Reaction.reflectionId == reflection_id,
        Reaction.userId == current_user.id
    )
    if existing_reaction:
        raise HTTPException(status_code=400, detail="User has already reacted to this reflection")

    new_reaction = Reaction(
        reflectionId=reflection_id,
        userId=current_user.id,
        reactionType=reaction_data.reactionType
    )
    await new_reaction.insert()

    reflection.reactions.append(new_reaction.id)
    await reflection.save()
    
    return new_reaction