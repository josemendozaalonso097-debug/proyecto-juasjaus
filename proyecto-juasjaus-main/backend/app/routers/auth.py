from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from ..database import get_db
from ..database_otp import get_otp_db
from ..models.user import User, PasswordReset
from ..models.otp import OTPCode
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
        "message": "🔐 Router de autenticación funcionando",
        "router": "auth"
    }

# ============================================
# REGISTRO
# ============================================

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Registrar nuevo usuario con email y contraseña"""
    
    # Verificar si el email ya existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este correo ya está registrado"
        )
    
    # Crear nuevo usuario
    new_user = User(
        nombre=user_data.nombre,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        is_verified=True  # Auto-verificado en desarrollo
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"✅ Usuario registrado: {new_user.email}")
    
    # Enviar email de bienvenida (async, no bloquea)
    try:
        await send_welcome_email(new_user.email, new_user.nombre)
    except Exception as e:
        print(f"⚠️ Error enviando email: {str(e)}")
    
    # Crear token JWT
    access_token = create_access_token(data={"sub": new_user.email})
    
    # Crear respuesta con headers CORS explícitos
    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "nombre": new_user.nombre,
            "email": new_user.email,
            "profile_picture": new_user.profile_picture,
            "is_verified": new_user.is_verified,
            "created_at": new_user.created_at.isoformat()
        }
    }
    
    return response_data


# ============================================
# REGISTRO OTP
# ============================================

import random

@router.post("/register-send-otp", status_code=status.HTTP_200_OK)
async def register_send_otp(user_data: UserRegisterOTP, db: Session = Depends(get_db), otp_db: Session = Depends(get_otp_db)):
    """Validates user doesn't exist, creates an OTP, stores it, and sends the email"""
    # 1. Verificar si el email ya existe en User
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este correo ya está registrado"
        )
        
    # 2. Limpiar códigos OTP anteriores para este email
    otp_db.query(OTPCode).filter(OTPCode.email == user_data.email).delete()
    # Y limpiar los vencidos de paso
    otp_db.query(OTPCode).filter(OTPCode.expires_at < datetime.utcnow()).delete()
    otp_db.commit()
    
    # 3. Generar nuevo OTP
    code = f"{random.randint(0, 999999):06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=2)
    
    # 4. Guardar en OTP DB temporalmente todo el registro
    new_otp = OTPCode(
        email=user_data.email,
        code=code,
        password_hash=hash_password(user_data.password),
        nombre=user_data.nombre,
        rol=user_data.rol,
        semestre=user_data.semestre,
        expires_at=expires_at
    )
    otp_db.add(new_otp)
    otp_db.commit()
    
    # 5. Enviar el correo con OTP
    try:
        await send_otp_email(user_data.email, user_data.nombre, code)
        print(f"✅ OTP email enviado a: {user_data.email} con código {code}")
    except Exception as e:
        print(f"⚠️ Error enviando email OTP: {str(e)}")
        # Seguimos igual para el flujo dev, you could return an error here
    
    return {
        "success": True,
        "message": "Código de verificación enviado",
        "email": user_data.email
    }

@router.post("/register-verify-otp", status_code=status.HTTP_201_CREATED)
async def register_verify_otp(verification_data: VerifyOTP, db: Session = Depends(get_db), otp_db: Session = Depends(get_otp_db)):
    """Verifies OTP, and if valid, creates the user and logs them in."""
    # 1. Obtener el código
    otp_record = otp_db.query(OTPCode).filter(
        OTPCode.email == verification_data.email,
        OTPCode.code == verification_data.code
    ).first()
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código incorrecto"
        )
        
    if otp_record.expires_at < datetime.utcnow():
        otp_db.delete(otp_record)
        otp_db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código ha expirado"
        )
    
    # 2. Verificar que no se haya registrado justo en el medio
    existing_user = db.query(User).filter(User.email == verification_data.email).first()
    if existing_user:
        otp_db.delete(otp_record)
        otp_db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este correo ya está registrado"
        )
    
    # 3. Crear el usuario final en la BD principal
    new_user = User(
        nombre=otp_record.nombre,
        email=otp_record.email,
        password_hash=otp_record.password_hash,
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"✅ Usuario registrado exitosamente tras OTP: {new_user.email}")
    
    # Enviar email de bienvenida (async, no bloquea)
    try:
        await send_welcome_email(new_user.email, new_user.nombre)
    except Exception as e:
        print(f"⚠️ Error enviando email de bienvenida: {str(e)}")
    
    # 4. Eliminar el OTP
    otp_db.delete(otp_record)
    otp_db.commit()
    
    # 5. Login / Devolver Token
    access_token = create_access_token(data={"sub": new_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "nombre": new_user.nombre,
            "email": new_user.email,
            "profile_picture": new_user.profile_picture,
            "is_verified": new_user.is_verified,
            "created_at": new_user.created_at.isoformat()
        }
    }


# ============================================
# LOGIN
# ============================================

@router.post("/login")
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login con email y contraseña"""
    
    # Buscar usuario
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Actualizar último login
    user.last_login = datetime.utcnow()
    db.commit()
    
    print(f"✅ Login exitoso: {user.email}")
    
    # Crear token JWT
    access_token = create_access_token(data={"sub": user.email})
    
    # Crear respuesta con headers CORS explícitos
    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nombre": user.nombre,
            "email": user.email,
            "profile_picture": user.profile_picture,
            "is_verified": user.is_verified,
            "created_at": user.created_at.isoformat()
        }
    }
    
    return response_data


# ============================================
# LOGIN CON GOOGLE
# ============================================

@router.post("/login/google")
async def google_login(google_data: GoogleLogin, db: Session = Depends(get_db)):
    """Login con Google OAuth"""
    
    try:
        # Verificar el token con Google
        idinfo = id_token.verify_oauth2_token(
            google_data.token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        if idinfo['aud'] != settings.GOOGLE_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        google_id = idinfo['sub']
        email = idinfo['email']
        nombre = idinfo.get('name', '')
        profile_picture = idinfo.get('picture', '')
        
        # Buscar usuario por Google ID o email
        user = db.query(User).filter(
            (User.google_id == google_id) | (User.email == email)
        ).first()
        
        if user:
            # Usuario existente
            if not user.google_id:
                user.google_id = google_id
            if not user.profile_picture:
                user.profile_picture = profile_picture
            user.is_verified = True
            user.last_login = datetime.utcnow()
        else:
            # Crear nuevo usuario
            user = User(
                nombre=nombre,
                email=email,
                google_id=google_id,
                profile_picture=profile_picture,
                is_verified=True
            )
            db.add(user)
        
        db.commit()
        db.refresh(user)
        
        print(f"✅ Login Google exitoso: {user.email}")
        
        # Crear token JWT
        access_token = create_access_token(data={"sub": user.email})
        
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "nombre": user.nombre,
                "email": user.email,
                "profile_picture": user.profile_picture,
                "is_verified": user.is_verified,
                "created_at": user.created_at.isoformat()
            }
        }
        
        return response_data

        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token de Google inválido: {str(e)}"
        )

# ============================================
# RECUPERACIÓN DE CONTRASEÑA
# ============================================

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    """Solicitar recuperación de contraseña"""
    
    # Buscar usuario
    user = db.query(User).filter(User.email == data.email).first()
    
    # Por seguridad, siempre retornamos success
    if not user:
        return {
            "success": True,
            "message": "Si el correo existe, recibirás un email con instrucciones"
        }
    
    # Generar token seguro
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Guardar token en BD
    password_reset = PasswordReset(
        user_id=user.id,
        token=reset_token,
        expires_at=expires_at
    )
    db.add(password_reset)
    db.commit()
    
    # Enviar email
    try:
        await send_password_reset_email(user.email, user.nombre, reset_token)
        print(f"✅ Email de recuperación enviado a: {user.email}")
    except Exception as e:
        print(f"⚠️ Error enviando email: {str(e)}")
    
    return {
        "success": True,
        "message": "Si el correo existe, recibirás un email con instrucciones"
    }

@router.post("/reset-password")
async def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    """Resetear contraseña con token"""
    
    # Buscar token
    password_reset = db.query(PasswordReset).filter(
        PasswordReset.token == data.token,
        PasswordReset.used == False,
        PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not password_reset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido o expirado"
        )
    
    # Actualizar contraseña
    user = db.query(User).get(password_reset.user_id)
    user.password_hash = hash_password(data.password)
    
    # Marcar token como usado
    password_reset.used = True
    
    db.commit()
    
    print(f"✅ Contraseña actualizada para: {user.email}")
    
    return {
        "success": True,
        "message": "Contraseña actualizada exitosamente"
    }

# ============================================
# VERIFICAR SESIÓN
# ============================================

@router.get("/check-session", response_model=UserResponse)
async def check_session(current_user: User = Depends(get_current_user)):
    """Verificar si hay una sesión activa"""
    return UserResponse.from_orm(current_user)

# ============================================
# LOGOUT (opcional, solo para limpiar)
# ============================================

@router.post("/logout")
async def logout():
    """Cerrar sesión (el frontend debe eliminar el token)"""
    return {
        "success": True,
        "message": "Sesión cerrada exitosamente"
    }