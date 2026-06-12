# CBTis 258 - Servicios Financieros 🚀

Bienvenido al repositorio del proyecto. Aquí tienes todo lo que necesitas para instalar y ejecutar el backend FastAPI y el frontend React/Vite sin perderte.

---

## Qué contiene este repositorio

- `backend/`: API en Python con FastAPI y Uvicorn.
- `frontend-react/`: frontend moderno con React + Vite.
- `run.sh`: script Bash de arranque rápido para Linux/macOS/WSL.
- `start-dev.sh`: script de arranque completo para Linux/macOS.
- `start-dev.bat`: script de arranque completo para Windows CMD.

> Nota: la carpeta legacy `frontend/` fue eliminada. El frontend actual se encuentra en `frontend-react/`.

---

## Requisitos mínimos

### Recomendado

- Python 3.10+ (3.12 funciona bien)
- Node.js 20.x
- npm o yarn
- Git

### En Windows

- Si usas Windows nativo: CMD o PowerShell
- Si usas WSL o Git Bash: puedes usar los scripts Bash como en Linux

---

## 1) Configuración inicial

### 1.1 Clonar el repositorio

```bash
git clone https://github.com/josemendozaalonso097-debug/proyecto-juasjaus.git
cd proyecto-juasjaus
```

### 1.2 Verificar el remoto

```bash
git remote -v
```

---

## 2) Preparar el backend (obligatorio)

### 2.1 Crear y activar el entorno virtual

#### Linux/macOS/WSL

```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### Windows CMD

```cmd
py -3 -m venv .venv
.\.venv\Scripts\activate.bat
```

#### Windows PowerShell

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2.2 Instalar dependencias backend

```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 2.3 Crear el archivo de configuración

Crea `backend/.env` con al menos:

```env
SECRET_KEY=una_clave_secreta_larga
```

> `SECRET_KEY` es obligatorio. Sin él, el backend no arranca.

---

## 3) Preparar el frontend

### 3.1 Instalar Node.js y npm

Asegúrate de tener Node 20.x. Si usas `nvm`, ejecuta:

```bash
nvm install 20
nvm use 20
```

### 3.2 Instalar dependencias de frontend

```bash
cd frontend-react
npm install
```

> Si usas `yarn`, también puedes usar `yarn install` si ya lo tienes configurado.

---

## 4) Cómo iniciar la aplicación

### Opción A: Arranque rápido en Linux/macOS/WSL

```bash
chmod +x run.sh
./run.sh
```

Este script:

- inicia el backend usando `.venv`
- carga `nvm` si está instalado y usa Node 20
- arranca el frontend en `http://localhost:5501`

### Opción B: Arranque completo en Linux/macOS

```bash
chmod +x start-dev.sh
./start-dev.sh
```

Este script también:

- crea un entorno virtual `.venv-backend` si no existe
- instala dependencias del backend si faltan
- arranca backend y frontend en background
- guarda logs en `backend/uvicorn.log` y `frontend-react/dev.log`

### Opción C: Arranque en Windows nativo (CMD)

```cmd
start-dev.bat
```

Este script Windows:

- crea `.venv-backend` si no existe
- instala dependencias backend
- abre dos ventanas nuevas: una para backend y otra para frontend

### Opción D: Windows con Git Bash o WSL

Si usas Git Bash o WSL, puedes ejecutar el script Bash:

```bash
./run.sh
```

> En Windows nativo con CMD o PowerShell, usa `start-dev.bat`.

---

## 5) Ejecución manual separada

### 5.1 Backend

```bash
cd backend
source ../.venv/bin/activate
../.venv/bin/uvicorn app.main:app --reload
```

### 5.2 Frontend

```bash
cd frontend-react
npm run dev -- --port 5501
```

---

## 6) URLs útiles

- Frontend: http://localhost:5501/
- Backend: http://localhost:8000/
- OpenAPI docs: http://localhost:8000/docs

---

## 7) Solución de problemas comunes

### 7.1 `vite: not found`

```bash
cd frontend-react
rm -rf node_modules package-lock.json
npm install
npm run dev -- --port 5501
```

### 7.2 El backend falla por `SECRET_KEY`

Verifica que `backend/.env` exista y tenga:

```env
SECRET_KEY=una_clave_secreta_larga
```

### 7.3 Error de permisos al ejecutar `./run.sh`

```bash
chmod +x run.sh
./run.sh
```

### 7.4 Necesito usar Node 20

```bash
nvm install 20
nvm use 20
node -v
```

### 7.5 `npm install` tardando o fallando

- Asegúrate de tener la versión correcta de Node.
- Si usas Windows, ejecuta la terminal como administrador solo si es necesario.
- Si hay errores de dependencias, prueba:

```bash
cd frontend-react
rm -rf node_modules package-lock.json
npm install
```

---

## 8) Notas importantes

- `frontend-react/` es el frontend actual del proyecto.
- `frontend/` fue eliminado porque era la versión antigua.
- `.gitignore` ya excluye `.venv`, `backend/.env`, `backend/cbtis258.db` y logs locales.
- No subas `backend/.env` ni el archivo de base de datos local.

Si quieres, puedo agregar más información sobre cómo detener los procesos que se ejecutan en segundo plano y cómo limpiar el proyecto después de usarlo.
