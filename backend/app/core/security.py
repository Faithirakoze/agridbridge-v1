from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models import User

bearer = HTTPBearer()

def create_token(user_id: str) -> str:
    expire  = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGO)

def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db:    Session                       = Depends(get_db),
) -> User:
    try:
        data    = jwt.decode(creds.credentials, settings.JWT_SECRET, algorithms=[settings.JWT_ALGO])
        user_id = data.get("sub")
        if not user_id:
            raise ValueError
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
