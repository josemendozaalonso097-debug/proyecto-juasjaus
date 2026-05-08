from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

# 1. Creamos el cliente de MongoDB usando la URL de tu .env
# La URL ahora debe empezar con mongodb:// o mongodb+srv://
client = AsyncIOMotorClient(settings.DATABASE_URL)

# 2. Seleccionamos la base de datos (puedes ponerle el nombre que quieras)
db = client.cbtis258_db

# Dependency para obtener la base de datos en las rutas
def get_db():
    """
    Retorna la instancia de la base de datos.
    En MongoDB asíncrono, no es necesario abrir/cerrar sesiones como en SQLite.
    """
    return db

# Función para inicializar (Opcional en Mongo)
async def init_db():
    """
    En MongoDB las colecciones se crean solas al insertar el primer dato.
    Podemos usar esto para verificar la conexión.
    """
    try:
        await client.admin.command('ping')
        print("✅ Conexión exitosa a MongoDB")
    except Exception as e:
        print(f"❌ Error conectando a MongoDB: {e}")