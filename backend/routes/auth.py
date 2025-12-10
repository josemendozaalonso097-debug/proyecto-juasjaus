from flask import Blueprint, request, jsonify, session, current_app
from models import db, User, PasswordReset
from services.google_auth import verify_google_token
from services.email_service import send_password_reset_email, send_welcome_email
from datetime import datetime, timedelta
import secrets
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Valida formato de email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    """Registro de nuevo usuario con email y contraseña"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False, 
                'message': 'No se recibieron datos'
            }), 400
        
        nombre = data.get('nombre', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        print(f"📝 Intento de registro: {email}")  # Debug
        
        # Validaciones
        if not nombre or not email or not password:
            return jsonify({
                'success': False, 
                'message': 'Todos los campos son requeridos'
            }), 400
        
        if len(password) < 6:
            return jsonify({
                'success': False, 
                'message': 'La contraseña debe tener al menos 6 caracteres'
            }), 400
        
        if not validate_email(email):
            return jsonify({
                'success': False, 
                'message': 'Email inválido'
            }), 400
        
        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                'success': False, 
                'message': 'Este correo ya está registrado'
            }), 400
        
        # Crear nuevo usuario
        user = User(nombre=nombre, email=email)
        user.set_password(password)
        user.is_verified = True
        
        db.session.add(user)
        db.session.commit()
        
        # Crear sesión
        session.permanent = True
        session['user_id'] = user.id
        
        print(f"✅ Usuario registrado: {email}")
        print(f"   Session guardada: user_id={user.id}")
        
        # Enviar email de bienvenida (no bloquea si falla)
        try:
            from app import mail
            send_welcome_email(mail, user.email, user.nombre)
        except Exception as e:
            print(f"⚠️ Error enviando email de bienvenida: {str(e)}")
        
        return jsonify({
            'success': True,
            'message': '¡Cuenta creada exitosamente!',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error en registro: {str(e)}")  # Debug
        return jsonify({
            'success': False, 
            'message': f'Error en el servidor: {str(e)}'
        }), 500


@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """Login con email y contraseña"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False, 
                'message': 'No se recibieron datos'
            }), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        print(f"🔐 Intento de login: {email}")  # Debug
        
        if not email or not password:
            return jsonify({
                'success': False, 
                'message': 'Email y contraseña son requeridos'
            }), 400
        
        # Buscar usuario
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({
                'success': False, 
                'message': 'Email o contraseña incorrectos'
            }), 401
        
        # Actualizar último login
        user.update_last_login()
        
        # Crear sesión
        session.permanent = True
        session['user_id'] = user.id
        
        print(f"✅ Login exitoso: {email}")
        print(f"   Session guardada: user_id={user.id}")
        
        return jsonify({
            'success': True,
            'message': f'¡Bienvenido {user.nombre}!',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"❌ Error en login: {str(e)}")  # Debug
        return jsonify({
            'success': False, 
            'message': f'Error en el servidor: {str(e)}'
        }), 500


@auth_bp.route('/login/google', methods=['POST', 'OPTIONS'])
def google_login():
    """Login con Google OAuth"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({
                'success': False, 
                'message': 'Token no proporcionado'
            }), 400
        
        print(f"🔐 Intento de login con Google")  # Debug
        
        # Verificar token con Google
        user_info = verify_google_token(token, current_app.config['GOOGLE_CLIENT_ID'])
        
        if not user_info:
            return jsonify({
                'success': False, 
                'message': 'Token de Google inválido'
            }), 401
        
        # Buscar usuario por Google ID o email
        user = User.query.filter(
            (User.google_id == user_info['google_id']) | 
            (User.email == user_info['email'])
        ).first()
        
        if user:
            # Usuario existente
            if not user.google_id:
                user.google_id = user_info['google_id']
            if not user.profile_picture:
                user.profile_picture = user_info['profile_picture']
            user.is_verified = True
            user.update_last_login()
        else:
            # Crear nuevo usuario
            user = User(
                nombre=user_info['nombre'],
                email=user_info['email'],
                google_id=user_info['google_id'],
                profile_picture=user_info['profile_picture'],
                is_verified=True
            )
            db.session.add(user)
        
        db.session.commit()
        
        # Crear sesión
        session.permanent = True
        session['user_id'] = user.id
        
        print(f"✅ Login Google exitoso: {user.email}")  # Debug
        
        return jsonify({
            'success': True,
            'message': f'¡Bienvenido {user.nombre}!',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error en Google login: {str(e)}")  # Debug
        return jsonify({
            'success': False, 
            'message': f'Error en el servidor: {str(e)}'
        }), 500


@auth_bp.route('/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():
    """Solicitud de recuperación de contraseña"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        
        print(f"📧 Solicitud de recuperación: {email}")  # Debug
        
        if not email:
            return jsonify({
                'success': False, 
                'message': 'Email es requerido'
            }), 400
        
        # Buscar usuario
        user = User.query.filter_by(email=email).first()
        
        if not user:
            # Por seguridad, no revelamos si el email existe
            return jsonify({
                'success': True,
                'message': 'Si el correo existe, recibirás un email con instrucciones'
            }), 200
        
        # Generar token seguro
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # Crear registro de reset
        password_reset = PasswordReset(
            user_id=user.id,
            token=reset_token,
            expires_at=expires_at
        )
        db.session.add(password_reset)
        db.session.commit()
        
        # Enviar email
        try:
            from app import mail
            email_sent = send_password_reset_email(
                mail,
                user.email,
                user.nombre,
                reset_token,
                current_app.config['FRONTEND_URL']
            )
            
            if email_sent:
                print(f"✅ Email de recuperación enviado a: {email}")  # Debug
            else:
                print(f"⚠️ No se pudo enviar email a: {email}")  # Debug
        except Exception as e:
            print(f"⚠️ Error enviando email: {str(e)}")  # Debug
        
        return jsonify({
            'success': True,
            'message': 'Si el correo existe, recibirás un email con instrucciones'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error en forgot-password: {str(e)}")  # Debug
        return jsonify({
            'success': False, 
            'message': f'Error en el servidor: {str(e)}'
        }), 500


@auth_bp.route('/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    """Resetear contraseña con token"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        token = data.get('token', '')
        new_password = data.get('password', '')
        
        if not token or not new_password:
            return jsonify({
                'success': False, 
                'message': 'Token y contraseña son requeridos'
            }), 400
        
        if len(new_password) < 6:
            return jsonify({
                'success': False, 
                'message': 'La contraseña debe tener al menos 6 caracteres'
            }), 400
        
        # Buscar token
        password_reset = PasswordReset.query.filter_by(token=token).first()
        
        if not password_reset or not password_reset.is_valid():
            return jsonify({
                'success': False, 
                'message': 'Token inválido o expirado'
            }), 400
        
        # Actualizar contraseña
        user = User.query.get(password_reset.user_id)
        user.set_password(new_password)
        password_reset.mark_as_used()
        
        db.session.commit()
        
        print(f"✅ Contraseña actualizada para: {user.email}")  # Debug
        
        return jsonify({
            'success': True,
            'message': 'Contraseña actualizada exitosamente'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error en reset-password: {str(e)}")  # Debug
        return jsonify({
            'success': False, 
            'message': f'Error en el servidor: {str(e)}'
        }), 500


@auth_bp.route('/logout', methods=['POST', 'OPTIONS'])
def logout():
    """Cerrar sesión"""
    if request.method == 'OPTIONS':
        return '', 204
    
    session.pop('user_id', None)
    return jsonify({
        'success': True,
        'message': 'Sesión cerrada exitosamente'
    }), 200


@auth_bp.route('/check-session', methods=['GET', 'OPTIONS'])
def check_session():
    """Verificar si hay una sesión activa"""
    if request.method == 'OPTIONS':
        return '', 204
    
    print(f"🔍 Verificando sesión...")
    print(f"   Session data: {dict(session)}")
    print(f"   Cookies: {request.cookies}")
    
    user_id = session.get('user_id')
    
    if not user_id:
        print("❌ No hay user_id en la sesión")
        return jsonify({
            'success': False,
            'authenticated': False,
            'message': 'No hay sesión activa'
        }), 401
    
    user = User.query.get(user_id)
    if not user:
        session.pop('user_id', None)
        print(f"❌ Usuario {user_id} no encontrado en DB")
        return jsonify({
            'success': False,
            'authenticated': False,
            'message': 'Usuario no encontrado'
        }), 401
    
    print(f"✅ Sesión válida para: {user.email}")
    
    return jsonify({
        'success': True,
        'authenticated': True,
        'user': user.to_dict()
    }), 200