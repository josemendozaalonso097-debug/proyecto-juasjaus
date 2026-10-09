"""Mensajes SMTP del flujo de incorporación de escuelas."""
from html import escape
from .email import send_email


PRIMARY = "#E31E24"


def _layout(title: str, body: str, subtitle: str = "Portal escolar") -> str:
    safe_title = escape(title)
    safe_subtitle = escape(subtitle)
    return f"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#263238">
  <div style="max-width:620px;margin:28px auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
    <div style="background:{PRIMARY};padding:25px 30px;color:#fff">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:.9">{safe_subtitle}</div>
      <h1 style="margin:8px 0 0;font-size:24px">{safe_title}</h1>
    </div>
    <main style="padding:28px 30px;line-height:1.65;font-size:15px">{body}</main>
    <footer style="padding:18px 30px;background:#f8fafc;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px">
      Mensaje automático del portal escolar. Si tienes dudas, responde a este correo o contacta al equipo administrador.
    </footer>
  </div>
</body></html>"""


def _school_details(request) -> str:
    location = ", ".join(part for part in [request.municipality, request.state] if part)
    details = [
        ("Plantel", request.school_name),
        ("Persona de contacto", request.contact_name),
        ("Cargo", request.contact_role),
        ("Ubicación", location or "No especificada"),
        ("Folio", f"#{request.id}"),
    ]
    rows = "".join(
        f"<tr><td style='padding:7px 10px;color:#64748b'><b>{escape(label)}</b></td>"
        f"<td style='padding:7px 10px'>{escape(str(value))}</td></tr>"
        for label, value in details
    )
    return f"<table role='presentation' style='width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px'>{rows}</table>"


async def send_institution_admin_notification(to_email: str, request) -> bool:
    """Aviso interno de que llegó una solicitud nueva."""
    body = (
        "<p>Se recibió una nueva solicitud para incorporar un plantel. Está pendiente de revisión en el panel de administración.</p>"
        + _school_details(request)
        + "<p style='margin-top:20px'>Revisa los datos y actualiza el estado desde <b>Altas de planteles</b>.</p>"
    )
    return await send_email(
        to_email,
        f"Nueva solicitud de alta escolar — folio #{request.id}",
        _layout("Nueva solicitud de plantel", body, "Aviso para administración"),
    )


async def send_institution_received_email(request) -> bool:
    """Confirmación de recepción y bienvenida dirigida a directivos/contacto."""
    body = (
        f"<p>Hola <b>{escape(request.contact_name)}</b>:</p>"
        f"<p>Gracias por considerar el portal escolar para <b>{escape(request.school_name)}</b>. "
        "Nos da gusto iniciar esta conversación con su equipo directivo.</p>"
        "<p>Tu solicitud fue recibida y el equipo administrador la revisará. Este mensaje confirma la recepción; "
        "<b>no significa todavía que el plantel haya sido aprobado ni que el portal ya esté habilitado</b>.</p>"
        + _school_details(request)
        + "<p>Te contactaremos a este correo cuando haya una actualización o si necesitamos información adicional.</p>"
        "<p>Atentamente,<br><b>Equipo del portal escolar</b></p>"
    )
    return await send_email(
        request.contact_email,
        f"Recibimos la solicitud de {request.school_name} — folio #{request.id}",
        _layout("Bienvenidos; recibimos su solicitud", body, "Incorporación de instituciones"),
    )


async def send_institution_approved_email(request) -> bool:
    """Notifica aceptación y explica los pasos previos a habilitar el portal."""
    note = (
        f"<div style='margin-top:16px;padding:14px;background:#f8fafc;border-left:4px solid {PRIMARY}'>"
        f"<b>Mensaje del equipo:</b><br>{escape(request.review_note)}</div>"
        if request.review_note else ""
    )
    body = (
        f"<p>Hola <b>{escape(request.contact_name)}</b>:</p>"
        f"<p>Tenemos buenas noticias: la solicitud de <b>{escape(request.school_name)}</b> fue <b style='color:#15803d'>aceptada</b>.</p>"
        "<p>El equipo se pondrá en contacto contigo para coordinar la configuración del plantel, sus datos institucionales "
        "y el acceso de sus responsables. La aceptación no crea por sí sola cuentas ni activa una instancia técnica; "
        "te confirmaremos cuando el portal esté listo para usarse.</p>"
        + _school_details(request)
        + note
        + "<p>Gracias por confiar en el proyecto.<br><b>Equipo del portal escolar</b></p>"
    )
    return await send_email(
        request.contact_email,
        f"Solicitud aceptada: {request.school_name} — folio #{request.id}",
        _layout("¡Su solicitud fue aceptada!", body, "Siguiente etapa"),
    )


async def send_institution_rejected_email(request) -> bool:
    """Notifica rechazo o necesidad de corregir/completar información."""
    needs_changes = request.status == "Requiere corrección"
    heading = "Necesitamos información adicional" if needs_changes else "Actualización de su solicitud"
    status_text = "requiere información o ajustes antes de continuar" if needs_changes else "no fue aprobada en esta ocasión"
    note = (
        f"<div style='margin-top:16px;padding:14px;background:#fff7ed;border-left:4px solid #ea580c'>"
        f"<b>Detalle del equipo:</b><br>{escape(request.review_note)}</div>"
        if request.review_note else ""
    )
    body = (
        f"<p>Hola <b>{escape(request.contact_name)}</b>:</p>"
        f"<p>Te informamos que la solicitud de <b>{escape(request.school_name)}</b> {status_text}.</p>"
        + note
        + ("<p>Responde a este correo con la información solicitada para que podamos volver a revisarla.</p>" if needs_changes else "<p>Si consideras que hubo un error o deseas conocer más detalles, puedes responder a este correo para conversar con el equipo administrador.</p>")
        + _school_details(request)
        + "<p>Atentamente,<br><b>Equipo del portal escolar</b></p>"
    )
    return await send_email(
        request.contact_email,
        f"Actualización de solicitud: {request.school_name} — folio #{request.id}",
        _layout(heading, body, "Actualización de solicitud"),
    )
