# 📚 Documentación Completa de la API - CBTis 258 Servicios Financieros

## 📖 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Configuración y Acceso](#configuración-y-acceso)
3. [Autenticación](#autenticación)
4. [Endpoints de Autenticación](#endpoints-de-autenticación)
5. [Endpoints de Dashboard](#endpoints-de-dashboard)
6. [Endpoints de Tienda](#endpoints-de-tienda)
7. [Modelos de Datos](#modelos-de-datos)
8. [Códigos de Error](#códigos-de-error)
9. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Introducción

**API Base URL:** `http://localhost:8000`

**Documentación Interactiva:** `http://localhost:8000/docs` (Swagger UI)

**ReDoc:** `http://localhost:8000/redoc` (Documentación alternativa)

### Stack Tecnológico
- **Framework:** FastAPI 0.115.0
- **Base de Datos:** SQLite (`cbtis258.db`)
- **ORM:** SQLAlchemy 2.0.36
- **Validación:** Pydantic 2.10.3
- **Seguridad:** JWT (JSON Web Tokens), bcrypt
- **Servidor:** Uvicorn 0.32.0

### Características Principales
✅ Autenticación con email/contraseña  
✅ Integración con Google OAuth  
✅ Recuperación de contraseña segura  
✅ Verificación por OTP (One-Time Password)  
✅ Gestión de compras y tienda escolar  
✅ Dashboard de pagos  
✅ CORS configurado  
✅ Logging completo  

---

## Configuración y Acceso

### Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto `backend/` con las siguientes variables:

```env
# Base de Datos
DATABASE_URL=sqlite:///./cbtis258.db

# Seguridad
SECRET_KEY=tu_clave_secreta_super_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 días

# CORS
FRONTEND_URL=http://localhost:5501

# Email (Gmail SMTP)
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_contraseña_app_de_google
MAIL_FROM=tu_email@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
```

### Iniciar el Servidor

```bash
# Activar entorno virtual
source .venv/bin/activate  # Linux/MacOS
# o
.venv\Scripts\activate  # Windows

# Instalar dependencias (si es primera vez)
pip install -r backend/requirements.txt

# Ejecutar el servidor
cd backend
uvicorn app.main:app --reload
```

El servidor estará disponible en `http://localhost:8000`

---

## Autenticación

### ¿Cómo funciona la autenticación?

1. **Token JWT**: Después de un login/registro exitoso, el servidor devuelve un token JWT
2. **Almacenamiento**: El frontend debe guardar este token (localStorage o sessionStorage)
3. **Uso**: Incluir el token en el header `Authorization: Bearer {token}` en cada solicitud protegida
4. **Expiración**: El token expira en 7 días (configurable en `.env`)

### Headers Requeridos

Para rutas protegidas, incluye el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Flujo de Autenticación

```
┌─────────────────────────────────────────────────────┐
│          FLUJOS DE AUTENTICACIÓN                    │
├─────────────────────────────────────────────────────┤
│ 1. REGISTRO SIN OTP                                 │
│    POST /api/auth/register                          │
│    ├─ Validar email único                           │
│    ├─ Hashear contraseña                            │
│    ├─ Guardar usuario en BD                         │
│    ├─ Enviar email de bienvenida                    │
│    └─ Retornar token JWT                            │
│                                                     │
│ 2. REGISTRO CON OTP (MÁS SEGURO)                   │
│    POST /api/auth/register-send-otp                 │
│    ├─ Validar email único                           │
│    ├─ Generar código OTP (6 dígitos)                │
│    ├─ Guardar en BD temporal (2 minutos)            │
│    └─ Enviar OTP por email                          │
│    ↓                                                │
│    POST /api/auth/register-verify-otp               │
│    ├─ Validar código OTP                            │
│    ├─ Verificar no ha expirado                      │
│    ├─ Crear usuario final                           │
│    └─ Retornar token JWT                            │
│                                                     │
│ 3. LOGIN                                            │
│    POST /api/auth/login                             │
│    ├─ Validar credenciales                          │
│    ├─ Actualizar último login                       │
│    └─ Retornar token JWT                            │
│                                                     │
│ 4. LOGIN CON GOOGLE                                 │
│    POST /api/auth/login/google                      │
│    ├─ Verificar token con servidores Google         │
│    ├─ Crear o actualizar usuario                    │
│    └─ Retornar token JWT                            │
│                                                     │
│ 5. RECUPERACIÓN DE CONTRASEÑA                       │
│    POST /api/auth/forgot-password                   │
│    ├─ Buscar usuario por email                      │
│    ├─ Generar token de reset seguro                 │
│    ├─ Token válido por 1 hora                       │
│    └─ Enviar link por email                         │
│    ↓                                                │
│    POST /api/auth/reset-password                    │
│    ├─ Validar token                                 │
│    ├─ Hashear nueva contraseña                      │
│    ├─ Marcar token como usado                       │
│    └─ Confirmar cambio                              │
└─────────────────────────────────────────────────────┘
```

---

## Endpoints de Autenticación

### 1. Registro Simple (Sin OTP)

**POST** `/api/auth/register`

Registra un nuevo usuario con email y contraseña.

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@cbtis258.edu.mx",
  "password": "MiContraseña123!"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@cbtis258.edu.mx",
    "profile_picture": null,
    "is_verified": true,
    "created_at": "2026-06-09T10:30:00"
  }
}
```

**Errores:**
- `400 Bad Request`: Email ya registrado
- `422 Unprocessable Entity`: Validación fallida

---

### 2. Enviar OTP para Registro

**POST** `/api/auth/register-send-otp`

Inicia el flujo de registro con verificación por OTP.

**Request Body:**
```json
{
  "nombre": "María García",
  "email": "maria@cbtis258.edu.mx",
  "password": "ContraseñaFuerte123",
  "rol": "estudiante",
  "semestre": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Código de verificación enviado",
  "email": "maria@cbtis258.edu.mx"
}
```

**Detalles:**
- Código OTP válido por **2 minutos**
- Se envía por email
- Formato: 6 dígitos

---

### 3. Verificar OTP y Crear Usuario

**POST** `/api/auth/register-verify-otp`

Verifica el código OTP y crea el usuario final.

**Request Body:**
```json
{
  "email": "maria@cbtis258.edu.mx",
  "code": "123456"
}
```

**Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 2,
    "nombre": "María García",
    "email": "maria@cbtis258.edu.mx",
    "profile_picture": null,
    "is_verified": true,
    "created_at": "2026-06-09T10:35:00"
  }
}
```

**Errores:**
- `400 Bad Request`: Código incorrecto
- `400 Bad Request`: Código expirado
- `400 Bad Request`: Email ya registrado

---

### 4. Login con Email y Contraseña

**POST** `/api/auth/login`

Autentica un usuario con credenciales.

**Request Body:**
```json
{
  "email": "juan@cbtis258.edu.mx",
  "password": "MiContraseña123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@cbtis258.edu.mx",
    "profile_picture": null,
    "is_verified": true,
    "created_at": "2026-06-09T10:30:00"
  }
}
```

**Errores:**
- `401 Unauthorized`: Email o contraseña incorrectos

---

### 5. Login con Google OAuth

**POST** `/api/auth/login/google`

Autentica un usuario usando su cuenta de Google.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjExIn0.eyJhdWQiOiJjbGllbnRfaWQuYXBwcy5nb29nbGV1..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 3,
    "nombre": "Carlos López",
    "email": "carlos@gmail.com",
    "profile_picture": "https://lh3.googleusercontent.com/a/...",
    "is_verified": true,
    "created_at": "2026-06-09T11:00:00"
  }
}
```

**Detalles:**
- Si el usuario existe por email, se actualiza con datos de Google
- Crea nuevo usuario si no existe
- Automáticamente verificado

---

### 6. Solicitar Recuperación de Contraseña

**POST** `/api/auth/forgot-password`

Envía un email con link para resetear contraseña.

**Request Body:**
```json
{
  "email": "juan@cbtis258.edu.mx"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Si el correo existe, recibirás un email con instrucciones"
}
```

**Detalles:**
- Por seguridad, siempre devuelve success (aunque no exista el email)
- El token es válido por **1 hora**
- El email contiene un link con el token

---

### 7. Resetear Contraseña

**POST** `/api/auth/reset-password`

Cambia la contraseña usando el token enviado por email.

**Request Body:**
```json
{
  "token": "abc123xyz789...",
  "password": "NuevaContraseña123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores:**
- `400 Bad Request`: Token inválido o expirado
- `422 Unprocessable Entity`: Contraseña muy corta (<6 caracteres)

---

### 8. Verificar Sesión Activa

**GET** `/api/auth/check-session`

Verifica si hay una sesión activa y retorna datos del usuario.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@cbtis258.edu.mx",
  "profile_picture": null,
  "is_verified": true,
  "created_at": "2026-06-09T10:30:00"
}
```

**Errores:**
- `401 Unauthorized`: Token inválido o ausente
- `401 Unauthorized`: Token expirado

---

### 9. Logout

**POST** `/api/auth/logout`

Cierra la sesión (principalmente para limpiar en servidor).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Nota:** El frontend también debe eliminar el token del localStorage.

---

## Endpoints de Dashboard

### 1. Verificar Servidor

**GET** `/api/dashboard/ping`

Endpoint de prueba para verificar que el router funciona.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "🏠 Router de dashboard funcionando",
  "router": "dashboard"
}
```

---

### 📋 Próximos Endpoints (En Desarrollo)

Los siguientes endpoints están planeados pero aún no implementados:

- **GET** `/api/dashboard/stats` - Obtener estadísticas del usuario
- **GET** `/api/dashboard/payments` - Historial de pagos
- **POST** `/api/dashboard/payment` - Procesar pago

---

## Endpoints de Tienda

### 1. Verificar Servidor

**GET** `/api/tienda/ping`

Endpoint de prueba para verificar que el router funciona.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "🛒 Router de tienda funcionando",
  "router": "tienda"
}
```

---

### 📋 Próximos Endpoints (En Desarrollo)

Los siguientes endpoints están planeados pero aún no implementados:

- **GET** `/api/tienda/productos` - Listar productos
- **GET** `/api/tienda/productos/{id}` - Detalle de producto
- **POST** `/api/tienda/carrito` - Agregar al carrito
- **GET** `/api/tienda/carrito` - Ver carrito
- **POST** `/api/tienda/checkout` - Procesar compra

---

## Modelos de Datos

### Modelo Usuario (User)

**Tabla:** `users`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | ID único (PK) |
| `nombre` | String(100) | Nombre completo |
| `email` | String(120) | Email único |
| `password_hash` | String(200) | Hash bcrypt (nullable para Google) |
| `google_id` | String(100) | ID de Google (si usa OAuth) |
| `profile_picture` | String(300) | URL de foto de perfil |
| `is_verified` | Boolean | ¿Está verificado? |
| `created_at` | DateTime | Fecha de creación |
| `last_login` | DateTime | Último login |

**Relaciones:**
- Muchos a Uno: `compras` (User tiene muchas Compras)
- Muchos a Uno: `password_resets` (User tiene muchos resets)

---

### Modelo Compra (Purchase)

**Tabla:** `compras`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | ID único (PK) |
| `user_id` | Integer | ID del usuario (FK) |
| `total` | Float | Total de la compra |
| `estado` | String(50) | Pendiente/Completado/Cancelado |
| `metodo_pago` | String(50) | Tarjeta/Efectivo/Transferencia |
| `comprobante_url` | String(300) | URL del comprobante |
| `factura_url` | String(300) | URL de la factura PDF |
| `created_at` | DateTime | Fecha de compra |

**Estados permitidos:**
- `Pendiente` - Esperando confirmación
- `Completado` - Pago confirmado
- `Cancelado` - Compra cancelada

---

### Modelo ProductoCompra (Purchase Item)

**Tabla:** `productos_compra`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | ID único (PK) |
| `compra_id` | Integer | ID de la compra (FK) |
| `nombre` | String(200) | Nombre del producto |
| `descripcion` | Text | Descripción |
| `cantidad` | Integer | Cantidad |
| `precio_unitario` | Float | Precio por unidad |
| `precio_total` | Float | Precio total (cantidad × unitario) |

---

### Modelo PasswordReset

**Tabla:** `password_resets`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | ID único (PK) |
| `user_id` | Integer | ID del usuario (FK) |
| `token` | String(100) | Token seguro único |
| `created_at` | DateTime | Fecha de creación |
| `expires_at` | DateTime | Fecha de expiración (1 hora) |
| `used` | Boolean | ¿Ya fue usado? |

---

### Modelo OTPCode (Temporal)

**Tabla:** `otp_codes` (Base de datos separada)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Integer | ID único (PK) |
| `email` | String(120) | Email del usuario |
| `code` | String(6) | Código OTP (6 dígitos) |
| `password_hash` | String(200) | Hash de contraseña (temporal) |
| `nombre` | String(100) | Nombre (temporal) |
| `rol` | String(50) | Rol (temporal) |
| `semestre` | Integer | Semestre (temporal) |
| `created_at` | DateTime | Fecha de creación |
| `expires_at` | DateTime | Fecha de expiración (2 minutos) |

---

## Códigos de Error

### Errores Comunes

| Código | Descripción | Ejemplo |
|--------|------------|---------|
| **400** | Bad Request | Email ya registrado, validación fallida |
| **401** | Unauthorized | Token inválido, credenciales incorrectas |
| **404** | Not Found | Recurso no encontrado |
| **422** | Unprocessable Entity | Datos inválidos en el request |
| **500** | Internal Server Error | Error del servidor |

### Estructura de Error

```json
{
  "detail": "Descripción del error"
}
```

### Errores Específicos de Autenticación

```json
{
  "detail": "Este correo ya está registrado"
}
```

```json
{
  "detail": "Email o contraseña incorrectos"
}
```

```json
{
  "detail": "No autenticado"
}
```

```json
{
  "detail": "Código incorrecto"
}
```

```json
{
  "detail": "El código ha expirado"
}
```

---

## Ejemplos de Uso

### JavaScript (Fetch API)

#### Registro

```javascript
const response = await fetch('http://localhost:8000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Juan Pérez',
    email: 'juan@cbtis258.edu.mx',
    password: 'MiContraseña123!'
  })
});

const data = await response.json();

if (response.ok) {
  // Guardar token
  localStorage.setItem('access_token', data.access_token);
  console.log('Usuario registrado:', data.user);
} else {
  console.error('Error:', data.detail);
}
```

#### Login

```javascript
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'juan@cbtis258.edu.mx',
    password: 'MiContraseña123!'
  })
});

const data = await response.json();

if (response.ok) {
  localStorage.setItem('access_token', data.access_token);
  console.log('Login exitoso:', data.user);
}
```

#### Verificar Sesión

```javascript
const token = localStorage.getItem('access_token');

const response = await fetch('http://localhost:8000/api/auth/check-session', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.ok) {
  const user = await response.json();
  console.log('Usuario actual:', user);
} else {
  console.log('Sesión no válida');
}
```

#### Logout

```javascript
const token = localStorage.getItem('access_token');

await fetch('http://localhost:8000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Limpiar storage
localStorage.removeItem('access_token');
console.log('Sesión cerrada');
```

---

### cURL

#### Registro

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@cbtis258.edu.mx",
    "password": "MiContraseña123!"
  }'
```

#### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@cbtis258.edu.mx",
    "password": "MiContraseña123!"
  }'
```

#### Verificar Sesión

```bash
curl -X GET http://localhost:8000/api/auth/check-session \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Python (Requests)

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Registro
response = requests.post(
    f"{BASE_URL}/auth/register",
    json={
        "nombre": "Juan Pérez",
        "email": "juan@cbtis258.edu.mx",
        "password": "MiContraseña123!"
    }
)

data = response.json()
token = data['access_token']

# Verificar sesión
response = requests.get(
    f"{BASE_URL}/auth/check-session",
    headers={"Authorization": f"Bearer {token}"}
)

print(response.json())
```

---

## Flujo Completo de Ejemplo

### Caso: Nuevo Usuario se Registra y Accede al Dashboard

**Paso 1: Registro**
```
POST /api/auth/register
→ Se crea usuario en BD
→ Se envía email de bienvenida
→ Se retorna token JWT
```

**Paso 2: Frontend guarda token**
```javascript
localStorage.setItem('access_token', data.access_token);
```

**Paso 3: Usuario navega a dashboard**
```
Frontend verifica token llamando a:
GET /api/auth/check-session (con Authorization header)
→ Si es válido, muestra dashboard
→ Si no, redirige a login
```

**Paso 4: Token expira (después de 7 días)**
```
Usuario intenta acceder
GET /api/auth/check-session
→ Retorna 401 Unauthorized
→ Frontend redirige a login
```

---

## Mejores Prácticas

### ✅ DO's (Haz esto)

- ✅ Usar HTTPS en producción
- ✅ Almacenar tokens en httpOnly cookies o localStorage seguro
- ✅ Incluir el token en cada request protegido
- ✅ Validar email antes de mostrar datos
- ✅ Limpiar token al logout
- ✅ Usar variables de entorno para configuración sensible

### ❌ DON'Ts (No hagas esto)

- ❌ Expongan el SECRET_KEY en el código
- ❌ Enviar contraseñas en URLs
- ❌ Guardar tokens en localStorage inseguro (para apps críticas)
- ❌ Usar contraseñas débiles
- ❌ Confiar solo en validación del frontend
- ❌ Olvidar renovar tokens expirados

---

## Testing

### Probar endpoints con Postman/Thunder Client

1. Importar colección desde `/docs` (Swagger)
2. O crear manualmente:

**POST** `/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON)

**GET** `/api/auth/check-session`
- Headers: `Authorization: Bearer {token}`

---

## Soporte y Debugging

### Ver logs en tiempo real

```bash
# Terminal 1: Ver logs del backend
tail -f backend.log
```

### Habilitar DEBUG mode

En `backend/app/config.py`:
```python
DEBUG = True  # Más información en errores
```

### Verificar BD

```bash
# Con sqlite3
sqlite3 backend/cbtis258.db
sqlite> SELECT * FROM users;
sqlite> .tables  # Ver todas las tablas
```

---

## Roadmap de Desarrollo

### Fase 1: ✅ Autenticación (Completada)
- [x] Registro simple
- [x] Login
- [x] Google OAuth
- [x] OTP
- [x] Recuperación de contraseña

### Fase 2: 🚧 Dashboard (En Desarrollo)
- [ ] Estadísticas de pagos
- [ ] Historial de compras
- [ ] Perfil de usuario

### Fase 3: 🔄 Tienda (En Desarrollo)
- [ ] Listado de productos
- [ ] Carrito de compras
- [ ] Checkout
- [ ] Generación de facturas

### Fase 4: 📊 Admin (Futuro)
- [ ] Panel de administración
- [ ] Reporte de ventas
- [ ] Gestión de usuarios

---

## Contacto y Soporte

Para reportar bugs o sugerencias:
- 📧 Email: soporte@cbtis258.edu.mx
- 🐛 Issues: GitHub Issues
- 💬 Discussiones: GitHub Discussions

---

**Versión:** 1.0.0  
**Última actualización:** Junio 2026  
**Autor:** Equipo de Desarrollo CBTis 258
