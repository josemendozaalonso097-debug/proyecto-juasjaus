from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- ESQUEMAS PARA PRODUCTOS ---
class ProductoCompraSchema(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    cantidad: int = 1
    precio_unitario: float
    precio_total: float

# --- MODELO DE USUARIO ---
class User(BaseModel):
    nombre: str
    email: EmailStr
    password_hash: Optional[str] = None
    google_id: Optional[str] = None
    profile_picture: Optional[str] = None
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    role: str = "alumno"  # Para lo que pidió el profe
    saldo: float = 0.0

# --- MODELO DE CONTRASEÑA/OTP ---
class PasswordReset(BaseModel):
    user_email: str
    token: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    used: bool = False

# --- MODELO DE COMPRA (Lo más importante) ---
class Compra(BaseModel):
    user_id: str  # Aquí guardaremos el ID del usuario como string
    total: float
    estado: str = "Pendiente"
    metodo_pago: Optional[str] = None
    comprobante_url: Optional[str] = None
    factura_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # En Mongo, los productos van AQUÍ ADENTRO directamente
    productos: List[ProductoCompraSchema] = []