FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar paquetes nativos si aplican
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements y instalar
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copiar el código del backend
COPY backend/ /app

EXPOSE 8000

# Usar el runner sin reload (consistente dentro del contenedor)
CMD ["python", "run_no_reload.py"]
