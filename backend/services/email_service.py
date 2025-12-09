from flask_mail import Message
from flask import current_app, render_template_string

def send_password_reset_email(mail, user_email, user_name, reset_token, frontend_url):
    """Envía un correo de recuperación de contraseña"""
    
    reset_link = f"{frontend_url}/reset-password.html?token={reset_token}"
    
    # Template HTML del correo
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(to right, #94272C, #8b292e);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .content {
                padding: 40px 30px;
                color: #333;
            }
            .button {
                display: inline-block;
                background-color: #94272C;
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
            .footer {
                background-color: #f8f8f8;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
            .warning {
                background-color: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Recuperación de Contraseña</h1>
                <p>CBTis 258 - Un motivo de orgullo</p>
            </div>
            <div class="content">
                <h2>Hola {{ user_name }},</h2>
                <p>Recibimos una solicitud para restablecer tu contraseña. Si no fuiste tú, puedes ignorar este correo.</p>
                
                <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
                
                <center>
                    <a href="{{ reset_link }}" class="button">Restablecer Contraseña</a>
                </center>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por seguridad.
                </div>
                
                <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #94272C;">{{ reset_link }}</p>
                
                <p>Si no solicitaste este cambio, tu cuenta está segura y puedes ignorar este mensaje.</p>
                
                <p>Saludos,<br><strong>Equipo de CBTis 258</strong></p>
            </div>
            <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>© 2024 CBTis 258. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Renderizar el template
    html_body = render_template_string(
        html_template,
        user_name=user_name,
        reset_link=reset_link
    )
    
    # Crear el mensaje
    msg = Message(
        subject='🔐 Recuperación de Contraseña - CBTis 258',
        recipients=[user_email],
        html=html_body
    )
    
    try:
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Error enviando email: {str(e)}")
        return False


def send_welcome_email(mail, user_email, user_name):
    """Envía un correo de bienvenida"""
    
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 50px auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
                background: linear-gradient(to right, #94272C, #8b292e);
                color: white;
                padding: 40px;
                text-align: center;
            }
            .content {
                padding: 40px 30px;
                color: #333;
            }
            .footer {
                background-color: #f8f8f8;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 ¡Bienvenido a CBTis 258!</h1>
            </div>
            <div class="content">
                <h2>Hola {{ user_name }},</h2>
                <p>¡Gracias por registrarte en nuestra plataforma!</p>
                <p>Tu cuenta ha sido creada exitosamente. Ahora puedes acceder a todos nuestros servicios.</p>
                <p><strong>Un motivo de orgullo</strong></p>
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                <p>Saludos,<br><strong>Equipo de CBTis 258</strong></p>
            </div>
            <div class="footer">
                <p>© 2024 CBTis 258. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    html_body = render_template_string(html_template, user_name=user_name)
    
    msg = Message(
        subject='🎉 ¡Bienvenido a CBTis 258!',
        recipients=[user_email],
        html=html_body
    )
    
    try:
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Error enviando email de bienvenida: {str(e)}")
        return False