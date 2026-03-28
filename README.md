# CBTis 258 - Servicios Financieros

## 🐧 Ejecutar en Linux / ChromeOS (RECOMENDADO)

**Opción automática: `run.sh`**

Este método levanta el backend y el frontend con un solo comando.

**Requisitos previos:**
1. Python 3 instalado.
2. Entorno virtual creado: `python3 -m venv .venv`
3. Entorno activado: `source .venv/bin/activate`
4. Dependencias instaladas: `pip install -r backend/requirements.txt`

**Pasos para ejecutar:**
1. Abre una terminal en la raíz del proyecto.
2. Da permisos (solo la primera vez): `chmod +x run.sh`
3. Ejecuta: `./run.sh`
4. Abre en tu navegador: `http://127.0.0.1:5501`

Para detener el proyecto, presiona `CTRL + C`. Si algún puerto se queda trabado, ejecuta `pkill -f uvicorn` y `pkill -f http.server`.

---

## 🪟 Ejecutar en Windows

Si copiaste el proyecto desde Linux/ChromeOS a Windows, **NO copies la carpeta `.venv`**. Debes instalar el entorno virtual de nuevo en Windows porque los de Linux no son compatibles.

### 🛠️ Paso 1: Configurar el entorno (Solo la primera vez)
1. Instala Python desde [python.org](https://www.python.org). **⚠️ IMPORTANTE:** Al instalar, marca la casilla inferior que dice **"Add Python to PATH"**.
2. Abre una terminal de comandos (`cmd`) en la carpeta del proyecto.
3. Crea el entorno virtual en Windows:
   `python -m venv .venv`
4. Activa el entorno virtual:
   `.venv\Scripts\activate`
5. Instala las dependencias:
   `pip install -r backend/requirements.txt`

### ▶️ Paso 2: Ejecutar el proyecto
Tienes dos formas de iniciarlo en Windows una vez configurado el entorno:

**Opción A: Ejecutar el script automático (Fácil)**
Simplemente dale **doble clic** al archivo `run.bat` que está en la carpeta. Esto abrirá automáticamente el backend y el frontend.
Si te sale un aviso de seguridad de Windows Protect, dale a "Más información" y "Ejecutar de todas formas".

**Opción B: Método manual con 2 Terminales (La vieja confiable)**
Si `run.bat` no te funciona, abre dos terminales (`cmd`) en la carpeta del proyecto:

🖥️ **Terminal 1 – Backend:**
```cmd
.venv\Scripts\activate
cd backend
uvicorn app.main:app --reload
```
🖥️ **Terminal 2 – Frontend:**
```cmd
cd frontend
python -m http.server 5501
```

Tras iniciar, accede a: `http://127.0.0.1:5501/login.html`

---

## 📱 ¿Cómo ver la página en mi Celular?

Si estás ejecutando el proyecto en tu computadora o en la nube (como Antigravity), las URL `localhost` o `127.0.0.1` **solo funcionan dentro de ese mismo dispositivo**. Tu celular no puede ver el localhost de otro dispositivo.

### Opción A: Visual Studio Code (Solo si usas VS Code local)
1. Abre este proyecto en **Visual Studio Code**.
2. En el panel inferior (Terminal), ve a la pestaña **"Puertos"** (Ports).
3. Agrega los puertos `5501` y `8000`.
4. Cambia la visibilidad de Private a **Public** con clic derecho sobre el candado.
5. VS Code te dará una URL larga (`https://...devtunnels.ms`). ¡Ábrela en tu celular!

### Opción B: Método Universal (Cualquier Editor / Antigravity) 🚀
Si estás en este entorno o en un editor sin ports internos, usa este comando mágico:
1. Abre dos terminales nuevas.
2. Terminal 1 (Frontend): `npx localtunnel --port 5501`
3. Terminal 2 (Backend): `npx localtunnel --port 8000`
4. **Importante:** Recuerda que si usas esto, debes cambiar temporalmente el `API_BASE` en `frontend/js/api/auth.js` para que coincida con el link que te dio la Terminal 2.
5. Abre el link de la Terminal 1 en tu celular y ¡listo! 📲

*(Nota: La primera vez verás una página azul pidiendo tu IP, solo dale al botón "Click to continue").*
