from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from ..database import get_db
from ..models.evento import Evento
from ..models.user import User
from ..dependencies import get_current_user

router = APIRouter(prefix="/eventos", tags=["Eventos"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class EventoCreate(BaseModel):
    titulo: str
    fecha: str
    descripcion: Optional[str] = None

class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    fecha: Optional[str] = None
    descripcion: Optional[str] = None

class EventoResponse(BaseModel):
    id: int
    titulo: str
    fecha: str
    descripcion: Optional[str]
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ── Helper: verificar admin ───────────────────────────────────────────────────

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden realizar esta acción"
        )
    return current_user


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=List[EventoResponse])
async def get_eventos(db: Session = Depends(get_db)):
    """Obtener todos los eventos (público)"""
    eventos = db.query(Evento).order_by(Evento.created_at.desc()).all()
    return eventos


@router.post("", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
async def create_evento(
    data: EventoCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Crear un nuevo evento (solo admin)"""
    evento = Evento(
        titulo=data.titulo,
        fecha=data.fecha,
        descripcion=data.descripcion,
        created_by=admin.id
    )
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento


@router.put("/{evento_id}", response_model=EventoResponse)
async def update_evento(
    evento_id: int,
    data: EventoUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Editar un evento (solo admin)"""
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if data.titulo is not None:
        evento.titulo = data.titulo
    if data.fecha is not None:
        evento.fecha = data.fecha
    if data.descripcion is not None:
        evento.descripcion = data.descripcion
    evento.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(evento)
    return evento


@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Eliminar un evento (solo admin)"""
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    db.delete(evento)
    db.commit()
