#!/usr/bin/env python3
"""
Script para ejecutar el servidor FastAPI
Uso: python run.py
"""

# Cargar .env con override=True para que tome prioridad sobre variables del sistema
from dotenv import load_dotenv
load_dotenv(dotenv_path=".env", override=True)

import uvicorn

if __name__ == "__main__":
    import os
    is_dev = os.environ.get("ENVIRONMENT", "development") == "development"
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=is_dev,
        log_level="info"
    )