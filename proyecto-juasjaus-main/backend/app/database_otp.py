import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Determinar base dir (asumiendo que database_otp.py está en app/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OTP_DB_URL = f"sqlite:///{os.path.join(BASE_DIR, 'otp_codes.db')}"

# Crear engine de SQLAlchemy específico para OTP
engine_otp = create_engine(
    OTP_DB_URL, 
    connect_args={"check_same_thread": False}  # Solo para SQLite
)

# Crear SessionLocal específica para OTP
SessionLocalOTP = sessionmaker(autocommit=False, autoflush=False, bind=engine_otp)

# Base para los modelos OTP
BaseOTP = declarative_base()

# Dependency para obtener la sesión de BD de OTP
def get_otp_db():
    """
    Genera una sesión de la base de datos OTP y la cierra automáticamente
    """
    db = SessionLocalOTP()
    try:
        yield db
    finally:
        db.close()

# Función para inicializar la base de datos OTP
def init_otp_db():
    """
    Crea la tabla de OTPs
    """
    BaseOTP.metadata.create_all(bind=engine_otp)
    print("✅ Base de datos OTP (otp_codes.db) inicializada")
