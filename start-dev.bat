@echo off
REM Script de arranque para desarrollo en Windows (cmd)
SETLOCAL ENABLEDELAYEDEXPANSION

REM Ir a la carpeta del script
cd /d %~dp0

echo [start-dev] Iniciando entorno de desarrollo (Windows)...

IF NOT EXIST .venv-backend (
  echo [start-dev] Creando virtualenv .venv-backend
  py -3 -m venv .venv-backend
)

echo [start-dev] Actualizando pip e instalando dependencias backend
.venv-backend\Scripts\python.exe -m pip install --upgrade pip
IF EXIST backend\requirements_no_uvloop.txt (
  .venv-backend\Scripts\python.exe -m pip install -r backend\requirements_no_uvloop.txt
) ELSE (
  .venv-backend\Scripts\python.exe -m pip install -r backend\requirements.txt
)

echo [start-dev] Arrancando backend en una nueva ventana
start "backend" cmd /k ".venv-backend\Scripts\python.exe backend\run.py"

echo [start-dev] Preparando frontend-react
cd frontend-react
IF NOT EXIST node_modules (
  echo [start-dev] Instalando dependencias frontend (npm ci)
  npm ci
)

echo [start-dev] Arrancando Vite (frontend) en una nueva ventana
start "frontend" cmd /k "npm run dev -- --host"

echo [start-dev] Hecho.
ENDLOCAL
