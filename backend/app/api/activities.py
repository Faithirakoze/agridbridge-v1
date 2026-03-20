from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.db.session import get_db
from app.core.security import get_current_user
from app.models import FarmActivity, Crop, Farm, User

router = APIRouter()

class ActivityIn(BaseModel):
    crop_id: str; activity_type: str; activity_date: datetime
    quantity: Optional[str] = None; notes: Optional[str] = None

class ActivityOut(BaseModel):
    id: str; crop_id: str; activity_type: str
    activity_date: datetime; quantity: Optional[str]; notes: Optional[str]
    class Config: from_attributes = True

def _crop_ids(user, db):
    fids = [str(f.id) for f in db.query(Farm).filter(Farm.owner_id == user.id).all()]
    return [str(c.id) for c in db.query(Crop).filter(Crop.farm_id.in_(fids)).all()]

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
