# CBTis 258 - Servicios Financieros

Este README describe cómo arrancar el backend FastAPI y el frontend React/Vite en este repositorio.

## Estado actual del proyecto
- Backend: `backend/` usando FastAPI + Uvicorn.
- Frontend React: `frontend-react/` usando Vite.
- El script principal de arranque es `./run.sh`.

## Requisitos recomendados
- Python 3.10+ (3.12 funciona bien aquí).
- Node.js 20.x (se recomienda usar `nvm`).
- npm o yarn.

## 1) Arranque rápido (recomendado)

Desde la raíz del repositorio:

```bash
chmod +x run.sh
./run.sh
```

Este script hace lo siguiente:
- inicia el backend desde `backend/` usando el entorno virtual `.venv`.
- carga `nvm` si está disponible y usa Node 20.
- arranca el frontend desde `frontend-react/` en el puerto `5501`.

## 2) Preparar el backend

Si no tienes el entorno virtual creado todavía:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Variables de entorno necesarias
Crea `backend/.env` con al menos:

```env
SECRET_KEY=alguna_clave_secreta_larga
```

Sin este archivo, el backend no arrancará porque `SECRET_KEY` es obligatorio.

## 3) Preparar el frontend

```bash
cd frontend-react
npm install
```

Si usas Node 20 con `nvm`:

```bash
nvm install 20
nvm use 20
npm install
```

## 4) Ejecución manual separada

### Backend

```bash
cd backend
source ../.venv/bin/activate
../.venv/bin/uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend-react
npm run dev -- --port 5501
```

## 5) ¿Qué hacer si `vite` no se encuentra?

Esto se corrige instalando dependencias en `frontend-react` y usando Node 20:

```bash
cd frontend-react
rm -rf node_modules package-lock.json
npm install
npm run dev -- --port 5501
```

## URLs importantes
- Frontend: http://localhost:5501/
- Backend: http://localhost:8000/
- Documentación OpenAPI: http://localhost:8000/docs

## Notas adicionales
- El frontend antiguo en `frontend/` fue eliminado; el app React actual está en `frontend-react/`.
- `run.sh` ya está actualizado para arrancar `frontend-react` y cargar `nvm` si existe.
- Si prefieres, puedo agregar una sección de `docker-compose` o un script de parada (`stop.sh`) también.

