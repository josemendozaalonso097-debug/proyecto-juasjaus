#!/usr/bin/env bash
set -euo pipefail

# Script de arranque para desarrollo (Linux/macOS)
# Crea/activa venv backend, instala dependencias si faltan,
# y levanta backend y frontend-react en background con logs.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "[start-dev] Iniciando entorno de desarrollo..."

# --- Backend ---
VENV_DIR="$ROOT_DIR/.venv-backend"
if [ ! -d "$VENV_DIR" ]; then
  echo "[start-dev] Creando virtualenv en .venv-backend"
  python3 -m venv "$VENV_DIR"
fi

echo "[start-dev] Activando virtualenv"
# shellcheck disable=SC1091
. "$VENV_DIR/bin/activate"

echo "[start-dev] Instalando dependencias backend (si es necesario)"
if [ -f backend/requirements_no_uvloop.txt ]; then
  pip install --upgrade pip
  pip install -r backend/requirements_no_uvloop.txt
else
  pip install --upgrade pip
  pip install -r backend/requirements.txt
fi

echo "[start-dev] Arrancando backend (uvicorn). Logs: backend/uvicorn.log"
nohup "$VENV_DIR/bin/python" backend/run.py > backend/uvicorn.log 2>&1 &
echo $! > backend/uvicorn.pid

# --- Frontend React ---
echo "[start-dev] Preparando frontend-react"
cd "$ROOT_DIR/frontend-react"
if [ ! -d node_modules ]; then
  echo "[start-dev] Instalando dependencias frontend (npm ci)"
  npm ci
fi

echo "[start-dev] Arrancando Vite (frontend-react). Logs: frontend-react/dev.log"
nohup npm run dev -- --host > "$ROOT_DIR/frontend-react/dev.log" 2>&1 &
echo $! > "$ROOT_DIR/frontend-react/vite.pid"

echo "[start-dev] Hecho. Frontend en http://localhost:5173 o el puerto mostrado por Vite. Backend en http://localhost:8000"
echo "PIDs guardados en frontend-react/vite.pid y backend/uvicorn.pid"

exit 0
