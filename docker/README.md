Docker setup (opcional)

Archivos añadidos:
- `backend/Dockerfile` — imagen con Python 3.11, instala dependencias y ejecuta `run_no_reload.py`.
- `frontend-react/Dockerfile` — multi-stage: build con Node y servir `dist` con nginx.
- `docker-compose.yml` — levanta `backend` y `frontend` (mapea 8000 y 5502).
- `docker-compose.override.yml` — override para desarrollo: monta código como volumen y arranca `uvicorn --reload` y `vite dev` dentro de los contenedores.
- `.dockerignore` — evita copiar node_modules, venvs y archivos .env al contexto.

Comandos rápidos (desarrollo con override):

```bash
# Build y up (produce imágenes y arranca)
docker-compose up --build

# Con override (monta código y usa hot-reload) simplemente:
docker-compose up

# Parar y limpiar
docker-compose down --rmi local
```

Notas:
- El `docker-compose.yml` usa `backend/.env` si existe para inyectar `SECRET_KEY`. No subas ese fichero.
- Si usas SQLite, monta `backend/` como volumen para persistir la base de datos, o adapta para Postgres y define un servicio `db` en `docker-compose.yml`.
- En Windows, el rendimiento de los mounts puede ser lento; si detectas problemas considera usar `docker-sync` o desarrollar sin montar (build/restart).
