from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

def verify_google_token(token, client_id):
    """
    Verifica el token de Google y retorna la información del usuario
    
    Args:
        token: Token JWT de Google
        client_id: ID del cliente de Google OAuth
        
    Returns:
        dict: Información del usuario si es válido
        None: Si el token es inválido
    """
    try:
        # Verificar el token con Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            client_id
        )
        
        # Verificar que el token es para nuestra aplicación
        if idinfo['aud'] != client_id:
            return None
        
        # Extraer información del usuario
        user_info = {
            'google_id': idinfo['sub'],
            'email': idinfo['email'],
            'nombre': idinfo.get('name', ''),
            'profile_picture': idinfo.get('picture', ''),
            'email_verified': idinfo.get('email_verified', False)
        }
        
        return user_info
        
    except ValueError as e:
        # Token inválido
        print(f"Error verificando token de Google: {str(e)}")
        return None
    except Exception as e:
        # Otro error
        print(f"Error inesperado en Google Auth: {str(e)}")
        return None