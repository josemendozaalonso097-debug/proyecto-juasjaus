#!/bin/bash

echo "🧹 Limpiando procesos viejos..."
pkill -f uvicorn 2>/dev/null
pkill -f http.server 2>/dev/null

# 1. Activar entorno virtual
source "/home/angeleduardo/Proyecto Checo Prez/.venv/bin/activate"

# 2. INICIAR BACKEND (Puerto 8000)
echo "🚀 Iniciando Backend..."
cd "/home/angeleduardo/Proyecto Checo Prez/proyecto-juasjaus-main/backend"
# Ejecutamos desde la carpeta padre de 'app'
python3 -m uvicorn app.main:app --reload &
BACKEND_PID=$!

# 3. INICIAR FRONTEND (Puerto 5501)
echo "🌐 Iniciando Frontend..."
cd "/home/angeleduardo/Proyecto Checo Prez/proyecto-juasjaus-main/frontend"
# Servimos DIRECTAMENTE la carpeta donde está el login.html
python3 -m http.server 5501 &
FRONTEND_PID=$!

echo "---------------------------------------"
echo "✅ SERVIDORES LISTOS"
echo "🔗 Frontend: http://localhost:5501/login.html"
echo "🔗 Backend API: http://localhost:8000/docs"
echo "---------------------------------------"

wait
