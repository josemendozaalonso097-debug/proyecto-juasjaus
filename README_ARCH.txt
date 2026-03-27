# Refactorización de Arquitectura Frontend — CBTis 258

## Contexto del proyecto

Este proyecto es un sistema financiero escolar para el CBTis 258 desarrollado con HTML, CSS, JavaScript vanilla en el frontend y FastAPI con SQLite en el backend. El proyecto se encuentra funcional en su totalidad, por lo que el objetivo de esta refactorización es exclusivamente reorganizar el código sin modificar ninguna funcionalidad existente ni el comportamiento visual de la aplicación.

El problema actual es que los archivos JavaScript principales (`principal.js`, `tienda.js`, `login.js`) tienen entre 800 y 1200 líneas de código mezclando lógica de negocio, manipulación del DOM, llamadas a la API REST, validaciones y utilidades en un mismo archivo. Esto se conoce como código espagueti y dificulta el mantenimiento y escalabilidad del proyecto.

---

## Objetivo

Reorganizar el frontend aplicando los principios de **Single Responsibility**, **Separation of Concerns** y **DRY (Don't Repeat Yourself)**, resultando en archivos pequeños con una única responsabilidad cada uno, sin alterar la funcionalidad ni la apariencia visual del sistema.

---

## Restricciones importantes

Antes de comenzar es fundamental respetar las siguientes restricciones:

**No modificar:** Los bloques `<style>` que existen dentro de los archivos HTML. Estos estilos fueron generados con una herramienta externa (Stitch AI) y están correctamente integrados. Moverlos puede romper la apariencia visual.

**No modificar:** Ningún archivo del directorio `/backend`. La refactorización aplica únicamente al frontend.

**No modificar:** La lógica de negocio existente. Solo se reubica el código en archivos con responsabilidad única, no se reescribe.

**No modificar:** Los assets en `/imgs` e `/imagenesTienda`. Solo se mueven a `/assets/` si es estrictamente necesario para mantener las rutas relativas correctas.

---

## Estructura de carpetas objetivo

```
frontend/
│
├── assets/
│   ├── imgs/
│   │   └── yameharte.png
│   └── imagenesTienda/
│       └── (todas las imágenes existentes)
│
├── css/
│   ├── base.css                        ← variables CSS globales y reset
│   ├── components.css                  ← estilos de botones, cards y badges reutilizables
│   └── modales.css                     ← estilos base compartidos entre modales
│
├── components/                         ← fragmentos HTML externos reutilizables
│   ├── header.html                     ← header con gradiente rojo y logo (compartido entre páginas)
│   ├── footer.html                     ← footer con enlaces y botón de logout
│   ├── modal-perfil.html               ← modal completo de perfil de usuario
│   ├── modal-historial.html            ← modal de historial de compras con resumen
│   ├── modal-papeleria.html            ← modal de subida de documentos con drag and drop
│   ├── modal-orientacion.html          ← modal con tabs de reporte, queja, cita y buzón
│   ├── modal-pago-tarjeta.html         ← formulario de pago con tarjeta de crédito/débito
│   ├── modal-pago-deposito.html        ← modal de instrucciones de depósito en OXXO
│   └── modal-pago-transferencia.html   ← modal de datos bancarios para transferencia SPEI
│
├── js/
│   │
│   ├── api/
│   │   ├── auth.js           ← fetch: login, register, logout, check-session, google OAuth
│   │   ├── tienda.js         ← fetch: productos y compras
│   │   └── papeleria.js      ← fetch: subida de documentos al backend
│   │
│   ├── utils/
│   │   ├── components.js     ← función loadComponent para inyectar HTML externo en el DOM
│   │   ├── storage.js        ← todas las operaciones de localStorage (historial, perfil, foto)
│   │   ├── validaciones.js   ← validar número de tarjeta, fecha, CVV, email y campos requeridos
│   │   ├── pdf.js            ← generación de PDFs de comprobantes usando jsPDF
│   │   └── notificaciones.js ← mostrar y ocultar las notificaciones tipo toast
│   │
│   ├── components/
│   │   ├── perfil.js         ← cargarPerfil, actualizarPerfil, cambiarFotoPerfil
│   │   ├── carrito.js        ← agregarAlCarrito, eliminarDelCarrito, calcularTotal, renderizarCarrito
│   │   ├── historial.js      ← renderizarHistorial, guardarEnHistorial, obtenerHistorial, generarPDFHistorial
│   │   ├── modales.js        ← abrirModal, cerrarModal (funciones genéricas reutilizables)
│   │   └── pago.js           ← seleccionarMetodo, enviarComprobante, detectarTipoTarjeta, formatearNumeroTarjeta
│   │
│   └── pages/
│       ├── login.js          ← submit de login, submit de registro, flujo de Google OAuth, modal forgot password
│       ├── principal.js      ← inicialización del dashboard, verificación de sesión, carga de componentes
│       └── tienda.js         ← inicialización de la tienda, apertura de modales de productos, tabs de libros
│
└── pages/
    ├── login/
    │   └── index.html
    ├── principal/
    │   └── index.html
    ├── tienda/
    │   └── index.html
    └── reset-password/
        └── index.html
```

---

## Cómo funciona la carga de componentes

Los archivos HTML en `/components/` son fragmentos que se inyectan en el DOM mediante fetch al inicializar cada página. Esto permite que los modales sigan funcionando exactamente igual para el usuario, pero el código vive en archivos separados y manejables.

La función que hace esto debe vivir en `js/utils/components.js`:

```javascript
// js/utils/components.js
export async function loadComponent(id, path) {
    const response = await fetch(path)
    const html = await response.text()
    document.getElementById(id).innerHTML = html
}
```

---

## Cómo debe quedar un HTML de página

Los archivos `index.html` de cada página deben quedar limpios. Su única responsabilidad es definir la estructura base, los contenedores donde se inyectarán los componentes y cargar el script de entrada de esa página. Todo el contenido de los modales debe ser removido del HTML y colocado en sus respectivos archivos dentro de `/components/`.

Los bloques `<style>` existentes dentro del HTML se conservan en su lugar tal como están.

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CBTis258 Financieros | Principal</title>

    <!-- Dependencias externas existentes, no modificar -->
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;700;900&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

    <!-- Estilos de Stitch AI: NO MOVER NI MODIFICAR -->
    <style>
        /* ... estilos existentes se conservan aquí ... */
    </style>
</head>
<body>

    <!-- Componentes externos: JS los inyecta aquí al cargar -->
    <div id="header-container"></div>

    <!-- Contenido principal de la página -->
    <main>
        <!-- El dashboard, cards, botones y secciones van aquí -->
        <!-- Este contenido sí permanece en el HTML -->
    </main>

    <div id="footer-container"></div>

    <!-- Contenedores de modales: vacíos, JS los rellena -->
    <div id="modal-perfil-container"></div>
    <div id="modal-historial-container"></div>
    <div id="modal-papeleria-container"></div>
    <div id="modal-orientacion-container"></div>
    <div id="modal-pago-container"></div>

    <!-- Única entrada de JavaScript para esta página -->
    <script type="module" src="../../js/pages/principal.js"></script>
</body>
</html>
```

---

## Cómo debe quedar un archivo de página JS

El archivo de cada página debe ser lo más delgado posible. Su única responsabilidad es cargar los componentes HTML, verificar la sesión y llamar a las funciones de inicialización. Toda la lógica real vive en `/js/components/` y `/js/utils/`.

```javascript
// js/pages/principal.js
import { checkSession } from '../api/auth.js'
import { cargarPerfil } from '../components/perfil.js'
import { renderizarHistorial } from '../components/historial.js'
import { loadComponent } from '../utils/components.js'
import { inicializarPago } from '../components/pago.js'
import { inicializarOrientacion } from '../components/modales.js'

// 1. Inyectar todos los componentes HTML en el DOM
await loadComponent('header-container', '/components/header.html')
await loadComponent('footer-container', '/components/footer.html')
await loadComponent('modal-perfil-container', '/components/modal-perfil.html')
await loadComponent('modal-historial-container', '/components/modal-historial.html')
await loadComponent('modal-papeleria-container', '/components/modal-papeleria.html')
await loadComponent('modal-orientacion-container', '/components/modal-orientacion.html')
await loadComponent('modal-pago-container', '/components/modal-pago-tarjeta.html')

// 2. Verificar sesión activa con el backend
const user = await checkSession()
if (!user) {
    window.location.href = '/pages/login'
    throw new Error('Sesión no válida')
}

// 3. Inicializar componentes con los datos del usuario
cargarPerfil(user)
renderizarHistorial()
inicializarPago()
inicializarOrientacion()
```

---

## Separación de responsabilidades por capa

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Vista | `/components/*.html` | Solo estructura HTML, sin lógica |
| Entrada | `/js/pages/*.js` | Inicializar página, cargar componentes, verificar sesión |
| Lógica de componentes | `/js/components/*.js` | Lógica de cada módulo visual |
| Comunicación con API | `/js/api/*.js` | Exclusivamente llamadas fetch al backend |
| Utilidades | `/js/utils/*.js` | Funciones puras de apoyo sin efectos secundarios en el DOM |

---

## Resultado esperado al finalizar

| Archivo | Líneas antes | Líneas después |
|---|---|---|
| `principal/index.html` | ~800 | ~60 |
| `tienda/tienda.html` | ~700 | ~60 |
| `js/pages/principal.js` | ~1000 | ~30 |
| `js/pages/tienda.js` | ~1200 | ~30 |
| Total archivos JS | 3 archivos | ~15 archivos de máx 150 líneas c/u |

---

## Orden de trabajo recomendado

**Paso 1 — Separar el JS sin tocar el HTML.**
Crear la estructura de carpetas en `/js/` y mover las funciones a sus archivos correspondientes. Verificar que todo sigue funcionando antes de continuar. Si algo se rompe en este paso es fácil de aislar porque el HTML no cambió.

**Paso 2 — Extraer los modales a `/components/`.**
Sacar cada modal del HTML a su archivo externo uno por uno, empezando por el más simple. Después de cada extracción verificar que el modal sigue abriendo y cerrando correctamente.

**Paso 3 — Limpiar el HTML de cada página.**
Una vez que todos los modales están en `/components/` y el JS está modularizado, limpiar los `index.html` dejando solo la estructura base.

**Paso 4 — Opcional: variables CSS.**
Si hay tiempo, mover el color `#94272C` y sus variantes a variables en `css/base.css`. Este paso no es prioritario.