from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.db.session import get_db
from app.core.security import get_current_user
from app.models import MarketPrice, User

router = APIRouter()

class PriceOut(BaseModel):
    id: UUID; crop_type: str; price_rwf: float
    market_name: str; district: str; recorded_at: datetime
    class Config: from_attributes = True


@router.get("", response_model=list[PriceOut])
def get_prices(
    district:  Optional[str] = Query(None),
    crop_type: Optional[str] = Query(None),
    db:        Session       = Depends(get_db),
    user:      User          = Depends(get_current_user),
):
    q = db.query(MarketPrice)
    if district:  q = q.filter(MarketPrice.district.ilike(f"%{district}%"))
    if crop_type: q = q.filter(MarketPrice.crop_type.ilike(f"%{crop_type}%"))
    return q.order_by(MarketPrice.recorded_at.desc()).all()
