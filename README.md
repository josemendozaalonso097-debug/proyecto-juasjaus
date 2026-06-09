# CBTis 258 - Servicios Financieros

## 🐧 Ejecutar en Linux / ChromeOS (RECOMENDADO)

**Opción automática: `run.sh`**

Este método levanta el backend y el frontend con un solo comando.

**Requisitos previos:**
1. Python 3 instalado.
2. Entorno virtual creado: `python3 -m venv .venv`
3. Entorno activado: `source .venv/bin/activate`
4. Dependencias instaladas: `pip install -r backend/requirements.txt`

**Pasos para ejecutar:**
1. Abre una terminal en la raíz del proyecto.
2. Da permisos (solo la primera vez): `chmod +x run.sh`
# CBTis 258 - Servicios Financieros

Este README explica cómo arrancar el proyecto en desarrollo (frontend React con Vite y backend FastAPI) en Linux.

Resumen rápido
- Frontend (Vite) -> puerto por defecto usado en esta máquina: 5502 (ej. http://localhost:5502/)
- Backend (Uvicorn/FastAPI) -> puerto por defecto: 8000 (http://localhost:8000/)

Requisitos
- Python 3.8+ (recomendado Python 3.10+)
- Node.js y npm (o pnpm/yarn) para el frontend

Importante: en este repositorio se creó un entorno virtual de prueba `.venv-backend` y el archivo `backend/requirements.txt` fue actualizado con versiones pinneadas (backup: `backend/requirements.txt.bak`). Si prefieres crear tu propio venv, sigue las instrucciones abajo.

## 1) Arrancar en modo desarrollo (recomendado, ver logs en la terminal)

Frontend (terminal A)

```bash
cd /home/josemendozaalonso097/proyecto-juasjaus/frontend-react
# Instalar solo la primera vez o si cambian dependencias
npm ci
# Levantar Vite (visible en la red local)
npm run dev -- --host
```

Backend (terminal B)

```bash
cd /home/josemendozaalonso097/proyecto-juasjaus
# (opcional) crear venv si no existe
python3 -m venv .venv-backend
source .venv-backend/bin/activate
# instalar dependencias (solo la primera vez o si cambian)
pip install --upgrade pip
pip install -r backend/requirements.txt
# arrancar con autoreload (útil en desarrollo)
python3 backend/run.py
```

Después de arrancar, puedes abrir en tu navegador:
- Frontend: http://localhost:5502/
- Backend (docs): http://localhost:8000/docs

## 2) Ejecutarlos en background (como se hizo en esta sesión)

Frontend (background)

```bash
cd /home/josemendozaalonso097/proyecto-juasjaus/frontend-react
# inicia en background y guarda logs y pid
nohup npm run dev -- --host > dev.log 2>&1 & echo $! > vite.pid
```

Backend (background)

```bash
cd /home/josemendozaalonso097/proyecto-juasjaus
# activar venv y arrancar sin autoreload
. .venv-backend/bin/activate
nohup python3 backend/run_no_reload.py > backend/uvicorn.log 2>&1 & echo $! > backend/uvicorn.pid
```

## Logs y control de procesos
- Logs frontend: `frontend-react/dev.log`
- Logs backend: `backend/uvicorn.log`
- PID frontend: `frontend-react/vite.pid`
- PID backend: `backend/uvicorn.pid`

Ver logs en tiempo real:

```bash
tail -f frontend-react/dev.log
tail -f backend/uvicorn.log
```

Parar procesos (si los iniciaste en background):

```bash
kill $(cat frontend-react/vite.pid) || true && rm -f frontend-react/vite.pid
kill $(cat backend/uvicorn.pid) || true && rm -f backend/uvicorn.pid
```

Comandos útiles de reinicio

```bash
# Reiniciar backend (background)
kill $(cat backend/uvicorn.pid) || true
. .venv-backend/bin/activate
nohup python3 backend/run_no_reload.py > backend/uvicorn.log 2>&1 & echo $! > backend/uvicorn.pid
```

Notas y recomendaciones
- Si prefieres trabajar con dos terminales en foreground (ver logs en la terminal) usa la sección "Arrancar en modo desarrollo".
- Si vas a compartir la app con dispositivos en la misma red, asegúrate de exponer host (`--host`) y/o usar la URL de red que muestre Vite (ej. http://100.115.92.205:5502/).
- Si quieres automatizar, puedo añadir `start-dev.sh` y `stop-dev.sh` para arrancar/parar ambos con un solo comando.

## Pasos realizados localmente (Windows)

A continuación se documentan los pasos exactos que realicé durante la sesión para levantar el backend y frontend en un equipo con Windows. Útil como guía rápida para reproducir el entorno local.

### Backend (Windows — Python 3.11)

- Instalé Python 3.11 y creé un virtualenv llamado `.venv311`:
	- `py -3.11 -m venv .venv311`
	- `.\.venv311\Scripts\python.exe -m pip install --upgrade pip`
- Instalé dependencias evitando `uvloop` (no compatible con Windows):
	- `.\.venv311\Scripts\python.exe -m pip install -r backend/requirements_no_uvloop.txt`
	- Si no existe `requirements_no_uvloop.txt`, instala `backend/requirements.txt` pero omite `uvloop`.
- Creé un `.env` mínimo en `backend/.env` con al menos:
	- `SECRET_KEY=dev_secret_for_local_dev`
	- (No subir este archivo al repositorio ni compartir claves reales.)
- Arrancar backend:
	- `cd backend`
	- `.\.venv311\Scripts\python.exe run.py`
- Backend disponible en: `http://localhost:8000` (docs: `http://localhost:8000/docs`)

### Frontend estático (opcional)

- Para pruebas rápidas de HTML/CSS estático en `frontend/`:
	- `cd frontend`
	- `python -m http.server 5173`
	- Abrir `http://localhost:5173`

### Frontend React (Vite)

- Entrar en `frontend-react`, instalar y arrancar el dev server:
	- `cd frontend-react`
	- `npm install`
	- `npm run dev`
- En esta sesión Vite se sirvió en `http://localhost:5502/` (puerto puede variar).

### Notas y buenas prácticas

- No subir `backend/.env` ni secretos al repositorio.
- Si trabajas en Linux/macOS puedes usar `uvloop` y crear el venv con `python3 -m venv .venv`.
- Si quieres, puedo añadir scripts (`start-dev.sh`, `stop-dev.sh`) para arrancar/parar ambos servicios automáticamente.

