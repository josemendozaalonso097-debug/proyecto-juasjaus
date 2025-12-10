import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from ..config import settings

async def send_email(to_email: str, subject: str, html_content: str):
    """
    Envía un correo electrónico usando aiosmtplib (async)
    
    Args:
        to_email: Destinatario
        subject: Asunto del correo
        html_content: Contenido HTML del correo
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        print("⚠️ Email no configurado. Saltando envío.")
        return False
    
    message = MIMEMultipart("alternative")
    message["From"] = settings.MAIL_FROM
    message["To"] = to_email
    message["Subject"] = subject
    
    html_part = MIMEText(html_content, "html")
    message.attach(html_part)
    
    try:
        await aiosmtplib.send(
            message,
            hostname=settings.MAIL_SERVER,
            port=settings.MAIL_PORT,
            start_tls=True,
            username=settings.MAIL_USERNAME,
            password=settings.MAIL_PASSWORD,
        )
        print(f"✅ Email enviado a {to_email}")
        return True
    except Exception as e:
        print(f"❌ Error enviando email: {str(e)}")
        return False


async def send_welcome_email(to_email: str, user_name: str):
    """Envía email de bienvenida"""
    
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 50px auto; background-color: #fff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(to right, #94272C, #8b292e); color: white; padding: 40px; text-align: center; }
            .content { padding: 40px 30px; color: #333; }
            .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
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
    
    template = Template(html)
    html_content = template.render(user_name=user_name)
    
    await send_email(to_email, "🎉 ¡Bienvenido a CBTis 258!", html_content)


async def send_password_reset_email(to_email: str, user_name: str, reset_token: str):
    """Envía email de recuperación de contraseña"""
    
    reset_link = f"{settings.FRONTEND_URL}/reset-password.html?token={reset_token}"
    
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 50px auto; background-color: #fff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(to right, #94272C, #8b292e); color: white; padding: 30px; text-align: center; }
            .content { padding: 40px 30px; color: #333; }
            .button { display: inline-block; background-color: #94272C; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 14px; }
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
    
    template = Template(html)
    html_content = template.render(user_name=user_name, reset_link=reset_link)
    
    await send_email(to_email, "🔐 Recuperación de Contraseña - CBTis 258", html_content)