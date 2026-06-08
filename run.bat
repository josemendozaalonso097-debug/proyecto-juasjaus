@echo off
echo ===============================
echo 🚀 INICIANDO PROYECTO
echo ===============================

echo 🧹 Cerrando procesos viejos...
taskkill /IM uvicorn.exe /F >nul 2>&1
taskkill /IM node.exe /F >nul 2>&1

echo 🔐 Activando entorno virtual...
call .venv\Scripts\activate

echo 🚀 Iniciando backend...
cd backend
start cmd /k uvicorn app.main:app
cd ..

echo ⏳ Esperando backend...
timeout /t 2 >nul

echo 🌐 Iniciando frontend React...
cd "frontend (1)"
start cmd /k npm run dev -- --port 5501
cd ..

echo ===============================
echo ✅ TODO CORRIENDO
echo 👉 Frontend React: http://127.0.0.1:5501/
echo 👉 Backend:  http://127.0.0.1:8000/docs
echo ===============================
pause
