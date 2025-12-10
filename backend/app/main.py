from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .routers import auth, index, tienda

# Crear aplicación FastAPI
app = FastAPI(
    title="CBTis 258 - Sistema Financiero",
    description="API para gestión de pagos y tienda escolar",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI en /docs
    redoc_url="/redoc"  # ReDoc en /redoc
)

# ============================================
# CONFIGURACIÓN DE CORS
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# REGISTRAR ROUTERS
# ============================================
app.include_router(auth.router, prefix="/api")
app.include_router(index.router, prefix="/api")
app.include_router(tienda.router, prefix="/api")

# ============================================
# EVENTOS DE INICIO Y CIERRE
# ============================================
@app.on_event("startup")
async def startup_event():
    """Se ejecuta al iniciar el servidor"""
    print("\n" + "="*60)
    print("🚀 FASTAPI SERVER STARTING")
    print("="*60)
    
    # Inicializar base de datos
    init_db()
    
    print(f"📍 API URL: http://localhost:8000")
    print(f"📚 Docs: http://localhost:8000/docs")
    print(f"🌐 Frontend: {settings.FRONTEND_URL}")
    print(f"🔐 CORS configurado correctamente")
    print("="*60 + "\n")

@app.on_event("shutdown")
async def shutdown_event():
    """Se ejecuta al cerrar el servidor"""
    print("\n👋 Servidor cerrado correctamente\n")

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