from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Always use SQLite for this application
_db_url = settings.SQLITE_DATABASE_URL
engine = create_engine(
    _db_url,
    connect_args={"check_same_thread": False}
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

    # Migración: crear tabla productos si no existe + seed inicial
    with engine.connect() as conn:
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS productos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre VARCHAR(200) NOT NULL,
                    marca VARCHAR(100),
                    precio REAL NOT NULL,
                    categoria VARCHAR(50) NOT NULL,
                    imagen TEXT,
                    tallas BOOLEAN DEFAULT 0,
                    semestre BOOLEAN DEFAULT 0,
                    activo BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✅ Tabla 'productos' verificada/creada")
        except Exception as e:
            print(f"Info tabla productos: {e}")

    # Seed productos si la tabla está vacía
    with engine.connect() as conn:
        count = conn.execute(text("SELECT COUNT(*) FROM productos")).scalar()
        if count == 0:
            seed = [
                ("Playera Blanca", "CBTis 258", 350, "uniformes", "/imagenesTienda/BackgroundEraser_20251206_214733074.png", 1, 0),
                ("Playera Gris", "CBTis 258", 350, "uniformes", "/imagenesTienda/BackgroundEraser_20251216_161735342.png", 1, 0),
                ("Playera Deportiva", "CBTis 258", 280, "uniformes", "/imagenesTienda/BackgroundEraser_20251216_161748179.png", 1, 0),
                ("Paquete completo", "CBTis 258", 600, "uniformes", "/imagenesTienda/cvtis.png", 1, 0),
                ("Credencial", "Credencial", 100, "uniformes", "/imagenesTienda/IMG-20251216-WA0024.jpg", 0, 0),
                ("Pensamiento matematico", "Libro", 90, "Libros", "/imagenesTienda/6475884.png", 0, 1),
                ("Lengua y comunicacion", "Libro", 200, "Libros", "/imagenesTienda/6475884.png", 0, 1),
                ("Humanidades", "Libro", 100, "Libros", "/imagenesTienda/6475884.png", 0, 1),
                ("Socio emocional", "Libro", 90, "Libros", "/imagenesTienda/6475884.png", 0, 1),
                ("Ingles", "Libro", 90, "Libros", "/imagenesTienda/6475884.png", 0, 1),
                ("Sociales", "Libro", 100, "Libros", "/imagenesTienda/6475884.png", 0, 1),
                ("Conservacion de la energia", "Libro 2do", 140, "Libros", "/imagenesTienda/6475884.png", 0, 0),
                ("La materia y sus interacciones", "Libro 1ro", 150, "Libros", "/imagenesTienda/6475884.png", 0, 0),
                ("Ecosistemas", "Libro 3ro", 150, "Libros", "/imagenesTienda/6475884.png", 0, 0),
                ("Conciencia historica", "Libros 4to y 5to", 200, "Libros", "/imagenesTienda/6475884.png", 0, 1),
                ("Reacciones quimicas", "Libro 4to", 200, "Libros", "/imagenesTienda/6475884.png", 0, 0),
                ("Temas selectos de matematicas", "Libro 4to y 5to", 200, "Libros", "/imagenesTienda/6475884.png", 0, 1),
                ("La energia en los procesos de la vida diaria", "Libro 5to", 170, "Libros", "/imagenesTienda/6475884.png", 0, 0),
                ("Temas de filosofia", "Libro 6to", 160, "Libros", "/imagenesTienda/6475884.png", 0, 0),
                ("Certificado", "Documento", 150, "tramites", "/imagenesTienda/f71decb4816cd27d4460d37b314d2fbf-documento-de-grafico-plano.png", 0, 0),
                ("Constancia", "Documento", 50, "tramites", "/imagenesTienda/f71decb4816cd27d4460d37b314d2fbf-documento-de-grafico-plano.png", 0, 0),
                ("Cardex", "Documento", 30, "tramites", "/imagenesTienda/f71decb4816cd27d4460d37b314d2fbf-documento-de-grafico-plano.png", 0, 0),
                ("Colegiatura", "Documento", 3000, "tramites", "/imagenesTienda/f71decb4816cd27d4460d37b314d2fbf-documento-de-grafico-plano.png", 0, 0),
            ]
            for nombre, marca, precio, categoria, imagen, tallas, semestre in seed:
                conn.execute(text("""
                    INSERT INTO productos (nombre, marca, precio, categoria, imagen, tallas, semestre, activo)
                    VALUES (:nombre, :marca, :precio, :categoria, :imagen, :tallas, :semestre, 1)
                """), {"nombre": nombre, "marca": marca, "precio": precio,
                       "categoria": categoria, "imagen": imagen,
                       "tallas": tallas, "semestre": semestre})
            conn.commit()
            print(f"✅ Seed: {len(seed)} productos insertados")

    # Migración: agregar columnas a users si no existen
    for col_sql in [
        "ALTER TABLE users ADD COLUMN activo BOOLEAN NOT NULL DEFAULT 1",
        "ALTER TABLE users ADD COLUMN semestre VARCHAR(10) DEFAULT '1'",
    ]:
        with engine.connect() as conn:
            try:
                conn.execute(text(col_sql))
                conn.commit()
            except Exception:
                pass

    # Migración: agregar columna stock a productos
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE productos ADD COLUMN stock INTEGER NOT NULL DEFAULT 0"))
            conn.commit()
            print("✅ Migración: columna 'stock' agregada a productos")
        except Exception:
            pass

    # Migración: crear tabla deudas
    with engine.connect() as conn:
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS deudas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    concepto VARCHAR(200) NOT NULL,
                    monto REAL NOT NULL,
                    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
                    fecha_vencimiento DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """))
            conn.commit()
            print("✅ Tabla 'deudas' verificada/creada")
        except Exception as e:
            print(f"Info tabla deudas: {e}")

    print("✅ Base de datos inicializada")