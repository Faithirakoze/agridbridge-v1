from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.db.session import get_db
from app.core.security import get_current_user
from app.models import Farm, User

router = APIRouter()

class FarmIn(BaseModel):
    name:     str
    area_ha:  float
    district: Optional[str] = "Kigali"

class FarmOut(BaseModel):
    id: UUID; name: str; area_ha: float; district: Optional[str]
    class Config: from_attributes = True

@router.post("", response_model=FarmOut)
def create_farm(body: FarmIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = Farm(**body.model_dump(), owner_id=user.id)
    db.add(farm); db.commit(); db.refresh(farm)
    return farm

@router.get("", response_model=list[FarmOut])
def list_farms(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Farm).filter(Farm.owner_id == user.id).all()

@router.put("/{farm_id}", response_model=FarmOut)
def update_farm(farm_id: UUID, body: FarmIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.owner_id == user.id).first()
    if not farm:
        raise HTTPException(404, "Farm not found")

    for key, value in body.model_dump().items():
        setattr(farm, key, value)

    db.commit()
    db.refresh(farm)
    return farm

@router.delete("/{farm_id}")
def delete_farm(farm_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    farm = db.query(Farm).filter(Farm.id == farm_id, Farm.owner_id == user.id).first()
    if not farm:
        raise HTTPException(404, "Farm not found")

    db.delete(farm)
    db.commit()
    return {"ok": True}
