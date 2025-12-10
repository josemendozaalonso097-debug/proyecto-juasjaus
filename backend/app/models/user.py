from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=True)  # Nullable para usuarios de Google
    google_id = Column(String(100), unique=True, nullable=True)
    profile_picture = Column(String(300), nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relaciones
    compras = relationship("Compra", back_populates="user", cascade="all, delete-orphan")
    password_resets = relationship("PasswordReset", back_populates="user", cascade="all, delete-orphan")


class PasswordReset(Base):
    __tablename__ = "password_resets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    
    # Relación
    user = relationship("User", back_populates="password_resets")


class Compra(Base):
    __tablename__ = "compras"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total = Column(Float, nullable=False)
    estado = Column(String(50), default="Pendiente")  # Pendiente, Completado, Cancelado
    metodo_pago = Column(String(50), nullable=True)  # Tarjeta, Efectivo, Transferencia
    comprobante_url = Column(String(300), nullable=True)  # URL del comprobante subido
    factura_url = Column(String(300), nullable=True)  # URL de la factura PDF
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relaciones
    user = relationship("User", back_populates="compras")
    productos = relationship("ProductoCompra", back_populates="compra", cascade="all, delete-orphan")


class ProductoCompra(Base):
    __tablename__ = "productos_compra"
    
    id = Column(Integer, primary_key=True, index=True)
    compra_id = Column(Integer, ForeignKey("compras.id"), nullable=False)
    nombre = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    cantidad = Column(Integer, default=1)
    precio_unitario = Column(Float, nullable=False)
    precio_total = Column(Float, nullable=False)
    
    # Relación
    compra = relationship("Compra", back_populates="productos")