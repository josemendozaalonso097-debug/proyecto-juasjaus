from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String, Text
from ..database import Base


class InstitutionRequest(Base):
    __tablename__ = "institution_requests"

    id = Column(Integer, primary_key=True, index=True)
    school_name = Column(String(200), nullable=False, index=True)
    contact_name = Column(String(120), nullable=False)
    contact_role = Column(String(100), nullable=False)
    contact_email = Column(String(254), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    municipality = Column(String(100), nullable=True)
    postal_code = Column(String(10), nullable=True)
    requested_modules = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="Pendiente", server_default="Pendiente", index=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_note = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("ix_institution_request_school_state", "school_name", "state"),
    )
