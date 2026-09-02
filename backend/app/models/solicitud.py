from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..database import Base


class Solicitud(Base):
    __tablename__ = "solicitudes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    tipo = Column(String(30), nullable=False)
    titulo = Column(String(200), nullable=False)
    detalle = Column(Text, nullable=True)
    archivos = Column(Text, nullable=True)
    estado = Column(String(40), nullable=False, default="Enviada", server_default="Enviada")
    nota_admin = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="solicitudes")