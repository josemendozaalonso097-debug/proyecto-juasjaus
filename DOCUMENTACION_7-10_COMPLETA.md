# DOCUMENTACIÓN TÉCNICA COMPLETA - PUNTOS 7-10
## Sistema de Servicios Financieros - CBTis 258

> Nota: este documento describe una versión legacy del frontend que estaba ubicada en `frontend/`. Ese directorio ha sido eliminado; el frontend actual se encuentra en `frontend-react/`.

---

# 7. FLUJO DE DATOS EN EL PROCESO DE DIGITALIZACIÓN

## 7.1 Diagrama de Flujo General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    USUARIO FINAL (Estudiante/Padre)                     │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                    Frontend (Puerto 5501)
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    Login Page          Principal Page       Tienda Page
    (login.html)        (principal.html)     (tienda.html)
         │                    │                    │
         └────────────────────┼────────────────────┘
                             │
                API HTTP/CORS (Port 8000)
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    FastAPI Auth API   FastAPI User API    FastAPI Store API
    (login/register)   (profile/session)   (products/cart/payment)
         │                    │                    │
         └────────────────────┼────────────────────┘
                             │
                    SQLite Database
                    (cbtis258.db)
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    Users Table         Sessions Table    Products & Orders
    (accounts)          (tokens/auth)      (inventory/history)
```

## 7.2 Flujo de Autenticación (Login)

```
INICIO
   │
   ├─► Usuario ingresa credenciales en login.html
   │   (usuario, contraseña)
   │
   ├─► JavaScript ejecuta auth.js:loginUser()
   │   └─ Valida campos vacíos localmente
   │
   ├─► HTTP POST → Backend: /auth/login
   │   Payload: { username, password }
   │
   ├─► FastAPI valida contra SQLite
   │   ├─ Busca usuario en tabla Users
   │   ├─ Compara password con bcrypt hash
   │   └─ Si falla: retorna 401 Unauthorized
   │
   ├─► Si es válido: Backend genera JWT Token
   │   ├─ Token contiene: user_id, email, role, exp_time
   │   └─ HTTP 200 OK: { token, user_id, email, name }
   │
   ├─► Frontend guarda Token en localStorage
   │   key: "auth_token" = "eyJhbGciOiJ..."
   │
   └─► pageTransition.js muestra cortina roja
       y navega a principal/index.html
```

## 7.3 Flujo de Compra en Tienda

```
┌─────────────────────────────────────────────────────────────────┐
│ PRODUCTO                                                        │
└─────────────────────────────────────────────────────────────────┘
        ▼
   [Usuario selecciona categoría]
   (Uniformes, Libros, Útiles, Papelería)
        │
        ├─► productos.js llama a API: GET /api/tienda/productos
        │   └─► Backend consulta tabla Products de SQLite
        │       (id, nombre, precio, imagen, stock, categoría)
        │
        ├─► HTML se rellena con datos: <img src>, <p>${precio}</p>
        │   Se abre modal correspondiente
        │
        │
┌─────────────────────────────────────────────────────────────────┐
│ AGREGAR AL CARRITO                                              │
└─────────────────────────────────────────────────────────────────┘
        │
        ├─► carrito.js intercepta click "Agregar al Carrito"
        │   └─► Objeto se pushea en array: cartItems[]
        │
        ├─► Datos almacenados en memoria (NO localStorage)
        │   { id, nombre, precio, cantidad, talla, semestre }
        │
        ├─► HTML del carrito se recalcula:
        │   ├─ Suma precios: totalPrecio = sum(precio * cantidad)
        │   └─ Muestra items: <li>${nombre} x${cantidad}</li>
        │
        │
┌─────────────────────────────────────────────────────────────────┐
│ MÉTODO DE PAGO                                                  │
└─────────────────────────────────────────────────────────────────┘
        │
        ├─► Usuario elige: [Tarjeta] [OXXO] [Transferencia]
        │
        ├─► Si TARJETA:
        │   ├─ pago.js abre modal con form de tarjeta
        │   ├─ Validaciones en tiempo real:
        │   │  ├─ Número: 16 dígitos + Luhn algorithm
        │   │  ├─ Fecha: MM/AA > fecha actual
        │   │  └─ CVV: 3-4 dígitos
        │   └─ Simulación: genera código de comprobante
        │
        ├─► Si OXXO:
        │   ├─ pago.js genera código de barras con JsBarcode
        │   ├─ Muestra instrucciones de depósito
        │   └─ Genera PDF con referencia de pago
        │
        ├─► Si TRANSFERENCIA:
        │   ├─ Muestra CLABE y datos bancarios del colegio
        │   └─ Usuario realiza transferencia SPEI manual
        │
        │
┌─────────────────────────────────────────────────────────────────┐
│ COMPLETAR COMPRA                                                │
└─────────────────────────────────────────────────────────────────┘
        │
        ├─► Backend HTTP POST: /api/tienda/comprar
        │   Payload: { user_id, items[], metodo_pago, total }
        │
        ├─► Backend valida:
        │   ├─ Token válido y no expirado
        │   ├─ Cantidad disponible en stock
        │   └─ Monto correcto
        │
        ├─► Inserta en tabla Orders de SQLite:
        │   INSERT INTO orders (user_id, fecha, total, items_json, metodo_pago)
        │
        ├─► Actualiza tabla Products:
        │   UPDATE products SET stock = stock - cantidad WHERE id IN (...)
        │
        ├─► Retorna: { status: "success", order_id, comprobante_url }
        │
        ├─► Frontend recibe respuesta y:
        │   ├─ Genera PDF con jsPDF (comprobante)
        │   ├─ Guarda en historial (localStorage + backend)
        │   ├─ Limpia carrito: cartItems.length = 0
        │   └─ Muestra toast success "¡Compra realizada!"
        │
        └─► Redirige a principal con historial actualizado
```

## 7.4 Flujo de Consulta de Historial

```
Usuario navega a "Mi Historial"
        │
        ├─► historial.js llama: GET /api/tienda/historial
        │   Header: { Authorization: "Bearer <token>" }
        │
        ├─► Backend valida token y extrae user_id
        │   SELECT * FROM orders WHERE user_id = ? ORDER BY fecha DESC
        │
        ├─► Retorna JSON array de compras:
        │   [
        │     {
        │       order_id: 1,
        │       fecha: "2026-05-11",
        │       total: 499.50,
        │       items: [
        │         { producto: "Uniforme", cantidad: 1, precio: 250 },
        │         { producto: "Libros", cantidad: 2, precio: 249.50 }
        │       ],
        │       metodo_pago: "tarjeta",
        │       estado: "completada"
        │     }
        │   ]
        │
        ├─► Frontend renderiza tabla dinámica:
        │   <table>
        │     <tr><th>Fecha</th><th>Total</th><th>Acciones</th></tr>
        │     <tr><td>11/05/2026</td><td>$499.50</td><td>[Descargar PDF]</td></tr>
        │   </table>
        │
        └─► Usuario puede descargar PDF de cada compra
```

## 7.5 Operaciones de Datos - Tabla Resumen

| Operación | Origen | Destino | Datos | Tecnología |
|-----------|--------|---------|-------|------------|
| Login | Login.html | FastAPI | username, password | POST /auth/login |
| Validación | FastAPI | SQLite Users | query user_id | SELECT query |
| Token Gen | FastAPI | Frontend localStorage | JWT token | Bearer Token |
| Get Catálogo | tienda.html | FastAPI | categoria | GET /api/tienda |
| Agregar Carrito | JavaScript | Array en memoria | producto objeto | Memory (cartItems[]) |
| Realizar Compra | pago.js | FastAPI | order objeto | POST /api/tienda/comprar |
| Insert Order | FastAPI | SQLite Orders | nueva orden | INSERT INTO orders |
| Update Stock | FastAPI | SQLite Products | id, cantidad | UPDATE products |
| Get Historial | principal.html | FastAPI | user_id (del token) | GET /api/tienda/historial |

---

# 8. PROTOTIPADO Y DISEÑO: MAQUETAS Y WIREFRAMES

## 8.1 Arquitectura Visual del Proyecto

El proyecto utiliza **Tailwind CSS (CDN)** + **Estilos Stitch AI** para un diseño Premium.

### Características de Diseño:
- **Paleta de colores:** Rojo escuela (#94272C), Blanco, Grises
- **Tipografía:** Lexend (Google Fonts) - 400, 500, 700, 900
- **Componentes:** Glassmorphism (backdrop-filter), Mesh Gradient (fondo), Shadow tenues
- **Responsividad:** Mobile-first con Tailwind

## 8.2 Wireframe de Login

```
┌──────────────────────────────────────────────┐
│     logo    CBTis 258 Financieros            │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │                                      │   │
│  │   [Inicia Sesión]                    │   │
│  │                                      │   │
│  │   Usuario: [________________]         │   │
│  │   Contraseña: [________________]      │   │
│  │                                      │   │
│  │   [INICIA SESIÓN]  [REGISTRATE]      │   │
│  │                                      │   │
│  │   ────────── O ──────────            │   │
│  │                                      │   │
│  │   [G] Inicia con Google               │   │
│  │                                      │   │
│  │   ¿Olvidaste tu contraseña?           │   │
│  │                                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

## 8.3 Wireframe Principal (Dashboard)

```
┌──────────────────────────────────────────────────────┐
│ [≡] Logo  CBTis258      [🔔] [👤] [⚙] [Logout]      │ Header
├──────────────────────────────────────────────────────┤
│                                                      │
│  Sidebar:              Main Content:                 │
│  ├─ 🏠 Inicio          │ ¡Bienvenido, [Nombre]!    │
│  ├─ 🛒 Tienda          │                            │
│  ├─ 📋 Historial       │ ┌────────────────────────┐ │
│  ├─ 📄 Papelería       │ │ Mi Perfil              │ │
│  ├─ 📢 Orientación     │ │ [Foto circular]        │ │
│  └─ ℹ️ Ayuda            │ │ Nombre: Juan Pérez    │ │
│                        │ │ Email: juan@cbtis.mx  │ │
│                        │ │ Semestre: 4°           │ │
│                        │ │ [Editar]               │ │
│                        │ └────────────────────────┘ │
│                        │                            │
│                        │ Próximos eventos:          │
│                        │ ├─ Pago uniformes (15/05) │
│                        │ ├─ Entrega libros (20/05) │
│                        │ └─ Reunión padres (25/05) │
│                        │                            │
└──────────────────────────────────────────────────────┘
```

## 8.4 Wireframe Tienda

```
┌────────────────────────────────────────────────────────┐
│ [≡] Logo    TIENDA ESCOLAR     [🛒 (3)]               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Filtros:                 Productos:                   │
│  ○ Todos                  ┌──────┬──────┬──────┐      │
│  ○ Uniformes              │Unifor│ Libro│Útiles│      │
│  ○ Libros                 │ 250$ │150$ │ 50$ │      │
│  ○ Útiles                 │ [+]  │ [+] │ [+] │      │
│  ○ Papelería              └──────┴──────┴──────┘      │
│                                                        │
│                           ┌──────┬──────┬──────┐      │
│                           │Útiles│ Cua │Servi │      │
│                           │ 75$ │60$  │80$  │      │
│                           │ [+]  │ [+] │ [+] │      │
│                           └──────┴──────┴──────┘      │
│                                                        │
│  Carrito: 3 items | Total: $475                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Uniforme (1)             $250                 │  │
│  │ Libro de Cálculo (1)     $150                 │  │
│  │ Cuaderno (3)             $75                  │  │
│  │                                                │  │
│  │ Total: $475              [PAGAR]              │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## 8.5 Wireframe Modal de Pago

```
┌──────────────────────────────────────────┐
│  MÉTODO DE PAGO                      [X] │
├──────────────────────────────────────────┤
│                                          │
│  ¿Cómo deseas pagar?                    │
│                                          │
│  ◯ Tarjeta de Crédito/Débito           │
│    Número: [________________]            │
│    Fecha: [__/__]  CVV: [___]            │
│                                          │
│  ◯ OXXO (Código de Barras)              │
│    ███████████████████████               │
│    Referencia: 12345678                 │
│                                          │
│  ◯ Transferencia Bancaria (SPEI)        │
│    CLABE: 123456789012345678            │
│    Banco: Bancrea                        │
│                                          │
│           [CONFIRMAR]  [CANCELAR]       │
│                                          │
└──────────────────────────────────────────┘
```

---

# 9. ESQUEMA DE BASE DE DATOS: DESCRIPCIÓN DE COLECCIONES

## 9.1 Información General

**Motor:** SQLite (`cbtis258.db`)  
**Ubicación:** `/backend/` en el servidor  
**Formato:** Archivo binario local, fácil de respaldar

---

## 9.2 Tabla: `users` (Cuentas de Usuario)

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,              -- bcrypt hashed
    nombre_completo VARCHAR(100),
    telefono VARCHAR(20),
    rol VARCHAR(20) DEFAULT 'estudiante',            -- estudiante, padre, admin
    semestre INTEGER,                                -- 1-6 para estudiantes
    grupo CHAR(1),                                    -- A, B, C, D
    foto_url VARCHAR(255),                           -- URL a perfil picture
    activo BOOLEAN DEFAULT 1,
    google_id VARCHAR(50),                           -- Para OAuth con Google
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_sesion TIMESTAMP
);

Índices:
- PRIMARY KEY (id)
- UNIQUE (username)
- UNIQUE (email)
```

---

## 9.3 Tabla: `sessions` (Control de Sesiones y Tokens)

```sql
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) NOT NULL,                     -- JWT token
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activo BOOLEAN DEFAULT 1,
    ip_address VARCHAR(45),                          -- IPv4 o IPv6
    user_agent TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

Índices:
- PRIMARY KEY (id)
- UNIQUE (token)
- INDEX (user_id, activo)
```

---

## 9.4 Tabla: `products` (Catálogo de Productos)

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,                  -- uniformes, libros, útiles, papelería
    imagen_url VARCHAR(255),
    stock INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT 1,
    semestres_aplicables TEXT,                       -- JSON: [1,2,3] o null si aplica a todos
    tallas_disponibles TEXT,                         -- JSON: ["XS", "S", "M", "L", "XL"]
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CHECK (precio >= 0),
    CHECK (stock >= 0)
);

Índices:
- PRIMARY KEY (id)
- INDEX (categoria)
- INDEX (activo)
```

---

## 9.5 Tabla: `orders` (Historial de Compras)

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,                -- tarjeta, oxxo, transferencia
    estado VARCHAR(50) DEFAULT 'completada',        -- completada, pendiente, cancelada
    items_json TEXT NOT NULL,                        -- JSON array con detalles
    comprobante_url VARCHAR(255),                    -- URL al PDF de comprobante
    notas TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (total >= 0)
);

Índices:
- PRIMARY KEY (id)
- INDEX (user_id, fecha DESC)
- INDEX (estado)
```

**Ejemplo de `items_json`:**
```json
[
  {
    "product_id": 5,
    "nombre": "Uniforme Completo",
    "cantidad": 1,
    "precio_unitario": 250.00,
    "talla": "M",
    "semestre": 4
  },
  {
    "product_id": 12,
    "nombre": "Libro de Cálculo",
    "cantidad": 1,
    "precio_unitario": 150.00
  }
]
```

---

## 9.6 Tabla: `papeleria_uploads` (Documentos Digitales)

```sql
CREATE TABLE papeleria_uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,             -- justificante, permiso, comprobante
    archivo_url VARCHAR(255) NOT NULL,
    tamaño_bytes INTEGER,
    estado VARCHAR(50) DEFAULT 'pendiente',         -- pendiente, revisado, aprobado, rechazado
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP,
    comentarios_admin TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (tamaño_bytes <= 5242880)                 -- Max 5MB
);

Índices:
- PRIMARY KEY (id)
- INDEX (user_id, estado)
```

---

## 9.7 Tabla: `orientacion` (Reportes y Consultas)

```sql
CREATE TABLE orientacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tipo_solicitud VARCHAR(50) NOT NULL,            -- reporte, queja, cita, buzón
    asunto VARCHAR(200),
    descripcion TEXT NOT NULL,
    archivo_adjunto VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'nuevo',             -- nuevo, en_progreso, resuelto
    prioridad VARCHAR(20) DEFAULT 'normal',         -- baja, normal, alta
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    respuesta_orientador TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

Índices:
- PRIMARY KEY (id)
- INDEX (user_id, estado)
- INDEX (fecha_creacion DESC)
```

---

## 9.8 Tabla: `auditoria` (Registro de Seguridad)

```sql
CREATE TABLE auditoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    accion VARCHAR(100) NOT NULL,                   -- login, logout, compra, cambio_perfil
    entidad VARCHAR(50),                            -- order, user, product
    id_entidad INTEGER,
    detalles TEXT,                                  -- JSON con cambios
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

Índices:
- PRIMARY KEY (id)
- INDEX (user_id, timestamp DESC)
- INDEX (accion)
```

---

## 9.9 Resumen de Relaciones

```
users (1) ────────────── (∞) sessions
users (1) ────────────── (∞) orders
users (1) ────────────── (∞) papeleria_uploads
users (1) ────────────── (∞) orientacion
users (1) ────────────── (∞) auditoria

products: tabla independiente (sin FK de users)

orders ──── contains ──── items_json (referencia a products.id)
```

---

# 10. DIAGRAMA MVC: ARQUITECTURA DE LA APLICACIÓN

## 10.1 Componentes del Patrón MVC

### **M = MODEL (Modelos de Datos)**
Ubicación: `/backend/app/models/`

```
FastAPI Models (Pydantic)
│
├─ User (email, username, rol, semestre)
├─ Session (token, fecha_expiracion, user_id)
├─ Product (nombre, precio, categoria, stock)
├─ Order (user_id, items, total, metodo_pago)
├─ Document (user_id, tipo, archivo_url, estado)
└─ Message (user_id, asunto, descripcion, tipo)

        ↓ (SQLAlchemy ORM)
        
SQLite Tables
├─ users
├─ sessions
├─ products
├─ orders
├─ papeleria_uploads
└─ orientacion
```

### **V = VIEW (Presentación / Interfaz)**
Ubicación: `/frontend/pages/` y `/frontend/js/`

```
HTML Pages (Vistas):
├─ login/index.html       → Formularios de login/registro
├─ principal/index.html   → Dashboard principal
├─ tienda/index.html      → Tienda de productos
└─ reset-password/index.html → Recuperar contraseña

JavaScript Modules:
├─ pages/
│  ├─ login.js            → Lógica de formularios
│  ├─ principal.js        → Inicializar dashboard
│  └─ tienda.js           → Inicializar tienda
│
├─ components/
│  ├─ carrito.js          → Carrito de compras
│  ├─ pago.js             → Métodos de pago
│  ├─ perfil.js           → Perfil de usuario
│  └─ modales.js          → Control de modales
│
└─ utils/
   ├─ storage.js          → LocalStorage
   ├─ toast.js            → Notificaciones
   └─ pdf.js              → Generación de PDFs
```

### **C = CONTROLLER (Controladores / Lógica de Negocio)**
Ubicación: `/backend/app/routers/`

```
FastAPI Routers (Controladores):

├─ auth.py (Autenticación)
│  ├─ POST /auth/login           → Validar credenciales
│  ├─ POST /auth/register        → Crear nuevo usuario
│  ├─ POST /auth/logout          → Cerrar sesión
│  ├─ GET  /auth/check-session   → Verificar token activo
│  └─ POST /auth/google-login    → OAuth con Google
│
├─ usuarios.py (Gestión de Usuarios)
│  ├─ GET  /usuarios/perfil      → Obtener datos del perfil
│  ├─ PUT  /usuarios/perfil      → Actualizar perfil
│  ├─ POST /usuarios/foto        → Subir foto de perfil
│  └─ GET  /usuarios/<id>        → Datos públicos del usuario
│
├─ tienda.py (E-Commerce)
│  ├─ GET  /tienda/productos           → Listar catálogo
│  ├─ GET  /tienda/productos/<id>      → Detalles de producto
│  ├─ POST /tienda/comprar             → Realizar compra
│  ├─ GET  /tienda/historial           → Ver compras del usuario
│  ├─ GET  /tienda/comprobante/<id>    → Descargar PDF
│  └─ GET  /tienda/ordenes             → Admin: todas las órdenes
│
├─ papeleria.py (Documentos)
│  ├─ POST /papeleria/subir            → Upload de documento
│  ├─ GET  /papeleria/mis-documentos   → Listar mis uploads
│  ├─ PUT  /papeleria/<id>/revisar     → Admin: revisar documento
│  └─ DELETE /papeleria/<id>           → Eliminar documento
│
└─ orientacion.py (Consultas)
   ├─ POST /orientacion/reporte        → Enviar reporte/queja
   ├─ GET  /orientacion/mis-reportes   → Listar mis reportes
   ├─ PUT  /orientacion/<id>/respuesta → Admin: responder reporte
   └─ GET  /orientacion/buzon          → Consultar respuestas
```

---

## 10.2 Flujo de Comunicación entre Capas

```
┌────────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Usuario)                      │
│                                                             │
│  Frontend: login.html / principal.html / tienda.html       │
│  ├─ HTML (Estructura)                                      │
│  ├─ CSS (Tailwind + Estilos Stitch)                        │
│  └─ JavaScript ES6 Modules                                │
└────────────────────────────┬────────────────────────────────┘
                             │
                    HTTP/CORS (Port 8000)
                    API Requests (JSON)
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│              BACKEND: FastAPI (Python)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Controllers (routers/)                              │  │
│  │ ├─ auth.py        → Gestiona login/logout           │  │
│  │ ├─ usuarios.py    → CRUD de perfiles                │  │
│  │ ├─ tienda.py      → Lógica de compras               │  │
│  │ ├─ papeleria.py   → Upload de documentos            │  │
│  │ └─ orientacion.py → Reportes y consultas            │  │
│  └─────────────────────────────────────────────────────┘  │
│           │                                                 │
│           ├─ Validación de datos (Pydantic)               │
│           ├─ Verificación de seguridad (JWT tokens)       │
│           ├─ Lógica de negocio (cálculos, estado)        │
│           └─ Inyección de dependencias (FastAPI)          │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Models (models/)                                    │  │
│  │ ├─ User, Session, Product, Order                    │  │
│  │ ├─ Document, Message, Audit                         │  │
│  │ └─ Schemas Pydantic para validación                 │  │
│  └─────────────────────────────────────────────────────┘  │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Database Layer (SQLAlchemy ORM)                     │  │
│  │ ├─ Queries a SQLite                                 │  │
│  │ ├─ Transacciones (ACID)                             │  │
│  │ └─ Relaciones entre tablas                          │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                    SQL Queries
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│         BASE DE DATOS: SQLite (cbtis258.db)                │
│                                                             │
│  ├─ users          → Información de cuentas               │
│  ├─ sessions       → Tokens activos                        │
│  ├─ products       → Catálogo de tienda                   │
│  ├─ orders         → Historial de compras                 │
│  ├─ papeleria_uploads → Documentos subidos                │
│  ├─ orientacion    → Reportes y consultas                 │
│  └─ auditoria      → Registro de seguridad                │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 10.3 Ejemplo: Flujo de Autenticación (End-to-End)

```
1. VISTA (Frontend)
   ┌────────────────────────────────┐
   │ Usuario entra en login.html    │
   │ Digita: usuario, contraseña    │
   │ Click [INICIA SESIÓN]          │
   └────────────────┬───────────────┘
                    │
2. CONTROLADOR (Frontend JavaScript)
   ┌────────────────────────────────┐
   │ pages/login.js:                │
   │ - Valida campos (requeridos)   │
   │ - Ejecuta auth.js:loginUser()  │
   └────────────────┬───────────────┘
                    │
3. HTTP REQUEST
   ┌────────────────────────────────┐
   │ POST /auth/login               │
   │ {                              │
   │   username: "juan.perez",      │
   │   password: "mypass123"        │
   │ }                              │
   └────────────────┬───────────────┘
                    │
4. BACKEND CONTROLADOR
   ┌────────────────────────────────┐
   │ auth.py:login_route():         │
   │ ├─ Recibe request              │
   │ ├─ Valida con Pydantic         │
   │ └─ Llama a User.login()        │
   └────────────────┬───────────────┘
                    │
5. MODELO (Backend)
   ┌────────────────────────────────┐
   │ models/User:                   │
   │ ├─ Consulta BD: SELECT * FROM  │
   │ │  users WHERE username=?      │
   │ ├─ Compara bcrypt hash         │
   │ ├─ Si es válido: crea Session  │
   │ └─ Genera JWT token            │
   └────────────────┬───────────────┘
                    │
6. DATABASE
   ┌────────────────────────────────┐
   │ SQLite Queries:                │
   │ SELECT * FROM users            │
   │ WHERE username = 'juan.perez'  │
   │                                │
   │ INSERT INTO sessions           │
   │ (user_id, token, ...)          │
   └────────────────┬───────────────┘
                    │
7. HTTP RESPONSE
   ┌────────────────────────────────┐
   │ 200 OK                         │
   │ {                              │
   │   status: "success",           │
   │   token: "eyJhbGc...",         │
   │   user_id: 5,                  │
   │   email: "juan@cbtis.mx"       │
   │ }                              │
   └────────────────┬───────────────┘
                    │
8. VISTA (Frontend - Actualización)
   ┌────────────────────────────────┐
   │ javascript:                    │
   │ ├─ Guarda token en localStorage│
   │ ├─ Ejecuta pageTransition.js   │
   │ └─ Redirige a principal.html   │
   └────────────────────────────────┘
```

---

## 10.4 Tabla: Funciones por Componente

| Componente | Ubicación | Función Principal | Entrada | Salida |
|------------|-----------|-------------------|---------|--------|
| **Usuario** | login.html | Interfaz de login | Credenciales | Formulario enviado |
| **LoginJS** | pages/login.js | Valida y envía POST | Form data | HTTP request |
| **AuthAPI** | api/auth.js | Gestiona fetch | credentials | Token + response |
| **AuthRouter** | backend/auth.py | Valida y autentica | username, password | JWT token |
| **UserModel** | backend/models.py | Query de usuario | usuario_id | Objeto User |
| **SQLite** | cbtis258.db | Almacena datos | SQL query | Resultado consulta |

---

## 10.5 Dependencias y Flujo de Datos

```
Frontend (DOM)
    ↓ (import/export ES6)
pages/login.js ─────────→ components/carrito.js
    ↓ (fetch)             ↓ (import)
api/auth.js ────────────→ utils/toast.js
    ↓ (HTTP)
Backend (FastAPI)
    ├─ router: auth.py
    │   ├─ dependency: verify_token()
    │   └─ service: authenticate_user()
    │
    ├─ model: User (Pydantic)
    │   └─ schema validation
    │
    ├─ database: SQLAlchemy ORM
    │   └─ tables mapping
    │
    └─ sqlite: cbtis258.db
           ├─ users table
           ├─ sessions table
           └─ audit table
```

---

## 10.6 Resumen de Responsabilidades

### **MODELO (M)**
- ✅ Define estructura de datos (tablas SQL, Pydantic schemas)
- ✅ Contiene lógica de validación
- ✅ Maneja relaciones entre datos
- ✅ NO tiene lógica de presentación

### **VISTA (V)**
- ✅ Muestra datos al usuario (HTML + CSS)
- ✅ Captura entrada del usuario (formularios, clicks)
- ✅ Renderiza respuestas del servidor
- ✅ NO contiene lógica de negocio

### **CONTROLADOR (C)**
- ✅ Recibe requests HTTP
- ✅ Coordina entre Modelo y Vista
- ✅ Ejecuta lógica de negocio
- ✅ Retorna respuestas (JSON)
- ✅ Maneja errores y validaciones

---

**Proyecto modernizado y documentado: Mayo 2026**
