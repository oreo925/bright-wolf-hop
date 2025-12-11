from fastapi import APIRouter, Depends, HTTPException
from typing import List
from beanie import PydanticObjectId
from beanie.operators import In

from core.security import get_current_user
from models.user import User
from models.herd import Herd, HerdCreate, HerdUpdate

router = APIRouter()

@router.post("/", response_model=Herd)
async def create_herd(herd_data: HerdCreate, current_user: User = Depends(get_current_user)):
    owner_id = current_user.id
    
    member_ids = []
    if herd_data.member_emails:
        for email in herd_data.member_emails:
            member = await User.find_one(User.email == email)
            if member:
                member_ids.append(member.id)
            else:
                raise HTTPException(status_code=404, detail=f"User with email {email} not found")

    # Add owner to member list if not already included
    if owner_id not in member_ids:
        member_ids.append(owner_id)

    new_herd = Herd(
        name=herd_data.name,
        ownerId=owner_id,
        member_ids=member_ids
    )

    await new_herd.insert()
    return new_herd

@router.get("/", response_model=List[Herd])
async def read_herds(current_user: User = Depends(get_current_user)):
    herds = await Herd.find(In(Herd.member_ids, [current_user.id])).to_list()
    
    # Manually fetch and attach member details to each herd
    for herd in herds:
        member_details = await User.find(In(User.id, herd.member_ids)).to_list()
        herd.members = member_details  # Assuming 'members' can be a dynamic attribute
        
    return herds

@router.get("/{herd_id}", response_model=Herd)
async def get_herd(herd_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    herd = await Herd.get(herd_id)
    if not herd:
        raise HTTPException(status_code=404, detail="Herd not found")
    
    if current_user.id not in herd.member_ids:
        raise HTTPException(status_code=403, detail="User is not a member of this herd")
        
    return herd

@router.put("/{herd_id}", response_model=Herd)
async def update_herd(herd_id: PydanticObjectId, herd_data: HerdUpdate, current_user: User = Depends(get_current_user)):
    herd = await Herd.get(herd_id)
    if not herd:
        raise HTTPException(status_code=404, detail="Herd not found")
    
    if herd.ownerId != current_user.id:
        raise HTTPException(status_code=403, detail="User is not the owner of this herd")
    
    if herd_data.name:
        herd.name = herd_data.name
    
    if herd_data.member_emails is not None:
        member_ids = []
        for email in herd_data.member_emails:
            member = await User.find_one(User.email == email)
            if member:
                member_ids.append(member.id)
            else:
                raise HTTPException(status_code=404, detail=f"User with email {email} not found")
        herd.member_ids = member_ids

    await herd.save()
    return herd

@router.delete("/{herd_id}")
async def delete_herd(herd_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    herd = await Herd.get(herd_id)
    if not herd:
        raise HTTPException(status_code=404, detail="Herd not found")

    if herd.ownerId != current_user.id:
        raise HTTPException(status_code=403, detail="User is not the owner of this herd")

    await herd.delete()
    return {"message": "Herd deleted successfully"}

@router.post("/{herd_id}/leave")
async def leave_herd(herd_id: PydanticObjectId, current_user: User = Depends(get_current_user)):
    herd = await Herd.get(herd_id)
    if not herd:
        raise HTTPException(status_code=404, detail="Herd not found")

    if current_user.id not in herd.member_ids:
        raise HTTPException(status_code=403, detail="User is not a member of this herd")

    if herd.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Owner cannot leave the herd, please delete it instead")

    herd.member_ids.remove(current_user.id)
    await herd.save()
    return {"message": "Successfully left the herd"}