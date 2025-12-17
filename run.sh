#!/bin/bash

echo "🚀 Iniciando backend..."
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload &
BACK_PID=$!

echo "🌐 Iniciando frontend..."
cd ../frontend
python3 -m http.server 5501 &
FRONT_PID=$!

echo "✅ Todo corriendo"
echo "Backend PID: $BACK_PID"
echo "Frontend PID: $FRONT_PID"

wait
