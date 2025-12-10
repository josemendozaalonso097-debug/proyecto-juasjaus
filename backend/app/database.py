from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Crear engine de SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Solo para SQLite
)

# Crear SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# Dependency para obtener la sesión de BD
def get_db():
    """
    Genera una sesión de base de datos y la cierra automáticamente
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Función para inicializar las tablas
def init_db():
    """
    Crea todas las tablas definidas en los modelos
    """
    Base.metadata.create_all(bind=engine)
    print("✅ Base de datos inicializada")