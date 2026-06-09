#!/usr/bin/env python3
"""
Script para ejecutar el servidor FastAPI sin reload
"""
import os
from pathlib import Path

# Asegurarse de que estamos en el directorio correcto
backend_dir = Path(__file__).parent
os.chdir(backend_dir)

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Sin auto-reload para evitar problemas de .env
        log_level="info"
    )
