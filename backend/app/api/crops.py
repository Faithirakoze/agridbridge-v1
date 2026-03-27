from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.db.session import get_db
from app.core.security import get_current_user
from app.models import Crop, CropStatus, Farm, User

router = APIRouter()

class CropIn(BaseModel):
    farm_id: UUID; crop_type: str
    plot_name: Optional[str] = None; area_ha: Optional[float] = None
    planted_at: Optional[datetime] = None
    status: Optional[CropStatus] = None

class CropOut(BaseModel):
    id: UUID; farm_id: UUID; crop_type: str
    plot_name: Optional[str]; area_ha: Optional[float]
    planted_at: Optional[datetime]; status: str
    class Config: from_attributes = True

def _farm_ids(user, db):
    return [f.id for f in db.query(Farm).filter(Farm.owner_id == user.id).all()]

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

@router.put("/{crop_id}", response_model=CropOut)
def update_crop(crop_id: UUID, body: CropIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm_ids = _farm_ids(user, db)
    if body.farm_id not in farm_ids:
        raise HTTPException(404, "Farm not found")

    crop = db.query(Crop).filter(Crop.id == crop_id, Crop.farm_id.in_(farm_ids)).first()
    if not crop:
        raise HTTPException(404, "Crop not found")

    for key, value in body.model_dump().items():
        setattr(crop, key, value)

    db.commit()
    db.refresh(crop)
    return crop

@router.delete("/{crop_id}")
def delete_crop(crop_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    crop = db.query(Crop).filter(Crop.id == crop_id, Crop.farm_id.in_(_farm_ids(user, db))).first()
    if not crop:
        raise HTTPException(404, "Crop not found")

    db.delete(crop)
    db.commit()
    return {"ok": True}
