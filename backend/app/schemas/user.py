from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ============================================
# SCHEMAS DE USUARIO
# ============================================

class UserRegister(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLogin(BaseModel):
    token: str

class UserResponse(BaseModel):
    id: int
    nombre: str
    email: str
    profile_picture: Optional[str] = None
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ============================================
# SCHEMAS DE RECUPERACIÓN DE CONTRASEÑA
# ============================================

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    password: str = Field(..., min_length=6)

# ============================================
# SCHEMAS DE COMPRA
# ============================================

class ProductoCompraCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    cantidad: int = 1
    precio_unitario: float

class ProductoCompraResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]
    cantidad: int
    precio_unitario: float
    precio_total: float
    
    class Config:
        from_attributes = True

class CompraCreate(BaseModel):
    productos: List[ProductoCompraCreate]
    metodo_pago: Optional[str] = "Tarjeta"
    comprobante_url: Optional[str] = None

class CompraResponse(BaseModel):
    id: int
    total: float
    estado: str
    metodo_pago: Optional[str]
    comprobante_url: Optional[str]
    factura_url: Optional[str]
    created_at: datetime
    productos: List[ProductoCompraResponse]
    
    class Config:
        from_attributes = True

class CompraUpdateEstado(BaseModel):
    estado: str = Field(..., pattern="^(Pendiente|Completado|Cancelado)$")