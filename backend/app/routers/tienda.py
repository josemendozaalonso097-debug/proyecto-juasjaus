from fastapi import APIRouter

router = APIRouter(
    prefix="/tienda",
    tags=["Tienda"]
)

@router.get("/ping")
async def ping():
    """Ruta de prueba para verificar que el router funciona"""
    return {
        "success": True,
        "message": "🛒 Router de tienda funcionando",
        "router": "tienda"
    }

# Aquí irán las rutas de:
# - GET /productos (listar productos)
# - GET /productos/{id} (detalle de producto)
# - POST /carrito (agregar al carrito)
# - GET /carrito (ver carrito)
# - POST /checkout (procesar compra)