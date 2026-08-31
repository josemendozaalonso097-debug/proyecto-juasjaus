import json
import secrets
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models.oxxo import OxxoPayment
from ..models.user import User

router = APIRouter(prefix="/oxxo", tags=["OXXO Pay"])

CODE_TTL_HOURS = 1


class OxxoItem(BaseModel):
    nombre: str
    precio: float = Field(gt=0)
    cantidad: int = Field(default=1, ge=1)
    tallaSeleccionada: Optional[str] = None


class OxxoCreate(BaseModel):
    total: float = Field(gt=0)
    mode: str = Field(default="tienda", pattern="^(tienda|principal)$")
    productos: List[OxxoItem] = Field(min_length=1)


def cleanup_expired(db: Session):
    """Remove only unpaid expired codes; completed payments remain in history."""
    db.query(OxxoPayment).filter(
        OxxoPayment.estado == "Pendiente",
        OxxoPayment.expires_at <= datetime.utcnow(),
    ).delete(synchronize_session=False)
    db.commit()


def serialize_payment(payment: OxxoPayment, include_user=False):
    result = {
        "id": payment.id,
        "code": payment.code,
        "total": payment.total,
        "mode": payment.mode,
        "productos": json.loads(payment.items_json),
        "estado": payment.estado,
        "expires_at": payment.expires_at,
        "created_at": payment.created_at,
        "paid_at": payment.paid_at,
    }
    if include_user and payment.user:
        result["user"] = {
            "id": payment.user.id,
            "nombre": payment.user.nombre,
            "email": payment.user.email,
        }
    return result


def generate_unique_code(db: Session) -> str:
    for _ in range(10):
        code = "".join(secrets.choice("0123456789") for _ in range(18))
        if not db.query(OxxoPayment).filter(OxxoPayment.code == code).first():
            return code
    raise HTTPException(status_code=500, detail="No se pudo generar un código único")


@router.post("/payments", status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: OxxoCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cleanup_expired(db)

    calculated_total = sum(item.precio * item.cantidad for item in data.productos)
    if abs(calculated_total - data.total) > 0.01:
        raise HTTPException(status_code=400, detail="El total del pago no coincide con sus productos")

    payment = OxxoPayment(
        user_id=user.id,
        code=generate_unique_code(db),
        total=round(data.total, 2),
        mode=data.mode,
        items_json=json.dumps([item.model_dump() for item in data.productos], ensure_ascii=False),
        estado="Pendiente",
        expires_at=datetime.utcnow() + timedelta(hours=CODE_TTL_HOURS),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return serialize_payment(payment)


@router.get("/payments/mine")
async def get_my_payments(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cleanup_expired(db)
    payments = db.query(OxxoPayment).filter(
        OxxoPayment.user_id == user.id
    ).order_by(OxxoPayment.created_at.desc()).all()
    return [serialize_payment(payment) for payment in payments]


@router.post("/admin/scan")
async def scan_payment(
    payload: dict,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_user),
):
    if admin.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden confirmar pagos",
        )

    code = str(payload.get("code", "")).strip()
    if not code:
        raise HTTPException(status_code=400, detail="Código vacío")

    cleanup_expired(db)
    payment = db.query(OxxoPayment).filter(OxxoPayment.code == code).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Código no encontrado o expirado")
    if payment.estado == "Completado":
        return {
            "already_completed": True,
            "message": "Este pago ya estaba confirmado",
            "payment": serialize_payment(payment, include_user=True),
        }
    if payment.estado != "Pendiente":
        raise HTTPException(status_code=400, detail="El pago no está pendiente")

    payment.estado = "Completado"
    payment.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(payment)
    return {
        "already_completed": False,
        "message": "Pago confirmado correctamente",
        "payment": serialize_payment(payment, include_user=True),
    }