from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.db.session import get_db
from app.core.security import get_current_user
from app.models import Crop, Farm, User

router = APIRouter()

class CropIn(BaseModel):
    farm_id: str; crop_type: str
    plot_name: Optional[str] = None; area_ha: Optional[float] = None
    planted_at: Optional[datetime] = None

class CropOut(BaseModel):
    id: str; farm_id: str; crop_type: str
    plot_name: Optional[str]; area_ha: Optional[float]
    planted_at: Optional[datetime]; status: str
    class Config: from_attributes = True

def _farm_ids(user, db):
    return [str(f.id) for f in db.query(Farm).filter(Farm.owner_id == user.id).all()]

@router.post("", response_model=CropOut)
def create_crop(body: CropIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if body.farm_id not in _farm_ids(user, db):
        raise HTTPException(404, "Farm not found")
    crop = Crop(**body.model_dump())
    db.add(crop); db.commit(); db.refresh(crop)
    return crop

@router.get("", response_model=list[CropOut])
def list_crops(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    fids = _farm_ids(user, db)
    return db.query(Crop).filter(Crop.farm_id.in_(fids)).all()
