from datetime import datetime
from sqlalchemy import Column, DateTime, String, Text
from ..database import Base


class SiteCustomization(Base):
    __tablename__ = "site_customizations"

    surface = Column(String(30), primary_key=True, index=True)
    config_json = Column(Text, nullable=False)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
