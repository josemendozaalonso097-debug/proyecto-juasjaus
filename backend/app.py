from flask import Flask, session
from flask_cors import CORS
from flask_mail import Mail
from config import Config
from models import db
from datetime import timedelta

# Crear instancia de Mail (global para usar en otros módulos)
mail = Mail()

def create_app():
    """Factory para crear la aplicación Flask"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configurar sesión permanente
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
    
    # Inicializar extensiones
    db.init_app(app)
    mail.init_app(app)
    
    # Configurar CORS - MUY IMPORTANTE
    CORS(app, 
         resources={r"/api/*": {
             "origins": ["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:*"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type"],
             "supports_credentials": True,
             "expose_headers": ["Content-Type"]
         }})
    
    # Registrar Blueprints
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Ruta de prueba
    @app.route('/api/test', methods=['GET'])
    def test():
        return {'success': True, 'message': 'Servidor funcionando correctamente'}
    
    # Crear tablas si no existen
    with app.app_context():
        db.create_all()
        print("✅ Base de datos inicializada")
    
    return app


if __name__ == '__main__':
    app = create_app()
    
    print("\n" + "="*60)
    print("🚀 SERVIDOR FLASK INICIADO CORRECTAMENTE")
    print("="*60)
    print(f"📍 Backend URL: http://localhost:5000")
    print(f"🌐 Frontend URL: {app.config['FRONTEND_URL']}")
    print(f"📧 Email configurado: {app.config['MAIL_USERNAME']}")
    print(f"🔐 Google OAuth: {'✅ Configurado' if app.config['GOOGLE_CLIENT_ID'] else '❌ No configurado'}")
    print("\n💡 Prueba la API en: http://localhost:5000/api/test")
    print("="*60 + "\n")
    
    # Iniciar servidor
    app.run(
        debug=True, 
        host='0.0.0.0', 
        port=5000,
        threaded=True
    )