from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from ..database import Base


class OxxoPayment(Base):
    __tablename__ = "oxxo_payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    code = Column(String(32), unique=True, nullable=False, index=True)
    total = Column(Float, nullable=False)
    mode = Column(String(30), nullable=False, default="tienda")
    items_json = Column(Text, nullable=False)
    estado = Column(String(20), nullable=False, default="Pendiente")
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    paid_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="oxxo_payments")