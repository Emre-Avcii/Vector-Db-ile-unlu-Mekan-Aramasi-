from sqlalchemy import Column, Integer, String, Float
from geoalchemy2 import Geometry
from .database import Base
from pydantic import BaseModel
from typing import List, Optional

# SQLAlchemy Models
class Landmark(Base):
    __tablename__ = "landmarks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    image_url = Column(String)
    # Store location as a Geography point (Long, Lat)
    location = Column(Geometry(geometry_type='POINT', srid=4326, spatial_index=True))

# Pydantic Models
class LandmarkBase(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: str
    latitude: float
    longitude: float

class LandmarkCreate(LandmarkBase):
    pass

class LandmarkResponse(LandmarkBase):
    id: int
    
    class Config:
        orm_mode = True

class SearchResponse(BaseModel):
    id: int
    name: str
    image_url: str
    similarity_score: float
    distance_km: float
    latitude: float
    longitude: float
