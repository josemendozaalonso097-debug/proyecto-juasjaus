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
    
    frontend_url = settings.FRONTEND_URL
    # LOGO_URL: Aquí se define la URL del logo para el correo
    logo_url = f"{frontend_url}/imgs/dgeti_red-removebg-preview.png"
    # COLOR_PRIMARIO: #E31E24 (Rojo vivo)
    primary_color = "#E31E24"
    
    html = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800&display=swap');
            body { font-family: 'Montserrat', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #eee; }
            .header { background-color: {{ primary_color }}; padding: 45px 20px; text-align: center; color: white; }
            .header-title { font-family: 'Montserrat', sans-serif; font-size: 36px; font-weight: 800; margin: 0; line-height: 1; letter-spacing: 2px; text-transform: uppercase; }
            .header-slogan { font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 300; margin: 8px 0 0; opacity: 0.9; letter-spacing: 1px; font-style: italic; }
            .content { padding: 40px; color: #333; line-height: 1.6; }
            .welcome-title { color: {{ primary_color }}; font-size: 28px; font-weight: 700; margin-bottom: 20px; text-align: center; }
            .button-container { text-align: center; margin: 40px 0; }
            .button { background-color: {{ primary_color }}; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; transition: transform 0.2s; }
            .footer { background-color: #f4f4f4; padding: 30px; text-align: center; font-size: 13px; color: #777; border-top: 1px solid #eee; }
            .slogan { font-style: italic; color: {{ primary_color }}; font-weight: 600; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="header-title">CBTis 258</h1>
                <p class="header-slogan">Un motivo de orgullo</p>
            </div>
            <div class="content">
                <h2 class="welcome-title">¡Bienvenido(a) a tu portal!</h2>
                <p>Hola <strong>{{ user_name }}</strong>,</p>
                <p>Nos alegra mucho que formes parte de la comunidad de <strong>CBTis 258</strong>. A partir de ahora, tienes acceso completo a nuestro portal, diseñado para facilitar tu trayectoria académica.</p>
                <p>Aquí podrás consultar tus calificaciones, horarios, inscribirte en actividades, descargar documentos y mucho más.</p>
                
                <div class="button-container">
                    <a href="{{ frontend_url }}" class="button">EXPLORAR PORTAL</a>
                </div>
                
                <p>Si tienes alguna duda durante tu proceso, nuestro equipo está aquí para apoyarte.</p>
                <p>Atentamente,<br><strong>Equipo Directivo de CBTis 258</strong></p>
                <p class="slogan">"Un motivo de orgullo"</p>
            </div>
            <div class="footer">
                <p>© 2024 CBTis 258. Todos los derechos reservados.</p>
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    template = Template(html)
    html_content = template.render(
        user_name=user_name or "Usuario",
        logo_url=logo_url,
        primary_color=primary_color,
        frontend_url=f"{frontend_url}/login.html"
    )
    
    await send_email(to_email, "🎉 ¡Bienvenido a tu portal CBTis 258!", html_content)


async def send_password_reset_email(to_email: str, user_name: str, reset_token: str):
    """Envía email de recuperación de contraseña"""
    
    frontend_url = settings.FRONTEND_URL
    reset_link = f"{frontend_url}/reset-password.html?token={reset_token}"
    # LOGO_URL: Aquí se define la URL del logo para el correo
    logo_url = f"{frontend_url}/imgs/dgeti_red-removebg-preview.png"
    # COLOR_PRIMARIO: #E31E24 (Rojo vivo)
    primary_color = "#E31E24"
    
    html = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800&display=swap');
            body { font-family: 'Montserrat', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #eee; }
            .header { background-color: {{ primary_color }}; padding: 35px 20px; text-align: center; color: white; }
            .header-title { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 800; margin: 0; line-height: 1; letter-spacing: 2px; text-transform: uppercase; }
            .header-slogan { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 300; margin: 8px 0 0; opacity: 0.9; letter-spacing: 1px; font-style: italic; }
            .content { padding: 40px; color: #333; line-height: 1.6; }
            .title { color: {{ primary_color }}; font-size: 24px; font-weight: 700; margin-bottom: 20px; text-align: center; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { background-color: {{ primary_color }}; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; }
            .warning { background-color: #fff8e1; border-left: 4px solid #ffb300; padding: 20px; margin: 25px 0; font-size: 14px; color: #856404; border-radius: 0 8px 8px 0; }
            .footer { background-color: #f4f4f4; padding: 30px; text-align: center; font-size: 13px; color: #777; border-top: 1px solid #eee; }
            .link-url { word-break: break-all; color: {{ primary_color }}; font-size: 12px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="header-title">CBTis 258</h1>
                <p class="header-slogan">Un motivo de orgullo</p>
            </div>
            <div class="content">
                <h2 class="title">¿Olvidaste tu contraseña?</h2>
                <p>Hola <strong>{{ user_name }}</strong>,</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en el portal de CBTis 258. Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
                
                <div class="button-container">
                    <a href="{{ reset_link }}" class="button">RESTABLECER CONTRASEÑA</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong> Por motivos de seguridad, este enlace expirará en 1 hora.
                </div>
                
                <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                <div class="link-url">{{ reset_link }}</div>
                
                <p style="margin-top: 30px;">Atentamente,<br><strong>Soporte Técnico CBTis 258</strong></p>
            </div>
            <div class="footer">
                <p>© 2024 CBTis 258. Todos los derechos reservados.</p>
                <p>Por favor, no respondas a este correo.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    template = Template(html)
    html_content = template.render(
        user_name=user_name,
        reset_link=reset_link,
        logo_url=logo_url,
        primary_color=primary_color
    )
    
    await send_email(to_email, "🔐 Recuperación de Contraseña - CBTis 258", html_content)

async def send_otp_email(to_email: str, user_name: str, otp_code: str):
    """Envía el código OTP para validación de registro"""
    
    frontend_url = settings.FRONTEND_URL
    logo_url = f"{frontend_url}/imgs/dgeti_red-removebg-preview.png"
    primary_color = "#E31E24"
    
    html = """
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800&display=swap');
            body { font-family: 'Montserrat', Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.05); overflow: hidden; border: 1px solid #eee; }
            .header { background-color: {{ primary_color }}; padding: 35px 20px; text-align: center; color: white; }
            .header-title { font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 800; margin: 0; line-height: 1; letter-spacing: 2px; text-transform: uppercase; }
            .header-slogan { font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 300; margin: 8px 0 0; opacity: 0.9; letter-spacing: 1px; font-style: italic; }
            .content { padding: 40px; color: #333; line-height: 1.6; text-align: center; }
            .title { color: {{ primary_color }}; font-size: 24px; font-weight: 700; margin-bottom: 20px; }
            .otp-container { background-color: #ffeaea; padding: 25px; border-radius: 12px; margin: 30px auto; width: fit-content; border: 2px dashed {{ primary_color }}; }
            .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 10px; color: {{ primary_color }}; margin: 0; line-height: 1; }
            .warning { background-color: #fff8e1; border-left: 4px solid #ffb300; padding: 20px; margin: 25px 0; font-size: 14px; color: #856404; border-radius: 0 8px 8px 0; text-align: left; }
            .footer { background-color: #f4f4f4; padding: 30px; text-align: center; font-size: 13px; color: #777; border-top: 1px solid #eee; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 class="header-title">CBTis 258</h1>
                <p class="header-slogan">Un motivo de orgullo</p>
            </div>
            <div class="content">
                <h2 class="title">Verificación de Cuenta</h2>
                <p style="text-align: left;">Hola <strong>{{ user_name }}</strong>,</p>
                <p style="text-align: left;">Estás a un paso de completar tu registro en el portal de CBTis 258. Por favor, usa el siguiente código de seguridad en la pantalla de verificación:</p>
                
                <div class="otp-container">
                    <h1 class="otp-code">{{ otp_code }}</h1>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong> El código expirará en 2 minutos. No lo compártas con nadie.
                </div>
                
                <p style="margin-top: 30px; text-align: left;">Atentamente,<br><strong>Equipo de Soporte CBTis 258</strong></p>
            </div>
            <div class="footer">
                <p>© 2024 CBTis 258. Todos los derechos reservados.</p>
                <p>Por favor, no respondas a este correo automático.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    template = Template(html)
    html_content = template.render(
        user_name=user_name,
        otp_code=otp_code,
        logo_url=logo_url,
        primary_color=primary_color
    )
    
    await send_email(to_email, f"Tu código de validación es: {otp_code} - CBTis 258", html_content)