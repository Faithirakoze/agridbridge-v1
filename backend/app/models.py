import uuid, enum
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base


class User(Base):
    __tablename__ = "users"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone      = Column(String(20),  unique=True, nullable=False, index=True)
    name       = Column(String(100), nullable=False)
    district   = Column(String(100), default="Kigali")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    farms      = relationship("Farm", back_populates="owner", cascade="all, delete")


class Farm(Base):
    __tablename__ = "farms"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id   = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name       = Column(String(100), nullable=False)
    area_ha    = Column(Float, default=0.0)
    district   = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner      = relationship("User",  back_populates="farms")
    crops      = relationship("Crop",  back_populates="farm", cascade="all, delete")


class CropStatus(str, enum.Enum):
    seedling  = "seedling"
    growing   = "growing"
    at_risk   = "at_risk"
    harvested = "harvested"


class Crop(Base):
    __tablename__ = "crops"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id    = Column(UUID(as_uuid=True), ForeignKey("farms.id"), nullable=False)
    crop_type  = Column(String(50),  nullable=False)
    plot_name  = Column(String(100))
    area_ha    = Column(Float)
    planted_at = Column(DateTime(timezone=True))
    status     = Column(Enum(CropStatus), default=CropStatus.seedling)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    farm       = relationship("Farm", back_populates="crops")
    activities = relationship("FarmActivity", back_populates="crop", cascade="all, delete")


class FarmActivity(Base):
    __tablename__ = "farm_activities"
    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id       = Column(UUID(as_uuid=True), ForeignKey("crops.id"), nullable=False)
    activity_type = Column(String(50), nullable=False)
    quantity      = Column(String(100))
    notes         = Column(Text)
    activity_date = Column(DateTime(timezone=True), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    crop          = relationship("Crop", back_populates="activities")


class MarketPrice(Base):
    __tablename__ = "market_prices"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_type   = Column(String(50),  nullable=False, index=True)
    price_rwf   = Column(Float,       nullable=False)
    market_name = Column(String(100), nullable=False)
    district    = Column(String(100), nullable=False, index=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
