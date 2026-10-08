from datetime import datetime
from html import escape
from typing import Optional
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..dependencies import get_current_user
from ..models.institution_request import InstitutionRequest
from ..models.user import User
from ..utils.email import send_email

router = APIRouter(prefix="/institution-requests", tags=["Solicitudes de instituciones"])
logger = logging.getLogger(__name__)


class InstitutionRequestCreate(BaseModel):
    school_name: str = Field(min_length=3, max_length=200)
    contact_name: str = Field(min_length=2, max_length=120)
    contact_role: str = Field(min_length=2, max_length=100)
    contact_email: EmailStr
    state: str = Field(min_length=2, max_length=100)
    municipality: Optional[str] = Field(default=None, max_length=100)
    postal_code: Optional[str] = Field(default=None, max_length=10)
    requested_modules: Optional[str] = Field(default=None, max_length=2000)
    website: Optional[str] = Field(default=None, max_length=300)


class InstitutionRequestReview(BaseModel):
    status: str = Field(min_length=2, max_length=30)
    review_note: Optional[str] = Field(default=None, max_length=2000)


def serialize_request(item: InstitutionRequest):
    return {
        "id": item.id,
        "school_name": item.school_name,
        "contact_name": item.contact_name,
        "contact_role": item.contact_role,
        "contact_email": item.contact_email,
        "state": item.state,
        "municipality": item.municipality,
        "postal_code": item.postal_code,
        "requested_modules": item.requested_modules,
        "status": item.status,
        "review_note": item.review_note,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }


def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden realizar esta acción",
        )
    return current_user


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_institution_request(data: InstitutionRequestCreate, db: Session = Depends(get_db)):
    """Receive a public school onboarding request without requiring an account."""
    if data.website:
        # Hidden honeypot: respond normally without storing obvious bot submissions.
        return {"message": "Solicitud recibida. El equipo administrador la revisará."}
    school_name = " ".join(data.school_name.split())
    contact_email = str(data.contact_email).strip().lower()
    duplicate = db.query(InstitutionRequest).filter(
        func.lower(InstitutionRequest.school_name) == school_name.lower(),
        func.lower(InstitutionRequest.state) == data.state.strip().lower(),
        func.lower(InstitutionRequest.contact_email) == contact_email,
        InstitutionRequest.status == "Pendiente",
    ).first()
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya recibimos una solicitud pendiente con esos datos de contacto.",
        )

    item = InstitutionRequest(
        school_name=school_name,
        contact_name=" ".join(data.contact_name.split()),
        contact_role=" ".join(data.contact_role.split()),
        contact_email=contact_email,
        state=" ".join(data.state.split()),
        municipality=" ".join(data.municipality.split()) if data.municipality else None,
        postal_code=data.postal_code.strip() if data.postal_code else None,
        requested_modules=data.requested_modules.strip() if data.requested_modules else None,
        status="Pendiente",
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    admin_emails = list(dict.fromkeys(
        email.strip().lower()
        for email in settings.ADMIN_EMAILS.split(",")
        if email.strip()
    ))
    if not admin_emails:
        admin_emails = list(dict.fromkeys(
            email.strip().lower()
            for (email,) in db.query(User.email).filter(
                User.rol == "admin",
                User.activo.is_(True),
            ).all()
            if email and email.strip()
        ))
    if admin_emails:
        school = escape(item.school_name)
        contact = escape(item.contact_name)
        email = escape(item.contact_email)
        place = escape(", ".join(part for part in [item.municipality, item.state] if part))
        email_body = (
            "<h2>Nueva solicitud de alta de institución</h2>"
            f"<p><b>Plantel:</b> {school}</p>"
            f"<p><b>Contacto:</b> {contact} ({escape(item.contact_role)})</p>"
            f"<p><b>Correo:</b> {email}</p>"
            f"<p><b>Ubicación:</b> {place}</p>"
            f"<p><b>Solicitud:</b> #{item.id}</p>"
            "<p>Ingresa al panel de administración para revisar y responder.</p>"
        )
        for recipient in admin_emails:
            try:
                email_sent = await send_email(
                    recipient,
                    "Nueva solicitud de alta de institución",
                    email_body,
                )
                if not email_sent:
                    logger.warning("No se pudo enviar por email el aviso de solicitud institucional #%s", item.id)
            except Exception:
                logger.exception("No se pudo enviar el aviso de solicitud institucional #%s", item.id)
    else:
        logger.warning("Solicitud institucional #%s recibida sin ADMIN_EMAILS configurado", item.id)

    return {
        **serialize_request(item),
        "message": "Solicitud recibida. El equipo administrador la revisará.",
    }


@router.get("/admin")
async def list_institution_requests(
    request_status: Optional[str] = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = db.query(InstitutionRequest)
    if request_status and request_status != "Todos":
        query = query.filter(InstitutionRequest.status == request_status)
    return [serialize_request(item) for item in query.order_by(InstitutionRequest.created_at.desc()).all()]


@router.put("/admin/{request_id}")
async def review_institution_request(
    request_id: int,
    data: InstitutionRequestReview,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    allowed_statuses = {"Pendiente", "En revisión", "Aprobada", "Rechazada"}
    new_status = data.status.strip()
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=422, detail="Estado de revisión no válido")
    item = db.query(InstitutionRequest).filter(InstitutionRequest.id == request_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Solicitud institucional no encontrada")
    item.status = new_status
    item.review_note = data.review_note.strip() if data.review_note else None
    item.reviewed_by = admin.id
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return serialize_request(item)
