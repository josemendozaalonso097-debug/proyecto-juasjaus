from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .database_otp import init_otp_db
from .routers import auth, index, tienda
import logging
from logging.handlers import RotatingFileHandler

# ============================================
# CONFIGURACIÓN DE LOGGING
# ============================================
log_formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
file_handler = RotatingFileHandler("backend.log", maxBytes=5*1024*1024, backupCount=3, encoding="utf-8")
file_handler.setFormatter(log_formatter)

console_handler = logging.StreamHandler()
console_handler.setFormatter(log_formatter)

logging.basicConfig(level=logging.INFO, handlers=[file_handler, console_handler])
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="CBTis 258 - Sistema Financiero",
    description="API para gestión de pagos y tienda escolar",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuraremos los orígenes permitidos
origins = [
    settings.FRONTEND_URL,
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "http://localhost:5173",  # Puerto por defecto de Vite
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# ============================================
# REGISTRAR ROUTERS
# ============================================
from .models import user

app.include_router(auth.router, prefix="/api")
app.include_router(index.router, prefix="/api")
app.include_router(tienda.router, prefix="/api")

# ============================================
# EVENTOS DE INICIO Y CIERRE
# ============================================
@app.on_event("startup")
async def startup_event():
    """Se ejecuta al iniciar el servidor"""
    logger.info("="*60)
    logger.info("🚀 FASTAPI SERVER STARTING")
    logger.info("="*60)
    
    # Inicializar base de datos
    init_db()
    init_otp_db()
    
    logger.info(f"📍 API URL: http://localhost:8000")
    logger.info(f"📚 Docs: http://localhost:8000/docs")
    logger.info(f"🌐 Frontend: {settings.FRONTEND_URL}")
    logger.info(f"🔐 CORS configurado de forma segura.")
    logger.info("="*60)

@app.on_event("shutdown")
async def shutdown_event():
    """Se ejecuta al cerrar el servidor"""
    logger.info("👋 Servidor cerrado correctamente")

# ============================================
# RUTA RAÍZ
# ============================================
@app.get("/")
async def root():
    """Ruta raíz de la API"""
    return {
        "message": "CBTis 258 - API FastAPI",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth/ping",
            "dashboard": "/api/dashboard/ping",
            "tienda": "/api/tienda/ping"
        }
    }

@app.get("/api/test")
async def test():
    """Ruta de prueba"""
    return {
        "success": True,
        "message": "✅ API funcionando correctamente"
    }

# Health check
@app.get("/health")
async def health_check():
    """Verificar estado del servidor"""
    return {
        "status": "healthy",
        "message": "Server is running"
    }