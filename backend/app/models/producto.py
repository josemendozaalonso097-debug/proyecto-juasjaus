from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from datetime import datetime
from ..database import Base

class Producto(Base):
    __tablename__ = "productos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    marca = Column(String(100), nullable=True)
    precio = Column(Float, nullable=False)
    categoria = Column(String(50), nullable=False)
    imagen = Column(Text, nullable=True)
    tallas = Column(Boolean, default=False)
    semestre = Column(Boolean, default=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
