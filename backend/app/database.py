from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Crear engine de SQLAlchemy
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if _is_sqlite else {}
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
    Crea todas las tablas definidas en los modelos y aplica migraciones pendientes
    """
    Base.metadata.create_all(bind=engine)
    # Migración: agregar columna rol si no existe (para BDs existentes)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'alumno'"))
            conn.commit()
            print("✅ Migración: columna 'rol' agregada a users")
        except Exception:
            pass  # La columna ya existe

    # Migración: crear tabla eventos si no existe
    with engine.connect() as conn:
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS eventos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    titulo VARCHAR(200) NOT NULL,
                    fecha VARCHAR(50) NOT NULL,
                    descripcion TEXT,
                    created_by INTEGER NOT NULL REFERENCES users(id),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✅ Tabla 'eventos' verificada/creada")
        except Exception as e:
            print(f"Info tabla eventos: {e}")

    print("✅ Base de datos inicializada")