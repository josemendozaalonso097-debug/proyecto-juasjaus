from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ..database import get_db
from ..models.user import User, Deuda
from ..models.producto import Producto
from ..dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="Solo los administradores pueden realizar esta acción")
    return current_user


# ── Estadísticas ──────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    total_usuarios = db.query(func.count(User.id)).scalar() or 0
    usuarios_activos = db.query(func.count(User.id)).filter(User.activo == True).scalar() or 0
    total_productos = db.query(func.count(Producto.id)).filter(Producto.activo == True).scalar() or 0
    total_productos_todos = db.query(func.count(Producto.id)).scalar() or 0
    deudas_pendientes = db.query(func.count(Deuda.id)).filter(Deuda.estado == "Pendiente").scalar() or 0
    monto_deudas = db.query(func.sum(Deuda.monto)).filter(Deuda.estado == "Pendiente").scalar() or 0

    por_semestre_raw = db.query(User.semestre, func.count(User.id)).group_by(User.semestre).all()
    por_semestre = [{"semestre": s or "N/A", "count": c} for s, c in por_semestre_raw]

    por_rol_raw = db.query(User.rol, func.count(User.id)).group_by(User.rol).all()
    por_rol = [{"rol": r, "count": c} for r, c in por_rol_raw]

    categorias_raw = db.query(Producto.categoria, func.count(Producto.id)).filter(
        Producto.activo == True).group_by(Producto.categoria).all()
    por_categoria = [{"categoria": cat, "count": c} for cat, c in categorias_raw]

    return {
        "total_usuarios": total_usuarios,
        "usuarios_activos": usuarios_activos,
        "total_productos": total_productos,
        "total_productos_todos": total_productos_todos,
        "deudas_pendientes": deudas_pendientes,
        "monto_deudas_pendientes": float(monto_deudas),
        "usuarios_por_semestre": por_semestre,
        "usuarios_por_rol": por_rol,
        "productos_por_categoria": por_categoria,
    }


# ── Usuarios ──────────────────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    rol: Optional[str] = None
    activo: Optional[bool] = None
    semestre: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    nombre: str
    email: str
    rol: str
    activo: bool
    semestre: Optional[str] = None
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


@router.get("/usuarios", response_model=List[UserResponse])
async def get_usuarios(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    q = db.query(User)
    if search:
        q = q.filter((User.nombre.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))
    return q.order_by(User.created_at.desc()).all()


@router.put("/usuarios/{user_id}", response_model=UserResponse)
async def update_usuario(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(u, field, value)
    db.commit()
    db.refresh(u)
    return u


@router.delete("/usuarios/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if u.rol == "admin":
        raise HTTPException(status_code=400, detail="No puedes eliminar a un administrador")
    db.delete(u)
    db.commit()


# ── Deudas ────────────────────────────────────────────────────────────────────

class DeudaCreate(BaseModel):
    user_id: int
    concepto: str
    monto: float
    fecha_vencimiento: Optional[datetime] = None


class DeudaUpdate(BaseModel):
    estado: Optional[str] = None
    concepto: Optional[str] = None
    monto: Optional[float] = None


@router.get("/deudas")
async def get_deudas(
    estado: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    q = db.query(Deuda)
    if estado:
        q = q.filter(Deuda.estado == estado)
    deudas = q.order_by(Deuda.created_at.desc()).all()
    result = []
    for d in deudas:
        result.append({
            "id": d.id,
            "user_id": d.user_id,
            "concepto": d.concepto,
            "monto": d.monto,
            "estado": d.estado,
            "fecha_vencimiento": d.fecha_vencimiento,
            "created_at": d.created_at,
            "user_nombre": d.user.nombre if d.user else "Desconocido",
            "user_email": d.user.email if d.user else "",
        })
    return result


@router.post("/deudas", status_code=status.HTTP_201_CREATED)
async def create_deuda(
    data: DeudaCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    u = db.query(User).filter(User.id == data.user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    deuda = Deuda(**data.model_dump())
    db.add(deuda)
    db.commit()
    db.refresh(deuda)
    return {
        "id": deuda.id,
        "user_id": deuda.user_id,
        "concepto": deuda.concepto,
        "monto": deuda.monto,
        "estado": deuda.estado,
        "created_at": deuda.created_at,
        "user_nombre": u.nombre,
        "user_email": u.email,
    }


@router.put("/deudas/{deuda_id}")
async def update_deuda(
    deuda_id: int,
    data: DeudaUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    d = db.query(Deuda).filter(Deuda.id == deuda_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(d, field, value)
    db.commit()
    db.refresh(d)
    return {"id": d.id, "estado": d.estado, "concepto": d.concepto, "monto": d.monto}


@router.delete("/deudas/{deuda_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_deuda(
    deuda_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    d = db.query(Deuda).filter(Deuda.id == deuda_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    db.delete(d)
    db.commit()


# ── Inventario ────────────────────────────────────────────────────────────────

class StockUpdate(BaseModel):
    stock: int


@router.get("/inventario")
async def get_inventario(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    productos = db.query(Producto).order_by(Producto.categoria, Producto.nombre).all()
    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "categoria": p.categoria,
            "precio": p.precio,
            "stock": p.stock,
            "activo": p.activo,
        }
        for p in productos
    ]


@router.put("/inventario/{producto_id}/stock")
async def update_stock(
    producto_id: int,
    data: StockUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    p = db.query(Producto).filter(Producto.id == producto_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    p.stock = data.stock
    db.commit()
    return {"id": p.id, "nombre": p.nombre, "stock": p.stock}


# ── Notificaciones ────────────────────────────────────────────────────────────

class NotificacionCreate(BaseModel):
    titulo: str
    mensaje: str
    destinatarios: str = "todos"


@router.post("/notificaciones", status_code=status.HTTP_201_CREATED)
async def crear_notificacion(
    data: NotificacionCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    q = db.query(User).filter(User.activo == True)
    if data.destinatarios == "alumnos":
        q = q.filter(User.rol == "alumno")
    elif data.destinatarios == "admin":
        q = q.filter(User.rol == "admin")
    usuarios = q.all()
    return {
        "success": True,
        "mensaje": f"Notificación registrada para {len(usuarios)} usuarios",
        "destinatarios_count": len(usuarios),
        "titulo": data.titulo,
    }
