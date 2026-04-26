from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from ..database_otp import BaseOTP

class OTPCode(BaseOTP):
    __tablename__ = "otp_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), index=True, nullable=False)
    code = Column(String(6), nullable=False)
    # Almacenamos the hashed password the user chose so we can create the actual account later
    password_hash = Column(String(200), nullable=False)
    nombre = Column(String(100), nullable=False)
    rol = Column(String(50), nullable=False)
    semestre = Column(Integer, nullable=True) # opcional
    
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
