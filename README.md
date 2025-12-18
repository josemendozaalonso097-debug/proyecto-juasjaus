🐧 Ejecutar en Linux (RECOMENDADO)
✅ Método recomendado: run.sh

Este método levanta backend y frontend con un solo comando.

📁 Requisitos

Python 3 instalado

Entorno virtual creado (.venv)

Dependencias instaladas

▶️ Pasos

1️⃣ Abrir una terminal en la raíz del proyecto

2️⃣ Dar permisos (solo la primera vez):

chmod +x run.sh


3️⃣ Ejecutar:

./run.sh


4️⃣ Abrir en el navegador:

http://127.0.0.1:5501/login.html

🔌 Para detener el proyecto

Presionar:

CTRL + C


Si aparece algún error de puerto ocupado, ejecutar:

pkill -f uvicorn
pkill -f http.server


y volver a ejecutar ./run.sh.

------------------------------------------------

🪟 Ejecutar en Windows
✅ Opción 1: run.bat

Este método intenta iniciar el backend y frontend automáticamente.

▶️ Pasos

1️⃣ Instalar Python desde:

https://www.python.org


⚠️ Importante: marcar “Add Python to PATH”

2️⃣ Abrir la carpeta del proyecto

3️⃣ Doble click en:

run.bat


4️⃣ Abrir en el navegador:

http://127.0.0.1:5501/login.html

-----------------------------------------------------------

⚠️ Si run.bat NO funciona (opción segura)

Usar dos terminales, este método siempre funciona.

🧪 Método alternativo (2 terminales – FUNCIONA EN TODOS)
🖥️ Terminal 1 – Backend
cd backend
.venv\Scripts\activate
uvicorn app.main:app

🖥️ Terminal 2 – Frontend
cd frontend
python -m http.server 5501


Luego abrir:

http://127.0.0.1:5501/login.html

ℹ️ Notas importantes

El backend corre en:

http://127.0.0.1:8000


La documentación de la API:

http://127.0.0.1:8000/docs


El frontend requiere que el backend esté corriendo
