#!/bin/bash

echo "🧹 Limpiando procesos viejos..."
pkill -f uvicorn 2>/dev/null
pkill -f http.server 2>/dev/null

echo "🚀 Iniciando backend..."
source .venv/bin/activate
cd backend
uvicorn app.main:app &
BACKEND_PID=$!

echo "⏳ Esperando backend..."
sleep 2

cd ..

echo "🌐 Iniciando frontend..."
cd frontend
python3 -m http.server 5501 &
FRONTEND_PID=$!

echo "✅ Todo corriendo"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "🔗 URL del Login: http://localhost:5501/login.html"

wait

