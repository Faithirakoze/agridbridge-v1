from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models import Farm, User
from app.services.weather import WeatherServiceError, build_weather_alerts

router = APIRouter()


class AlertOut(BaseModel):
    id: str
    type: str
    title: str
    body: str
    location: str
    observed_at: datetime | None = None
    source: str | None = None


@router.get("", response_model=list[AlertOut])
def get_alerts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    farm = db.query(Farm).filter(Farm.owner_id == user.id).order_by(Farm.created_at.desc()).first()
    if farm and farm.district:
        location_name = farm.district
    else:
        location_name = user.district or "Kigali"

    try:
        return build_weather_alerts(location_name)
    except WeatherServiceError:
        return [
            AlertOut(
                id="weather-fallback",
                type="general",
                title="Live weather is temporarily unavailable",
                body=(
                    f"We could not refresh weather alerts for {location_name} right now. "
                    "Please try again shortly."
                ),
                location=location_name,
                source="fallback",
            )
        ]
