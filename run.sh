#!/bin/bash

echo "🧹 Limpiando procesos viejos..."
pkill -f uvicorn 2>/dev/null
pkill -f vite 2>/dev/null

echo "🚀 Iniciando backend..."
source .venv/bin/activate
cd backend
../.venv/bin/uvicorn app.main:app &
BACKEND_PID=$!

echo "⏳ Esperando backend..."
sleep 2

cd ..

echo "🌐 Iniciando frontend React..."
# Cargar nvm (si está instalado) y asegurarse de usar Node 20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
if command -v nvm >/dev/null 2>&1; then
  nvm use 20 >/dev/null 2>&1 || nvm install 20 >/dev/null 2>&1
fi
cd "frontend-react"
npm run dev -- --port 5501 &
FRONTEND_PID=$!

echo "✅ Todo corriendo"
echo "Backend PID: $BACKEND_PID"
echo "Frontend React PID: $FRONTEND_PID"
echo "🔗 URL de la app: http://localhost:5501/"

wait
