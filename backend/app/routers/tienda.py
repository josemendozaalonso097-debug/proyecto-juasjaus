from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..database import get_db
from ..models.producto import Producto
from ..models.user import User
from ..dependencies import get_current_user

router = APIRouter(prefix="/tienda", tags=["Tienda"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class ProductoCreate(BaseModel):
    nombre: str
    marca: Optional[str] = None
    precio: float
    categoria: str
    imagen: Optional[str] = None
    tallas: bool = False
    semestre: bool = False

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    marca: Optional[str] = None
    precio: Optional[float] = None
    categoria: Optional[str] = None
    imagen: Optional[str] = None
    tallas: Optional[bool] = None
    semestre: Optional[bool] = None
    activo: Optional[bool] = None

class ProductoResponse(BaseModel):
    id: int
    nombre: str
    marca: Optional[str]
    precio: float
    categoria: str
    imagen: Optional[str]
    tallas: bool
    semestre: bool
    activo: bool

    class Config:
        from_attributes = True


# ── Admin helper ──────────────────────────────────────────────────────────────

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Solo los administradores pueden realizar esta acción")
    return current_user


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/ping")
async def ping():
    return {"success": True, "message": "🛒 Router de tienda funcionando"}


@router.get("/productos", response_model=List[ProductoResponse])
async def get_productos(categoria: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Producto).filter(Producto.activo == True)
    if categoria:
        q = q.filter(Producto.categoria == categoria)
    return q.order_by(Producto.id).all()


@router.post("/productos", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
async def create_producto(
    data: ProductoCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    p = Producto(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.put("/productos/{producto_id}", response_model=ProductoResponse)
async def update_producto(
    producto_id: int,
    data: ProductoUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    p = db.query(Producto).filter(Producto.id == producto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/productos/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    p = db.query(Producto).filter(Producto.id == producto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    db.delete(p)
    db.commit()
