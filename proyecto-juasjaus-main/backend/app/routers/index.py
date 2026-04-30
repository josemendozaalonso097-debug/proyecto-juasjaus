from fastapi import APIRouter

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/ping")
async def ping():
    """Ruta de prueba para verificar que el router funciona"""
    return {
        "success": True,
        "message": "🏠 Router de dashboard funcionando",
        "router": "dashboard"
    }

# Aquí irán las rutas de:
# - GET /stats (estadísticas del usuario)
# - GET /payments (historial de pagos)
# - POST /payment (procesar pago)