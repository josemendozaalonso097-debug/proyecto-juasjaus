import json
import re
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models.site_customization import SiteCustomization
from ..models.user import User

router = APIRouter(prefix="/customization", tags=["Personalización"])
SURFACES = {"cbtis", "finanzas", "login"}
_ALLOWED_SECTIONS = {"pagos", "eventos", "tienda", "tramites", "seguimiento", "orientacion"}
_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")
_IMAGE_DATA_RE = re.compile(r"^data:image/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$")


class CustomizationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=80)
    tagline: str = Field(default="", max_length=120)
    description: str = Field(default="", max_length=240)
    logoUrl: str = Field(default="", max_length=1_500_000)
    heroImageUrl: str = Field(default="", max_length=1_500_000)
    catalogImageUrl: str = Field(default="", max_length=1_500_000)
    primaryColor: str = Field(default="#f20d0d", max_length=7)
    secondaryColor: str = Field(default="#6e0404", max_length=7)
    backgroundColor: str = Field(default="#f8f5f5", max_length=7)
    colorStyle: Literal["gradient", "solid", "mesh"] = "gradient"
    sections: list[str] = Field(default_factory=list, max_length=6)

    @field_validator("title", "tagline", "description")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("primaryColor", "secondaryColor", "backgroundColor")
    @classmethod
    def validate_color(cls, value: str) -> str:
        if not _COLOR_RE.fullmatch(value):
            raise ValueError("El color debe usar formato hexadecimal, por ejemplo #f20d0d")
        return value.lower()

    @field_validator("logoUrl", "heroImageUrl", "catalogImageUrl")
    @classmethod
    def validate_image(cls, value: str) -> str:
        value = value.strip()
        if not value:
            return value
        if value.startswith("/") and not value.startswith("//"):
            return value
        if _IMAGE_DATA_RE.fullmatch(value):
            return value
        if value.startswith("https://") or value.startswith("http://"):
            return value
        raise ValueError("Usa una ruta local, una URL http(s) o una imagen PNG/JPG/WebP/GIF")

    @field_validator("sections")
    @classmethod
    def validate_sections(cls, value: list[str]) -> list[str]:
        unknown = set(value) - _ALLOWED_SECTIONS
        if unknown:
            raise ValueError("La personalización contiene secciones no permitidas")
        return list(dict.fromkeys(value))


DEFAULTS = {
    "cbtis": {
        "title": "CBTis 258", "tagline": "Un motivo de orgullo", "description": "Portal escolar",
        "logoUrl": "/imgs/yameharte.png", "heroImageUrl": "/imgs/banner_mobile_new.jpg",
        "catalogImageUrl": "",
        "primaryColor": "#f20d0d", "secondaryColor": "#6e0404", "backgroundColor": "#f8f5f5",
        "colorStyle": "gradient", "sections": ["pagos", "eventos", "tienda", "tramites", "seguimiento", "orientacion"],
    },
    "finanzas": {
        "title": "Financieros", "tagline": "Servicios escolares y pagos", "description": "Adquiere productos escolares o realiza tus trámites.",
        "logoUrl": "/imgs/yameharte.png", "heroImageUrl": "",
        "catalogImageUrl": "",
        "primaryColor": "#7c3aed", "secondaryColor": "#4338ca", "backgroundColor": "#f5f3ff",
        "colorStyle": "gradient", "sections": ["seguimiento", "tramites", "orientacion", "tienda"],
    },
    "login": {
        "title": "CBTis 258", "tagline": "Un motivo de orgullo", "description": "Accede a tu cuenta institucional",
        "logoUrl": "/imgs/yameharte.png", "heroImageUrl": "/imgs/banner_mobile_new.jpg",
        "catalogImageUrl": "",
        "primaryColor": "#f20d0d", "secondaryColor": "#6e0404", "backgroundColor": "#f8f5f5",
        "colorStyle": "gradient", "sections": [],
    },
}


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo los administradores pueden cambiar la personalización")
    return current_user


def _surface_or_404(surface: str) -> str:
    if surface not in SURFACES:
        raise HTTPException(status_code=404, detail="Sección de personalización no encontrada")
    return surface


@router.get("/{surface}")
async def get_customization(surface: str, db: Session = Depends(get_db)):
    surface = _surface_or_404(surface)
    row = db.query(SiteCustomization).filter(SiteCustomization.surface == surface).first()
    if not row:
        return DEFAULTS[surface]
    try:
        saved = json.loads(row.config_json)
    except (TypeError, json.JSONDecodeError):
        return DEFAULTS[surface]
    return {**DEFAULTS[surface], **saved}


@router.put("/{surface}")
async def save_customization(
    surface: str,
    payload: CustomizationPayload,
    db: Session = Depends(get_db),
    admin: User = Depends(_require_admin),
):
    surface = _surface_or_404(surface)
    data = payload.model_dump()
    row = db.query(SiteCustomization).filter(SiteCustomization.surface == surface).first()
    if row:
        row.config_json = json.dumps(data, ensure_ascii=False)
    else:
        row = SiteCustomization(surface=surface, config_json=json.dumps(data, ensure_ascii=False))
        db.add(row)
    db.commit()
    return data
