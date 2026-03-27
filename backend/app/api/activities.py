from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.db.session import get_db
from app.core.security import get_current_user
from app.models import FarmActivity, Crop, Farm, User

router = APIRouter()

class ActivityIn(BaseModel):
    crop_id: UUID; activity_type: str; activity_date: datetime
    quantity: Optional[str] = None; notes: Optional[str] = None

class ActivityOut(BaseModel):
    id: UUID; crop_id: UUID; activity_type: str
    activity_date: datetime; quantity: Optional[str]; notes: Optional[str]
    class Config: from_attributes = True

def _crop_ids(user, db):
    fids = [f.id for f in db.query(Farm).filter(Farm.owner_id == user.id).all()]
    return [c.id for c in db.query(Crop).filter(Crop.farm_id.in_(fids)).all()]

@router.post("", response_model=ActivityOut)
def log_activity(body: ActivityIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if body.crop_id not in _crop_ids(user, db):
        raise HTTPException(404, "Crop not found")
    act = FarmActivity(**body.model_dump())
    db.add(act); db.commit(); db.refresh(act)
    return act

@router.get("", response_model=list[ActivityOut])
def list_activities(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cids = _crop_ids(user, db)
    return db.query(FarmActivity).filter(FarmActivity.crop_id.in_(cids)).order_by(FarmActivity.activity_date.desc()).all()

@router.put("/{activity_id}", response_model=ActivityOut)
def update_activity(activity_id: UUID, body: ActivityIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    crop_ids = _crop_ids(user, db)
    if body.crop_id not in crop_ids:
        raise HTTPException(404, "Crop not found")

    activity = db.query(FarmActivity).filter(FarmActivity.id == activity_id, FarmActivity.crop_id.in_(crop_ids)).first()
    if not activity:
        raise HTTPException(404, "Activity not found")

    for key, value in body.model_dump().items():
        setattr(activity, key, value)

    db.commit()
    db.refresh(activity)
    return activity

@router.delete("/{activity_id}")
def delete_activity(activity_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    activity = db.query(FarmActivity).filter(FarmActivity.id == activity_id, FarmActivity.crop_id.in_(_crop_ids(user, db))).first()
    if not activity:
        raise HTTPException(404, "Activity not found")

    db.delete(activity)
    db.commit()
    return {"ok": True}
