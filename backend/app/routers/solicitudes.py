import json
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models.solicitud import Solicitud
from ..models.user import User

router = APIRouter(prefix="/solicitudes", tags=["Solicitudes"])


class SolicitudCreate(BaseModel):
    tipo: str = Field(min_length=2, max_length=30)
    titulo: str = Field(min_length=2, max_length=200)
    detalle: Optional[str] = None
    archivos: List[str] = Field(default_factory=list)


class SolicitudUpdate(BaseModel):
    estado: str = Field(min_length=2, max_length=40)
    nota_admin: Optional[str] = None


def serialize_solicitud(item: Solicitud, include_user=False):
    result = {
        "id": item.id,
        "folio": f"CBT-{item.created_at.strftime('%Y%m%d')}-{item.id:04d}" if item.created_at else f"CBT-{item.id:04d}",
        "tipo": item.tipo,
        "titulo": item.titulo,
        "detalle": item.detalle,
        "archivos": json.loads(item.archivos or "[]"),
        "estado": item.estado,
        "nota_admin": item.nota_admin,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }
    if include_user and item.user:
        result["usuario"] = {
            "id": item.user.id,
            "nombre": item.user.nombre,
            "email": item.user.email,
            "rol": item.user.rol,
        }
    return result


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo los administradores pueden realizar esta acción")
    return current_user


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_solicitud(
    data: SolicitudCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    solicitud = Solicitud(
        user_id=user.id,
        tipo=data.tipo.strip().lower(),
        titulo=data.titulo.strip(),
        detalle=data.detalle.strip() if data.detalle else None,
        archivos=json.dumps(data.archivos, ensure_ascii=False),
        estado="Enviada",
    )
    db.add(solicitud)
    db.commit()
    db.refresh(solicitud)
    return serialize_solicitud(solicitud)


@router.get("/mine")
async def get_my_solicitudes(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    solicitudes = db.query(Solicitud).filter(
        Solicitud.user_id == user.id
    ).order_by(Solicitud.created_at.desc()).all()
    return [serialize_solicitud(item) for item in solicitudes]


@router.get("/admin")
async def get_admin_solicitudes(
    estado: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(Solicitud)
    if estado:
        query = query.filter(Solicitud.estado == estado)
    solicitudes = query.order_by(Solicitud.created_at.desc()).all()
    return [serialize_solicitud(item, include_user=True) for item in solicitudes]


@router.put("/admin/{solicitud_id}")
async def update_solicitud(
    solicitud_id: int,
    data: SolicitudUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    solicitud = db.query(Solicitud).filter(Solicitud.id == solicitud_id).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    solicitud.estado = data.estado.strip()
    solicitud.nota_admin = data.nota_admin.strip() if data.nota_admin else None
    solicitud.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(solicitud)
    return serialize_solicitud(solicitud, include_user=True)