from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database - always use SQLite for this app
    SQLITE_DATABASE_URL: str = "sqlite:///./cbtis258.db"

    @property
    def DATABASE_URL(self) -> str:
        return self.SQLITE_DATABASE_URL

    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 días
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5000"
    
    # Email
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    
    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None

    # Admin whitelist (correos separados por coma)
    ADMIN_EMAILS: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        # Ignore extra env vars from Replit environment
        extra = "ignore"

settings = Settings()