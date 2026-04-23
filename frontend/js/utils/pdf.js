import { obtenerHistorial } from './storage.js';

export function generarPDFHistorial() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        showToast("jsPDF no se cargó correctamente", 'error');
        return;
    }
    const doc = new jsPDF();
    const historial = obtenerHistorial();
    
    if (historial.length === 0) {
        showToast('No hay compras en el historial', 'warning');
        return;
    }

    // --- CONFIGURACIÓN DE ESTILO ---
    // COLOR_PRIMARIO_PDF: [227, 30, 36] (#E31E24 - Rojo vivo)
    const primaryRGB = [227, 30, 36];
    
    // Encabezado
    doc.setFillColor(...primaryRGB);
    doc.rect(0, 0, 210, 45, 'F');
    
    // LOGO_PDF: Dibujar el logo
    try {
        // Usamos la ruta relativa al servidor o una absoluta si fuera necesario
        doc.addImage("/imgs/dgeti_red-removebg-preview.png", "PNG", 10, 5, 30, 30);
    } catch (e) {
        console.warn("No se pudo cargar el logo en el PDF:", e);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont(undefined, 'bold');
    doc.text('CBTis 258', 115, 22, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('CENTRO DE BACHILLERATO TECNOLÓGICO industrial y de servicios No. 258', 115, 30, { align: 'center' });
    doc.text('HISTORIAL DE COMPRAS', 115, 38, { align: 'center' });
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Documento generado el: ${new Date().toLocaleString('es-MX')}`, 20, 55);
    
    let y = 70;
    let totalAcumulado = 0;

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y, 170, 8, 'F');
    doc.setFont(undefined, 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('DESCRIPCIÓN', 25, y + 6);
    doc.text('FECHA', 100, y + 6);
    doc.text('MÉTODO', 140, y + 6);
    doc.text('TOTAL', 170, y + 6);
    y += 15;
    
    historial.forEach((compra, i) => {
        if (y > 260) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...primaryRGB);
        doc.text(`Ticket #${String(i + 1).padStart(4, '0')}`, 20, y);
        y += 6;

        compra.productos.forEach((prod) => {
            doc.setFont(undefined, 'normal');
            doc.setTextColor(80, 80, 80);
            doc.text(`• ${prod.nombre} (x${prod.cantidad})`, 25, y);
            doc.text(`$${(prod.precio * prod.cantidad).toFixed(2)}`, 170, y);
            y += 6;
        });

        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(compra.fecha, 100, y - (compra.productos.length * 3));
        doc.text(compra.metodoPago, 140, y - (compra.productos.length * 3));
        
        y += 2;
        doc.setDrawColor(230, 230, 230);
        doc.line(20, y, 190, y);
        y += 10;
        
        totalAcumulado += compra.total;
    });
    
    // Resumen Final
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFillColor(...primaryRGB);
    doc.rect(120, y, 70, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL GENERAL: $${totalAcumulado.toFixed(2)}`, 155, y + 9, { align: 'center' });
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont(undefined, 'italic');
    doc.text('"Un motivo de orgullo"', 105, 285, { align: 'center' });

    doc.save('CBTis258_Historial_Facturas.pdf');
}

export function generarPDFComprobante(metodo, fechaFormato, total, carritoActual) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        showToast("jsPDF no se cargó correctamente", 'error');
        return;
    }
    const doc = new jsPDF();
    
    // Obtener nombre del usuario logueado
    const userRaw = localStorage.getItem('user');
    let nombreUsuario = 'Usuario';
    try {
        if (userRaw) {
            const user = JSON.parse(userRaw);
            nombreUsuario = user.nombre || 'Usuario';
        }
    } catch (e) {
        console.error('Error al obtener nombre de usuario para PDF:', e);
    }

    const nombreTarjeta = document.querySelector('input[name="input-name"]')?.value || nombreUsuario;
    
    // COLOR_PRIMARIO_PDF: [227, 30, 36] (#E31E24 - Rojo vivo)
    const primaryRGB = [227, 30, 36];

    // Header Color Block
    doc.setFillColor(...primaryRGB);
    doc.rect(0, 0, 210, 50, 'F');
    
    // LOGO_PDF: Dibujar el logo
    try {
        doc.addImage("/imgs/dgeti_red-removebg-preview.png", "PNG", 10, 8, 35, 35);
    } catch (e) {
        console.warn("No se pudo cargar el logo en el PDF:", e);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('CBTis 258', 115, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('COMPROBANTE OFICIAL DE PAGO', 115, 35, { align: 'center' });
    
    // Info Section
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('DETALLES DE LA TRANSACCIÓN', 20, 65);
    
    doc.setFont(undefined, 'normal');
    doc.text(`Cliente:`, 20, 75);
    doc.text(nombreTarjeta, 60, 75);
    doc.text(`Fecha:`, 20, 82);
    doc.text(fechaFormato, 60, 82);
    doc.text(`Método:`, 20, 89);
    doc.text(metodo, 60, 89);
    
    doc.setDrawColor(...primaryRGB);
    doc.setLineWidth(0.5);
    doc.line(20, 95, 190, 95);
    
    // Items
    doc.setFont(undefined, 'bold');
    doc.text('PRODUCTO', 25, 105);
    doc.text('CANTIDAD', 120, 105);
    doc.text('SUBTOTAL', 165, 105);
    
    let y = 115;
    doc.setFont(undefined, 'normal');
    carritoActual.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        doc.text(`• ${item.nombre} ${item.tallaSeleccionada ? `(${item.tallaSeleccionada})` : ''}`, 25, y);
        doc.text(`${item.cantidad}`, 125, y);
        doc.text(`$${itemTotal.toFixed(2)}`, 165, y);
        y += 8;
    });
    
    // Total Box
    y += 10;
    doc.setFillColor(248, 249, 250);
    doc.rect(130, y, 60, 20, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(130, y, 60, 20, 'S');
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryRGB);
    doc.text(`TOTAL: $${total.toFixed(2)}`, 160, y + 13, { align: 'center' });
    
    // Slogan and Footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('Gracias por su preferencia', 105, y + 40, { align: 'center' });
    doc.text('"Un motivo de orgullo"', 105, y + 46, { align: 'center' });
    
    doc.save(`Comprobante_CBTis258_${metodo}.pdf`);
}
