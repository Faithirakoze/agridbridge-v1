from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models import User
from app.core.config import settings
from app.core.security import create_token

router = APIRouter()
_otp_store: dict[str, str] = {}

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp:   str
    name:  str | None = None

@router.post("/request-otp")
def request_otp(body: OTPRequest):
    _otp_store[body.phone] = settings.DEV_OTP
    return {"message": "OTP sent", "dev_otp": settings.DEV_OTP}

@router.post("/verify-otp")
def verify_otp(body: OTPVerify, db: Session = Depends(get_db)):
    stored = _otp_store.get(body.phone)
    if not stored or stored != body.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user   = db.query(User).filter(User.phone == body.phone).first()
    is_new = user is None

    if is_new:
        if not body.name:
            return {"is_new_user": True}
        user = User(phone=body.phone, name=body.name)
        db.add(user); db.commit(); db.refresh(user)

    del _otp_store[body.phone]

    return {
        "access_token": create_token(str(user.id)),
        "token_type":   "bearer",
        "is_new_user":  is_new,
        "user": {"id": str(user.id), "name": user.name, "phone": user.phone},
    }
