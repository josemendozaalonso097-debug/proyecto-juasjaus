import { obtenerHistorial } from './storage.js';

export function generarPDFHistorial() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert("jsPDF no se cargó correctamente");
        return;
    }
    const doc = new jsPDF();
    const historial = obtenerHistorial();
    
    if (historial.length === 0) {
        alert('No hay compras en el historial');
        return;
    }
    
    // Encabezado
    doc.setFillColor(148, 39, 44);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('CBTis 258', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('HISTORIAL DE FACTURAS', 105, 32, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-MX')}`, 105, 50, { align: 'center' });
    
    let y = 65;
    let totalGastado = 0;
    
    historial.forEach((compra, i) => {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`Compra #${i + 1} - ${compra.fecha}`, 20, y);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Método: ${compra.metodoPago}`, 20, y + 7);
        doc.text(`Estado: ${compra.estado}`, 20, y + 14);
        
        compra.productos.forEach((prod, j) => {
            doc.text(`• ${prod.nombre} x${prod.cantidad} - $${(prod.precio * prod.cantidad).toFixed(2)}`, 25, y + 21 + (j * 6));
        });
        
        doc.setFont(undefined, 'bold');
        doc.text(`Subtotal: $${compra.total.toFixed(2)} MXN`, 20, y + 21 + (compra.productos.length * 6) + 5);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y + 28 + (compra.productos.length * 6), 190, y + 28 + (compra.productos.length * 6));
        
        totalGastado += compra.total;
        y += 35 + (compra.productos.length * 6);
    });
    
    // Total final
    doc.setFillColor(240, 240, 240);
    doc.rect(0, y, 210, 20, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(148, 39, 44);
    doc.text(`TOTAL GASTADO: $${totalGastado.toFixed(2)} MXN`, 105, y + 13, { align: 'center' });
    
    doc.save('historial_facturas.pdf');
}

export function generarPDFComprobante(metodo, fechaFormato, total, carritoActual) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert("jsPDF no se cargó correctamente");
        return;
    }
    const doc = new jsPDF();
    const nombreTarjeta = document.querySelector('input[name="input-name"]')?.value || 'No especificado';
    const numeroTarjeta = document.getElementById('serialCardNumber')?.value || 'XXXX XXXX XXXX XXXX';
    
    doc.setFillColor(148, 39, 44);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('CBTis 258', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('COMPROBANTE DE PAGO', 105, 32, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Método: ${metodo}`, 20, 55);
    doc.text(`Titular: ${nombreTarjeta}`, 20, 65);
    doc.text(`Tarjeta: ${numeroTarjeta}`, 20, 75);
    doc.text(`Fecha: ${fechaFormato}`, 20, 85);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PRODUCTOS:', 20, 100);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    
    let y = 110;
    carritoActual.forEach(item => {
        doc.text(`• ${item.nombre} x${item.cantidad}${item.tallaSeleccionada ? ` (${item.tallaSeleccionada})` : ''} - $${(item.precio * item.cantidad).toFixed(2)}`, 25, y);
        y += 8;
    });
    
    doc.setLineWidth(0.5);
    doc.line(20, y + 5, 190, y + 5);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: $${total.toFixed(2)} MXN`, 105, y + 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Gracias por tu compra', 105, y + 30, { align: 'center' });
    doc.save(`comprobante_${metodo}.pdf`);
}
