from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import secrets
import random
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from bson import ObjectId

# Importamos 'db' directamente de tu nuevo database.py para MongoDB
from ..database import db 
from ..schemas.user import (
    UserRegister, UserRegisterOTP, VerifyOTP, UserLogin, GoogleLogin, UserResponse, 
    Token, ForgotPassword, ResetPassword
)
from ..utils.security import hash_password, verify_password, create_access_token
from ..utils.email import send_welcome_email, send_password_reset_email, send_otp_email
from ..config import settings
from ..dependencies import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"]
)

@router.get("/ping")
async def ping():
    """Ruta de prueba"""
    return {
        "success": True,
        "message": "🔐 Router de autenticación conectado a MongoDB",
        "router": "auth"
    }

# ============================================
# REGISTRO
# ============================================

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Registrar nuevo usuario con email y contraseña"""
    
    # Verificar si el email ya existe
    existing_user = await db.usuarios.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este correo ya está registrado"
        )
    
    # Crear nuevo usuario en formato Diccionario (Documento Mongo)
    new_user = {
        "nombre": user_data.nombre,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "is_verified": True,  # Auto-verificado en desarrollo
        "role": "alumno",
        "saldo": 0.0,
        "created_at": datetime.utcnow(),
        "google_id": None,
        "profile_picture": None,
        "last_login": None
    }
    
    resultado = await db.usuarios.insert_one(new_user)
    user_id = str(resultado.inserted_id)
    
    print(f"✅ Usuario registrado en Mongo: {new_user['email']}")
    
    # Enviar email de bienvenida
    try:
        await send_welcome_email(new_user["email"], new_user["nombre"])
    except Exception as e:
        print(f"⚠️ Error enviando email: {str(e)}")
    
    # Crear token JWT
    access_token = create_access_token(data={"sub": new_user["email"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "nombre": new_user["nombre"],
            "email": new_user["email"],
            "profile_picture": new_user["profile_picture"],
            "is_verified": new_user["is_verified"],
            "created_at": new_user["created_at"].isoformat()
        }
    }

# ============================================
# REGISTRO OTP
# ============================================

@router.post("/register-send-otp", status_code=status.HTTP_200_OK)
async def register_send_otp(user_data: UserRegisterOTP):
    """Valida que no exista, crea OTP, lo guarda y manda email"""
    
    existing_user = await db.usuarios.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este correo ya está registrado"
        )
        
    # Limpiar códigos OTP anteriores (y vencidos) para este email
    await db.otps.delete_many({"email": user_data.email})
    await db.otps.delete_many({"expires_at": {"$lt": datetime.utcnow()}})
    
    # Generar nuevo OTP
    code = f"{random.randint(0, 999999):06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=2)
    
    # Guardar en Mongo temporalmente
    new_otp = {
        "email": user_data.email,
        "code": code,
        "password_hash": hash_password(user_data.password),
        "nombre": user_data.nombre,
        "rol": user_data.rol,
        "semestre": user_data.semestre,
        "expires_at": expires_at
    }
    await db.otps.insert_one(new_otp)
    
    # Enviar el correo
    try:
        await send_otp_email(user_data.email, user_data.nombre, code)
        print(f"✅ OTP email enviado a: {user_data.email} con código {code}")
    except Exception as e:
        print(f"⚠️ Error enviando email OTP: {str(e)}")
    
    return {
        "success": True,
        "message": "Código de verificación enviado",
        "email": user_data.email
    }

@router.post("/register-verify-otp", status_code=status.HTTP_201_CREATED)
async def register_verify_otp(verification_data: VerifyOTP):
    """Verifica OTP y crea usuario"""
    
    otp_record = await db.otps.find_one({
        "email": verification_data.email,
        "code": verification_data.code
    })
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="Código incorrecto")
        
    if otp_record["expires_at"] < datetime.utcnow():
        await db.otps.delete_one({"_id": otp_record["_id"]})
        raise HTTPException(status_code=400, detail="El código ha expirado")
    
    # Verificar colisión de último momento
    existing_user = await db.usuarios.find_one({"email": verification_data.email})
    if existing_user:
        await db.otps.delete_one({"_id": otp_record["_id"]})
        raise HTTPException(status_code=400, detail="Este correo ya está registrado")
    
    # Crear usuario final
    new_user = {
        "nombre": otp_record["nombre"],
        "email": otp_record["email"],
        "password_hash": otp_record["password_hash"],
        "is_verified": True,
        "role": otp_record.get("rol", "alumno"),
        "saldo": 0.0,
        "created_at": datetime.utcnow(),
        "google_id": None,
        "profile_picture": None,
        "last_login": datetime.utcnow()
    }
    resultado = await db.usuarios.insert_one(new_user)
    user_id = str(resultado.inserted_id)
    
    print(f"✅ Usuario registrado tras OTP: {new_user['email']}")
    
    try:
        await send_welcome_email(new_user["email"], new_user["nombre"])
    except Exception as e:
        print(f"⚠️ Error enviando email de bienvenida: {str(e)}")
    
    # Eliminar el OTP usado
    await db.otps.delete_one({"_id": otp_record["_id"]})
    
    access_token = create_access_token(data={"sub": new_user["email"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "nombre": new_user["nombre"],
            "email": new_user["email"],
            "profile_picture": new_user["profile_picture"],
            "is_verified": new_user["is_verified"],
            "created_at": new_user["created_at"].isoformat()
        }
    }

# ============================================
# LOGIN
# ============================================

@router.post("/login")
async def login(credentials: UserLogin):
    """Login con email y contraseña"""
    
    user = await db.usuarios.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Actualizar último login
    await db.usuarios.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    print(f"✅ Login exitoso: {user['email']}")
    
    access_token = create_access_token(data={"sub": user["email"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "nombre": user["nombre"],
            "email": user["email"],
            "profile_picture": user.get("profile_picture"),
            "is_verified": user.get("is_verified", True),
            "created_at": user["created_at"].isoformat()
        }
    }

# ============================================
# LOGIN CON GOOGLE
# ============================================

@router.post("/login/google")
async def google_login(google_data: GoogleLogin):
    """Login con Google OAuth"""
    try:
        idinfo = id_token.verify_oauth2_token(
            google_data.token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        if idinfo['aud'] != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        google_id = idinfo['sub']
        email = idinfo['email']
        nombre = idinfo.get('name', '')
        profile_picture = idinfo.get('picture', '')
        
        # Buscar usuario por Google ID o email ($or en Mongo)
        user = await db.usuarios.find_one({
            "$or": [{"google_id": google_id}, {"email": email}]
        })
        
        if user:
            # Actualizar datos si faltaban
            update_data = {"last_login": datetime.utcnow(), "is_verified": True}
            if not user.get("google_id"):
                update_data["google_id"] = google_id
            if not user.get("profile_picture"):
                update_data["profile_picture"] = profile_picture
                
            await db.usuarios.update_one(
                {"_id": user["_id"]},
                {"$set": update_data}
            )
            user_id = str(user["_id"])
            created_at = user["created_at"]
        else:
            # Crear nuevo usuario con Google
            new_user = {
                "nombre": nombre,
                "email": email,
                "google_id": google_id,
                "profile_picture": profile_picture,
                "is_verified": True,
                "password_hash": None,
                "role": "alumno",
                "saldo": 0.0,
                "created_at": datetime.utcnow(),
                "last_login": datetime.utcnow()
            }
            resultado = await db.usuarios.insert_one(new_user)
            user_id = str(resultado.inserted_id)
            created_at = new_user["created_at"]
            user = new_user # Para poder leer los datos abajo
        
        print(f"✅ Login Google exitoso: {email}")
        
        access_token = create_access_token(data={"sub": email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "nombre": nombre,
                "email": email,
                "profile_picture": profile_picture,
                "is_verified": True,
                "created_at": created_at.isoformat()
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token de Google inválido: {str(e)}"
        )

# ============================================
# RECUPERACIÓN DE CONTRASEÑA
# ============================================

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword):
    """Solicitar recuperación de contraseña"""
    
    user = await db.usuarios.find_one({"email": data.email})
    
    if not user:
        return {"success": True, "message": "Si el correo existe, recibirás un email con instrucciones"}
    
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Guardar token en Mongo (colección password_resets)
    await db.password_resets.insert_one({
        "user_id": str(user["_id"]),
        "token": reset_token,
        "expires_at": expires_at,
        "used": False,
        "created_at": datetime.utcnow()
    })
    
    try:
        await send_password_reset_email(user["email"], user["nombre"], reset_token)
        print(f"✅ Email de recuperación enviado a: {user['email']}")
    except Exception as e:
        print(f"⚠️ Error enviando email: {str(e)}")
    
    return {"success": True, "message": "Si el correo existe, recibirás un email con instrucciones"}

@router.post("/reset-password")
async def reset_password(data: ResetPassword):
    """Resetear contraseña con token"""
    
    # Buscar token válido
    password_reset = await db.password_resets.find_one({
        "token": data.token,
        "used": False,
        "expires_at": {"$gt": datetime.utcnow()} # Que sea mayor a la hora actual
    })
    
    if not password_reset:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    
    # Actualizar contraseña
    await db.usuarios.update_one(
        {"_id": ObjectId(password_reset["user_id"])},
        {"$set": {"password_hash": hash_password(data.password)}}
    )
    
    # Marcar token como usado
    await db.password_resets.update_one(
        {"_id": password_reset["_id"]},
        {"$set": {"used": True}}
    )
    
    print("✅ Contraseña actualizada exitosamente")
    return {"success": True, "message": "Contraseña actualizada exitosamente"}

# ============================================
# VERIFICAR SESIÓN
# ============================================

@router.get("/check-session")
async def check_session(current_user: dict = Depends(get_current_user)):
    """Verificar si hay una sesión activa"""
    # current_user ahora será un diccionario de Mongo, extraemos los datos
    return {
        "id": str(current_user["_id"]),
        "nombre": current_user["nombre"],
        "email": current_user["email"],
        "profile_picture": current_user.get("profile_picture"),
        "is_verified": current_user.get("is_verified", False),
        "created_at": current_user["created_at"].isoformat(),
        "role": current_user.get("role", "alumno"),
        "saldo": current_user.get("saldo", 0.0)
    }

# ============================================
# LOGOUT
# ============================================

@router.post("/logout")
async def logout():
    """Cerrar sesión"""
    return {"success": True, "message": "Sesión cerrada exitosamente"}