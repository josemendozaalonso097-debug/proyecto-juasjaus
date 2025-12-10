from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)

@router.get("/ping")
async def ping():
    """Ruta de prueba para verificar que el router funciona"""
    return {
        "success": True,
        "message": "🔐 Router de autenticación funcionando",
        "router": "auth"
    }

# Aquí irán las rutas de:
# - POST /register
# - POST /login
# - POST /logout
# - POST /forgot-password
# - POST /reset-password
# - GET /check-session