import secrets
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import Compra, ProductoCompra, User

router = APIRouter(prefix="/compras", tags=["Compras"])


class CompraItemCreate(BaseModel):
    nombre: str
    precio: float = Field(gt=0)
    cantidad: int = Field(default=1, ge=1)
    tallaSeleccionada: Optional[str] = None


class CompraCreate(BaseModel):
    productos: List[CompraItemCreate] = Field(min_length=1)
    metodo_pago: str = Field(min_length=2, max_length=50)


class CompraVerify(BaseModel):
    verification_id: str = Field(min_length=18, max_length=24, pattern=r"^\d+$")


def generate_verification_id(db: Session) -> str:
    for _ in range(20):
        value = "".join(secrets.choice("0123456789") for _ in range(18))
        if not db.query(Compra).filter(Compra.verification_id == value).first():
            return value
    raise HTTPException(status_code=500, detail="No se pudo generar el ID de compra")


def serialize_compra(compra: Compra, include_user=False):
    result = {
        "id": compra.id,
        "verification_id": compra.verification_id,
        "verification_used": bool(compra.verification_used),
        "total": compra.total,
        "estado": compra.estado,
        "metodo_pago": compra.metodo_pago,
        "created_at": compra.created_at.isoformat() if compra.created_at else None,
        "verified_at": compra.verified_at.isoformat() if compra.verified_at else None,
        "productos": [
            {
                "id": item.id,
                "nombre": item.nombre,
                "cantidad": item.cantidad,
                "precio": item.precio_unitario,
                "precio_unitario": item.precio_unitario,
                "precio_total": item.precio_total,
                "tallaSeleccionada": item.descripcion,
            }
            for item in compra.productos
        ],
    }
    if include_user and compra.user:
        result["usuario"] = {
            "id": compra.user.id,
            "nombre": compra.user.nombre,
            "email": compra.user.email,
            "rol": compra.user.rol,
            "semestre": compra.user.semestre,
        }
    return result


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_compra(
    data: CompraCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    total = round(sum(item.precio * item.cantidad for item in data.productos), 2)
    if total <= 0:
        raise HTTPException(status_code=400, detail="La compra debe tener un total válido")

    estado = "Completado" if data.metodo_pago in {"Tarjeta", "Tarjeta Bancaria"} else "Pendiente"
    compra = Compra(
        user_id=user.id,
        total=total,
        estado=estado,
        metodo_pago=data.metodo_pago,
        verification_id=generate_verification_id(db),
    )
    db.add(compra)
    db.flush()

    for item in data.productos:
        db.add(ProductoCompra(
            compra_id=compra.id,
            nombre=item.nombre,
            descripcion=item.tallaSeleccionada,
            cantidad=item.cantidad,
            precio_unitario=item.precio,
            precio_total=round(item.precio * item.cantidad, 2),
        ))

    db.commit()
    db.refresh(compra)
    return serialize_compra(compra)


@router.get("/mine")
async def get_my_compras(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    compras = db.query(Compra).filter(
        Compra.user_id == user.id
    ).order_by(Compra.created_at.desc()).all()
    return [serialize_compra(compra) for compra in compras]


@router.post("/admin/verify")
async def verify_compra(
    data: CompraVerify,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user),
):
    if admin.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden verificar compras",
        )

    compra = db.query(Compra).filter(
        Compra.verification_id == data.verification_id
    ).first()
    if not compra:
        raise HTTPException(status_code=404, detail="ID de compra no encontrado")

    # Atomic guard: once consumed, the same ID can never be accepted again.
    if compra.verification_used:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "already_used": True,
                "message": "Este ID de compra ya fue usado para una verificación.",
                "compra": serialize_compra(compra, include_user=True),
            },
        )

    verified_at = datetime.utcnow()
    updated = db.query(Compra).filter(
        Compra.id == compra.id,
        Compra.verification_used == False,
    ).update({
        Compra.verification_used: True,
        Compra.verified_at: verified_at,
        Compra.verified_by: admin.id,
    }, synchronize_session=False)
    if updated != 1:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "already_used": True,
                "message": "Este ID de compra ya fue usado para una verificación.",
            },
        )
    db.commit()
    db.refresh(compra)
    return {
        "already_used": False,
        "message": "Compra verificada correctamente",
        "compra": serialize_compra(compra, include_user=True),
    }