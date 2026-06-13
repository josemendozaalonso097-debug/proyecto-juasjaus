# Guía de Pruebas — Proyecto CBTis 258

Este documento describe cómo verificar que el proyecto funciona correctamente en cualquier máquina limpia.

---

## 1. Preparación del entorno

### 1.1 Clonar el repositorio

```bash
git clone https://github.com/josemendozaalonso097-debug/proyecto-juasjaus.git
cd proyecto-juasjaus
```

**Verificación**: Deberías ver las carpetas `backend/`, `frontend-react/`, `mobile/`, etc., pero **NO** las carpetas `node_modules/` ni `.venv/`.

### 1.2 Verificar versiones mínimas

```bash
python3 --version    # Debe ser 3.10 o superior
node --version       # Debe ser 20.x o superior
npm --version        # npm 9+ recomendado
git --version        # Para confirmar Git está instalado
```

---

## 2. Instalación de dependencias

### 2.1 Backend

```bash
# Crear venv
python3 -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate

# Instalar dependencias
pip install --upgrade pip
pip install -r backend/requirements.txt
```

**Verificación**: El comando `pip list` debe mostrar `fastapi`, `uvicorn`, `pydantic`, etc.

### 2.2 Crear archivo `.env` del backend

```bash
# Crea este archivo: backend/.env
cat > backend/.env << "EOF"
SECRET_KEY=una_clave_secreta_super_larga_minimo_32_caracteres
GOOGLE_CLIENT_ID=tu_client_id_aqui_si_tienes_oauth
EOF
```

**Verificación**: El archivo `backend/.env` debe existir y contener `SECRET_KEY`.

### 2.3 Frontend

```bash
cd frontend-react

# Asegurar Node 20 (si usas nvm)
nvm install 20
nvm use 20

# Instalar dependencias
npm install
```

**Verificación**: Debe haber una carpeta `node_modules/` con 183 paquetes aproximadamente.

---

## 3. Verificación de archivo de configuración

### 3.1 Revisar `oauth2-callback.html`

```bash
# El archivo debe estar en public/
ls -la frontend-react/public/oauth2-callback.html
# Debe existir y tener contenido
```

**Verificación**: El archivo debe existir y contener `<script>` con lógica de postMessage.

---

## 4. Ejecutar la aplicación

### 4.1 Opción 1: Script rápido (Linux/macOS)

```bash
# Desde la raíz del proyecto
chmod +x run.sh
./run.sh
```

**Salida esperada**:
```
🧹 Limpiando procesos viejos...
🚀 Iniciando backend...
⏳ Esperando backend...
🌐 Iniciando frontend React...
✅ Todo corriendo
Frontend React PID: ...
Backend PID: ...
🔗 URL de la app: http://localhost:5501/
```

### 4.2 Opción 2: Ejecución manual

**Terminal 1 (Backend)**:
```bash
source .venv/bin/activate
cd backend
python run.py
```

**Salida esperada**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 (Frontend)**:
```bash
cd frontend-react
nvm use 20  # si aplica
npm run dev -- --port 5501
```

**Salida esperada**:
```
VITE v5.4.21  ready in X ms

➜  Local:   http://localhost:5501/
➜  press h to show help
```

---

## 5. Verificación de funcionalidad

### 5.1 Acceder a la aplicación

Abre navegador en: **http://localhost:5501/**

**Verificación**:
- [ ] Página carga sin errores
- [ ] No hay errores de CORS en consola del navegador
- [ ] Se ve la página de login

### 5.2 Verificar conectividad backend-frontend

En consola del navegador (F12):

```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.error('Error backend:', e))
```

**Verificación**: Debe mostrar `Backend OK: {...}` sin errores.

### 5.3 Prueba sin OAuth (credenciales de prueba)

Si el endpoint `/login/google` requiere token real, verifica que el error sea claramente 401/403, no CORS.

---

## 6. Troubleshooting

| Problema | Solución |
|----------|----------|
| `command not found: nvm` | Instala nvm: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh \| bash` |
| `No module named 'fastapi'` | Verifica que esté activado el venv: `which python` debe mostrar `.venv/bin/python` |
| `VITE not found` | Ejecuta `npm install` nuevamente con Node 20 |
| CORS error en navegador | Verifica que frontend esté en `http://localhost:5501` y backend corriendo en `8000` |
| `redirect_uri_mismatch` | Aún no es producción. Para testing, solo abre http://localhost:5501/oauth2-callback manualmente |

---

## 7. Limpieza después de pruebas

```bash
# Detener procesos
pkill -f uvicorn
pkill -f vite

# O usando PIDs guardados (si usaste run.sh)
kill <BACKEND_PID> <FRONTEND_PID>
```

---

## 8. Checklist final

- [ ] Repo clonado sin errores
- [ ] Python 3.10+ y Node 20+ verificados
- [ ] .venv creado e instaladas dependencias backend
- [ ] node_modules creado e instaladas dependencias frontend
- [ ] backend/.env existe con SECRET_KEY
- [ ] Backend corriendo en http://localhost:8000
- [ ] Frontend corriendo en http://localhost:5501
- [ ] Página principal carga sin errores de CORS
- [ ] /api/health responde correctamente
- [ ] oauth2-callback.html existe en frontend-react/public/

**Si todos los items están marcados, el proyecto funciona correctamente en esta máquina.**

---

## 9. Información de contacto

Para problemas con estas pruebas, consulta el README.md o abre un issue en GitHub.
