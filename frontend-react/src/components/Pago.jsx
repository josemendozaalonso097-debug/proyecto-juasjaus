import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { BrowserMultiFormatReader } from '@zxing/library';
import { showToast } from '../utils/toast';
import { guardarEnHistorial, obtenerHistorial } from '../utils/storage';

export default function Pago({ isOpen, onClose, cart, clearCart, mode = 'tienda', onPaymentSuccess }) {
  // Modal stage: 'method', 'card', 'transfer', 'oxxo', 'oxxopay'
  const [stage, setStage] = useState('method');
  
  // Card states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardType, setCardType] = useState('generic');
  
  // Transfer / Deposit states
  const [transferFile, setTransferFile] = useState(null);
  const [referenciaTransfer, setReferenciaTransfer] = useState('');
  const [bancoOrigenTransfer, setBancoOrigenTransfer] = useState('');
  const [fechaTransfer, setFechaTransfer] = useState('');

  const [depositoFile, setDepositoFile] = useState(null);
  const [referenciaDeposito, setReferenciaDeposito] = useState('');
  const [bancoOrigenDeposito, setBancoOrigenDeposito] = useState('');
  const [fechaDeposito, setFechaDeposito] = useState('');

  // Oxxo Pay Camera Scanner
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const barcodeRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Tuition payment limit alert state
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const [maxTuitions, setMaxTuitions] = useState(1);
  const [pendingCallback, setPendingCallback] = useState(null);

  // General state
  const total = mode === 'tienda' 
    ? cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
    : 3000; // default colegiatura price on dashboard is $3,000 MXN

  useEffect(() => {
    if (isOpen) {
      setStage('method');
      resetStates();
    }
  }, [isOpen]);

  // Render Barcode for Oxxo Pay when entering the stage
  useEffect(() => {
    if (stage === 'oxxopay' && barcodeRef.current) {
      try {
        const barcodeVal = `OXXOPAY-${total}`;
        JsBarcode(barcodeRef.current, barcodeVal, {
          format: "CODE128",
          displayValue: true,
          width: 1.5,
          height: 60,
          fontSize: 14
        });
      } catch (err) {
        console.error("Error generating barcode:", err);
      }
    }
  }, [stage, total]);

  // Handle camera scanner
  useEffect(() => {
    if (scanning && stage === 'oxxopay') {
      codeReaderRef.current = new BrowserMultiFormatReader();
      codeReaderRef.current.decodeFromVideoDevice(null, 'scanner-video-react', (result, err) => {
        if (result) {
          console.log("Barcode scanned:", result.text);
          stopScanning();
          handleCheckoutSuccess('Oxxo Pay');
        }
        if (err && !(err.name === 'NotFoundException')) {
          console.error(err);
        }
      }).catch((err) => {
        console.error("Camera access error:", err);
        showToast("No se pudo acceder a la cámara o no hay permisos.", "error");
        stopScanning();
      });
    } else {
      stopScanning();
    }

    return () => stopScanning();
  }, [scanning, stage]);

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setScanning(false);
  };

  const resetStates = () => {
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
    setCardType('generic');
    
    setTransferFile(null);
    setReferenciaTransfer('');
    setBancoOrigenTransfer('');
    setFechaTransfer('');

    setDepositoFile(null);
    setReferenciaDeposito('');
    setBancoOrigenDeposito('');
    setFechaDeposito('');

    stopScanning();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('✓ Copiado al portapapeles', 'success');
    });
  };

  // Card Brand Detection
  const handleCardNumberChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);

    if (raw.startsWith('4')) {
      setCardType('visa');
    } else if (raw.startsWith('5')) {
      setCardType('mastercard');
    } else if (raw.startsWith('37') || raw.startsWith('34')) {
      setCardType('amex');
    } else {
      setCardType('generic');
    }
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      raw = raw.substring(0, 2) + '/' + raw.substring(2, 4);
    }
    setCardExpiry(raw);
  };

  // Validations
  const isCardNumberValid = cardNumber.replace(/\s/g, '').length === 16;
  const isExpiryValid = () => {
    if (cardExpiry.length !== 5) return false;
    const [month] = cardExpiry.split('/');
    const m = parseInt(month, 10);
    return m >= 1 && m <= 12;
  };
  const isCVVValid = cardCVV.length >= 3 && cardCVV.length <= 4;
  const isCardNameValid = cardName.trim().length >= 3;

  const getValidationStyle = (isValid) => {
    if (isValid) return { borderColor: '#27ae60' };
    return { borderColor: '#e74c3c' };
  };

  // Tuition Payment Limits Check
  const checkTuitionLimit = (callback) => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) {
      callback();
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      const perfilRaw = localStorage.getItem(`perfil_${user.id}`);
      const perfil = perfilRaw ? JSON.parse(perfilRaw) : {};
      const rol = (perfil.rol || user.rol || 'estudiante').toLowerCase();
      const semestreStr = perfil.semestre || user.semestre || '1';

      if (rol === 'estudiante') {
        const semestreDelUsuario = parseInt(semestreStr, 10) || 1;
        const maxPagosPermitidos = Math.max(0, (6 - semestreDelUsuario) + 1);
        
        const historial = obtenerHistorial() || [];
        let count = 0;
        historial.forEach(compra => {
          if (compra.productos && compra.productos.some(p => p.nombre.toLowerCase().includes('colegiatura'))) {
            count++;
          }
        });

        // Also check what is inside the current cart (if in tienda mode)
        const isAddingColegiatura = mode === 'tienda' 
          ? cart.some(p => p.nombre.toLowerCase().includes('colegiatura'))
          : true; // principal mode tuition is always colegiatura

        if (isAddingColegiatura && count >= maxPagosPermitidos) {
          setMaxTuitions(maxPagosPermitidos);
          setPendingCallback(() => callback);
          setShowLimitAlert(true);
          return;
        }
      }
    } catch (e) {
      console.error("Error verifying tuition limit:", e);
    }
    
    callback();
  };

  const handleCardPaymentSubmit = (e) => {
    e.preventDefault();
    if (!isCardNameValid || !isCardNumberValid || !isExpiryValid() || !isCVVValid) {
      showToast('Por favor llena todos los campos de tarjeta correctamente.', 'warning');
      return;
    }

    checkTuitionLimit(() => {
      handleCheckoutSuccess(mode === 'tienda' ? 'Tarjeta' : 'Tarjeta Bancaria');
    });
  };

  const handleCheckoutSuccess = (metodoPago) => {
    const fecha = new Date();
    const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const fechaFormato = `${fecha.getDate().toString().padStart(2, '0')}/${meses[fecha.getMonth()]}/${fecha.getFullYear()}`;
    
    let itemsAdquiridos = [];
    if (mode === 'tienda') {
      itemsAdquiridos = cart.map(item => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        tallaSeleccionada: item.tallaSeleccionada
      }));
    } else {
      itemsAdquiridos = [{ nombre: "Colegiatura Mensual", precio: 3000, cantidad: 1 }];
    }

    const compra = {
      fecha: fechaFormato,
      metodoPago: metodoPago,
      productos: itemsAdquiridos,
      total: total,
      estado: (metodoPago === 'Tarjeta' || metodoPago === 'Tarjeta Bancaria' || metodoPago === 'Oxxo Pay') ? 'Completado' : 'Pendiente'
    };

    guardarEnHistorial(compra);
    
    // Generate PDF receipt
    generarPDFComprobante(metodoPago, fechaFormato, total, itemsAdquiridos);
    
    // Play confetti
    lanzarConfeti();

    if (mode === 'tienda') {
      clearCart();
    }
    
    onClose();

    // Show custom alert
    mostrarConfirmacionCheckout(metodoPago);

    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  const lanzarConfeti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        zIndex: 100004
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        zIndex: 100004
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const mostrarConfirmacionCheckout = (metodo) => {
    const esTarjeta = metodo === 'Tarjeta' || metodo === 'Tarjeta Bancaria' || metodo === 'Oxxo Pay';
    const titulo = esTarjeta ? "¡Pago Exitoso!" : "¡Comprobante recibido!";
    const mensaje = esTarjeta 
        ? `Tu pago con ${metodo} se procesó correctamente.<br><strong>Estado: Completado</strong>`
        : `Tu comprobante de ${metodo} fue recibido exitosamente.<br><strong>Estado: Pendiente de verificación</strong><br><br>Te notificaremos una vez que sea validado.`;

    const confirmacion = document.createElement('div');
    confirmacion.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: white; padding: 40px; border-radius: 20px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); z-index: 100003;
        text-align: center; max-width: 400px; border: 3px solid #27ae60;
    `;
    confirmacion.innerHTML = `
        <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
        <h2 style="color: #27ae60; margin-bottom: 15px; font-size: 1.5em; font-weight: bold;">${titulo}</h2>
        <p style="color: #666; margin-bottom: 20px; line-height: 1.6;">
            ${mensaje}
        </p>
        <button class="btn-ok-checkout" style="
            background: #27ae60; color: white; border: none; padding: 12px 30px;
            border-radius: 10px; font-size: 1em; font-weight: 600; cursor: pointer;
        ">Entendido</button>
    `;
    document.body.appendChild(confirmacion);
    document.body.style.overflow = 'hidden';

    confirmacion.querySelector('.btn-ok-checkout').onclick = () => {
      confirmacion.remove();
      document.body.style.overflow = 'auto';
    };
  };

  // PDF generation implementation (using standard jsPDF in npm)
  const generarPDFComprobante = (metodo, fechaFormato, totalMonto, items) => {
    const doc = new jsPDF();
    const userRaw = localStorage.getItem('user');
    let nombreUsuario = 'Usuario';
    try {
      if (userRaw) {
        nombreUsuario = JSON.parse(userRaw).nombre || 'Usuario';
      }
    } catch (e) {
      console.error(e);
    }

    const nombreTarjeta = cardName || nombreUsuario;
    const primaryRGB = [227, 30, 36];

    doc.setFillColor(...primaryRGB);
    doc.rect(0, 0, 210, 50, 'F');
    
    try {
      doc.addImage("/imgs/dgeti_red-removebg-preview.png", "PNG", 10, 8, 35, 35);
    } catch (e) {
      console.warn("Logo load error in PDF:", e);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('CBTis 258', 115, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('COMPROBANTE OFICIAL DE PAGO', 115, 35, { align: 'center' });
    
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
    
    doc.setFont(undefined, 'bold');
    doc.text('PRODUCTO', 25, 105);
    doc.text('CANTIDAD', 120, 105);
    doc.text('SUBTOTAL', 165, 105);
    
    let y = 115;
    doc.setFont(undefined, 'normal');
    items.forEach(item => {
      const itemTotal = item.precio * item.cantidad;
      doc.text(`• ${item.nombre} ${item.tallaSeleccionada ? `(${item.tallaSeleccionada})` : ''}`, 25, y);
      doc.text(`${item.cantidad}`, 125, y);
      doc.text(`$${itemTotal.toFixed(2)}`, 165, y);
      y += 8;
    });
    
    y += 10;
    doc.setFillColor(248, 249, 250);
    doc.rect(130, y, 60, 20, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(130, y, 60, 20, 'S');
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryRGB);
    doc.text(`TOTAL: $${totalMonto.toFixed(2)}`, 160, y + 13, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('Gracias por su preferencia', 105, y + 40, { align: 'center' });
    doc.text('"Un motivo de orgullo"', 105, y + 46, { align: 'center' });
    
    doc.save(`Comprobante_CBTis258_${metodo}.pdf`);
  };

  const handleFileUpload = (e, method) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('El archivo es demasiado grande. Máximo 5MB.', 'error');
        return;
      }
      if (method === 'transfer') {
        setTransferFile(file);
      } else {
        setDepositoFile(file);
      }
    }
  };

  const getCardLogo = (type) => {
    const style = { display: 'block' };
    if (type === 'visa') {
      return (
        <svg width="50" height="32" viewBox="0 0 50 32" style={style}>
          <rect width="50" height="32" rx="4" fill="#1434CB"/>
          <text x="25" y="20" fontFamily="Arial" fontWeight="bold" fontSize="12" fill="white" textAnchor="middle">VISA</text>
        </svg>
      );
    }
    if (type === 'mastercard') {
      return (
        <svg width="50" height="32" viewBox="0 0 50 32" style={style}>
          <rect width="50" height="32" rx="4" fill="#EB001B"/>
          <circle cx="19" cy="16" r="10" fill="#FF5F00" opacity="0.8"/>
          <circle cx="31" cy="16" r="10" fill="#F79E1B" opacity="0.8"/>
        </svg>
      );
    }
    if (type === 'amex') {
      return (
        <svg width="50" height="32" viewBox="0 0 50 32" style={style}>
          <rect width="50" height="32" rx="4" fill="#006FCF"/>
          <text x="25" y="20" fontFamily="Arial" fontWeight="bold" fontSize="10" fill="white" textAnchor="middle">AMEX</text>
        </svg>
      );
    }
    return (
      <svg width="50" height="32" viewBox="0 0 50 32" style={style}>
        <rect width="50" height="32" rx="4" fill="#94272C"/>
        <rect x="5" y="8" width="40" height="6" rx="2" fill="white" opacity="0.3"/>
        <rect x="5" y="18" width="15" height="4" rx="1" fill="white" opacity="0.5"/>
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 1. Modal: Method selection */}
      {stage === 'method' && (
        <div style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '90%', maxWidth: '500px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ background: 'linear-gradient(135deg, #f20d0d, #6e0404)', padding: '25px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '28px' }}>payments</span>
                <h2 style={{ color: 'white', fontSize: '1.4em', fontWeight: '700', margin: 0 }}>Método de Pago</h2>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>&times;</button>
            </div>
            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 10px 0', fontSize: '0.95em' }}>Selecciona cómo deseas realizar tu pago</p>

              {/* Tarjeta */}
              <button 
                onClick={() => setStage('card')} 
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', border: '2px solid #e2e8f0', borderRadius: '14px', background: '#f8f9fa', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s ease' }} 
                className="hover:border-primary hover:bg-[#fff5f5]"
              >
                <span className="material-symbols-outlined text-[#f20d0d] text-[30px]">credit_card</span>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1em' }}>Tarjeta de Crédito / Débito</div>
                  <div style={{ fontSize: '0.82em', color: '#64748b', marginTop: '2px' }}>Visa, Mastercard, AMEX</div>
                </div>
              </button>

              {/* Transferencia */}
              <button 
                onClick={() => setStage('transfer')} 
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', border: '2px solid #e2e8f0', borderRadius: '14px', background: '#f8f9fa', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s ease' }}
                className="hover:border-primary hover:bg-[#fff5f5]"
              >
                <span className="material-symbols-outlined text-[#f20d0d] text-[30px]">account_balance</span>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1em' }}>Transferencia Bancaria</div>
                  <div style={{ fontSize: '0.82em', color: '#64748b', marginTop: '2px' }}>SPEI / Depósito a cuenta</div>
                </div>
              </button>

              {/* OXXO Clásico */}
              <button 
                onClick={() => setStage('oxxo')} 
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', border: '2px solid #e2e8f0', borderRadius: '14px', background: '#f8f9fa', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s ease' }}
                className="hover:border-primary hover:bg-[#fff5f5]"
              >
                <span className="material-symbols-outlined text-[#f20d0d] text-[30px]">store</span>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1em' }}>Depósito OXXO</div>
                  <div style={{ fontSize: '0.82em', color: '#64748b', marginTop: '2px' }}>Sube tu comprobante de pago</div>
                </div>
              </button>

              {/* Oxxo Pay */}
              <button 
                onClick={() => setStage('oxxopay')} 
                style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', border: '2px solid #e2e8f0', borderRadius: '14px', background: '#f8f9fa', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'all 0.2s ease' }}
                className="hover:border-primary hover:bg-[#fff5f5]"
              >
                <span className="material-symbols-outlined text-[#f20d0d] text-[30px]">qr_code_scanner</span>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1em' }}>Pago OXXO Pay</div>
                  <div style={{ fontSize: '0.82em', color: '#64748b', marginTop: '2px' }}>Escanea el código de barras en caja</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Credit card */}
      {stage === 'card' && (
        <section className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleCardPaymentSubmit} className="form relative w-[95%] max-w-[420px] bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#f20d0d] to-[#6e0404] px-6 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-3xl">credit_card</span>
                <h2 className="text-white text-xl font-bold m-0">Pago Seguro</h2>
              </div>
              <button type="button" onClick={() => setStage('method')} className="text-white bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              <div className="text-center mb-6">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Total a Pagar</p>
                <h3 className="text-[2rem] font-black text-slate-800 dark:text-white mt-1 leading-none form-total">
                  ${total.toFixed(2)} MXN
                </h3>
              </div>

              <div className="block relative">
                <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 mb-2 ml-1">Titular de la tarjeta</span>
                <div className="relative">
                  <input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={cardName ? getValidationStyle(isCardNameValid) : {}}
                    className="input-field w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#f20d0d] focus:ring-4 focus:ring-[#f20d0d]/10 transition-all font-medium"
                    type="text"
                    placeholder="Nombre exacto"
                    required
                  />
                  {cardName && (
                    <span className="absolute right-4 top-3.5 font-bold" style={{ color: isCardNameValid ? '#27ae60' : '#e74c3c' }}>
                      {isCardNameValid ? '✓' : '✕'}
                    </span>
                  )}
                </div>
              </div>

              <div className="block relative">
                <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 mb-2 ml-1">Número de tarjeta</span>
                <div className="relative">
                  <input
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    style={cardNumber ? getValidationStyle(isCardNumberValid) : {}}
                    className="input-field w-full pl-4 pr-[70px] py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#f20d0d] focus:ring-4 focus:ring-[#f20d0d]/10 transition-all font-bold tracking-widest text-lg font-mono"
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                    required
                  />
                  <div className="absolute right-14 top-2.5 z-10">
                    {getCardLogo(cardType)}
                  </div>
                  {cardNumber && (
                    <span className="absolute right-4 top-3.5 font-bold" style={{ color: isCardNumberValid ? '#27ae60' : '#e74c3c' }}>
                      {isCardNumberValid ? '✓' : '✕'}
                    </span>
                  )}
                </div>
              </div>

              <div className="split flex gap-5">
                <div className="block relative w-1/2">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 mb-2 ml-1">Expiración</span>
                  <div className="relative">
                    <input
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      style={cardExpiry ? getValidationStyle(isExpiryValid()) : {}}
                      className="input-field w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#f20d0d] focus:ring-4 focus:ring-[#f20d0d]/10 transition-all font-medium text-center tracking-widest font-mono"
                      type="text"
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                    {cardExpiry && (
                      <span className="absolute right-3 top-3.5 font-bold text-xs" style={{ color: isExpiryValid() ? '#27ae60' : '#e74c3c' }}>
                        {isExpiryValid() ? '✓' : '✕'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="block relative w-1/2">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 mb-2 ml-1">C V V</span>
                  <div className="relative">
                    <input
                      value={cardCVV}
                      onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      style={cardCVV ? getValidationStyle(isCVVValid) : {}}
                      className="input-field w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-[#f20d0d] focus:ring-4 focus:ring-[#f20d0d]/10 transition-all font-medium text-center tracking-widest font-mono"
                      type="password"
                      placeholder="•••"
                      maxLength="4"
                      required
                    />
                    {cardCVV && (
                      <span className="absolute right-3 top-3.5 font-bold text-xs" style={{ color: isCVVValid ? '#27ae60' : '#e74c3c' }}>
                        {isCVVValid ? '✓' : '✕'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <input 
                className="checkout-btn w-full mt-2 bg-gradient-to-r from-[#f20d0d] to-[#af101a] text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(242,13,13,0.25)] hover:shadow-[0_12px_28px_rgba(242,13,13,0.35)] hover:-translate-y-1 transition-all cursor-pointer text-base uppercase tracking-widest disabled:opacity-50" 
                type="submit" 
                value="Procesar Pago" 
                disabled={!isCardNameValid || !isCardNumberValid || !isExpiryValid() || !isCVVValid}
              />
            </div>
          </form>
        </section>
      )}

      {/* 3. Modal: Bank transfer */}
      {stage === 'transfer' && (
        <div style={{ display: 'block', position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>
          <div className="modal-transferencia-content bg-white dark:bg-slate-900" style={{ borderRadius: '20px', width: '90%', maxWidth: '850px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ background: 'linear-gradient(135deg, #f20d0d, #6e0404)', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>account_balance</span>
                <h2 style={{ fontSize: '1.35em', fontWeight: '700', margin: 0 }}>Transferencia Bancaria</h2>
              </div>
              <button type="button" onClick={() => setStage('method')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>&times;</button>
            </div>

            <div className="transferencia-container grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
              {/* Bancarios */}
              <div className="info-bancaria md:col-span-1 border-r border-slate-200 dark:border-slate-800 pr-6">
                <h3 className="font-bold mb-4 dark:text-white">📋 Datos para transferencia</h3>
                
                <div className="mb-4">
                  <span className="text-xs text-slate-500 font-bold block">Banco:</span>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold dark:text-white" id="bancoCopia">Banamex</span>
                    <button className="text-xs p-1 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer" onClick={() => copyToClipboard('Banamex')}>📋</button>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-xs text-slate-500 font-bold block">Número de cuenta:</span>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-semibold dark:text-white" id="cuentaCopia">1234 5678 9012 3456</span>
                    <button className="text-xs p-1 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer" onClick={() => copyToClipboard('1234567890123456')}>📋</button>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-xs text-slate-500 font-bold block">CLABE:</span>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-semibold dark:text-white" id="clabeCopia">002180012345678901</span>
                    <button className="text-xs p-1 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer" onClick={() => copyToClipboard('002180012345678901')}>📋</button>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-xs text-slate-500 font-bold block">Titular:</span>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold dark:text-white truncate max-w-[150px]" id="titularCopia">CBTis 258</span>
                    <button className="text-xs p-1 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer" onClick={() => copyToClipboard('CBTis 258 - Servicios Financieros')}>📋</button>
                  </div>
                </div>

                <div className="total-pagar mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-bold block">Monto a pagar:</span>
                  <span className="text-xl font-bold text-primary">${total.toFixed(2)} MXN</span>
                </div>
              </div>

              {/* Formulario */}
              <div className="form-comprobante md:col-span-2">
                <h3 className="font-bold mb-4 dark:text-white">📤 Subir comprobante de transferencia</h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!transferFile) { showToast('Sube un comprobante de pago.', 'warning'); return; }
                  checkTuitionLimit(() => handleCheckoutSuccess('Transferencia'));
                }} className="space-y-4">
                  {!transferFile ? (
                    <div 
                      onClick={() => document.getElementById('comprobanteFileTransferencia').click()}
                      className="upload-area border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <input 
                        type="file" 
                        id="comprobanteFileTransferencia" 
                        accept="image/*,application/pdf" 
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'transfer')}
                      />
                      <div className="text-3xl mb-2">📄</div>
                      <p className="font-semibold dark:text-white text-sm">Click para seleccionar archivo</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG o PDF (máx. 5MB)</p>
                    </div>
                  ) : (
                    <div className="archivo-seleccionado p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl flex justify-between items-center">
                      <span className="text-sm font-semibold truncate max-w-[300px] dark:text-white">📎 {transferFile.name}</span>
                      <button 
                        type="button" 
                        className="text-[#e74c3c] font-bold cursor-pointer bg-transparent border-none"
                        onClick={() => setTransferFile(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Número de referencia (opcional)</label>
                      <input 
                        type="text" 
                        value={referenciaTransfer}
                        onChange={(e) => setReferenciaTransfer(e.target.value)}
                        className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                        placeholder="Ej: 123456789"
                      />
                    </div>

                    <div className="form-group flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Banco de origen (opcional)</label>
                      <input 
                        type="text" 
                        value={bancoOrigenTransfer}
                        onChange={(e) => setBancoOrigenTransfer(e.target.value)}
                        className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                        placeholder="Ej: BBVA, Santander"
                      />
                    </div>

                    <div className="form-group flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fecha de la transferencia (opcional)</label>
                      <input 
                        type="date" 
                        value={fechaTransfer}
                        onChange={(e) => setFechaTransfer(e.target.value)}
                        className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl cursor-pointer hover:bg-red-700 disabled:opacity-50 mt-4"
                    disabled={!transferFile}
                  >
                    Enviar comprobante
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Oxxo Deposit */}
      {stage === 'oxxo' && (
        <div style={{ display: 'block', position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>
          <div className="modal-deposito-content bg-white dark:bg-slate-900" style={{ borderRadius: '20px', width: '90%', maxWidth: '800px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ background: 'linear-gradient(135deg, #f20d0d, #6e0404)', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>store</span>
                <h2 style={{ fontSize: '1.35em', fontWeight: '700', margin: 0 }}>Pago por Depósito</h2>
              </div>
              <button type="button" onClick={() => setStage('method')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>&times;</button>
            </div>

            <div className="deposito-container grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
              {/* Bancarios */}
              <div className="info-bancaria md:col-span-1 border-r border-slate-200 dark:border-slate-800 pr-6">
                <h3 className="font-bold mb-4 dark:text-white">📋 Datos para depósito</h3>
                <div className="mb-4">
                  <span className="text-xs text-slate-500 font-bold block">Banco:</span>
                  <span className="font-semibold dark:text-white">Banamex</span>
                </div>
                <div className="mb-4">
                  <span className="text-xs text-slate-500 font-bold block">Número de cuenta:</span>
                  <span className="font-mono font-semibold dark:text-white">1234 5678 9012 3456</span>
                </div>
                <div className="mb-4">
                  <span className="text-xs text-slate-500 font-bold block">CLABE:</span>
                  <span className="font-mono font-semibold dark:text-white">002180012345678901</span>
                </div>
                <div className="mb-4">
                  <span className="text-xs text-slate-500 font-bold block">Titular:</span>
                  <span className="font-semibold dark:text-white">CBTis 258</span>
                </div>
                <div className="total-pagar mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 font-bold block">Monto a pagar:</span>
                  <span className="text-xl font-bold text-primary">${total.toFixed(2)} MXN</span>
                </div>
              </div>

              {/* Formulario */}
              <div className="form-comprobante md:col-span-2">
                <h3 className="font-bold mb-4 dark:text-white">📤 Subir comprobante de pago</h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!depositoFile) { showToast('Sube un comprobante de pago.', 'warning'); return; }
                  checkTuitionLimit(() => handleCheckoutSuccess('Depósito'));
                }} className="space-y-4">
                  {!depositoFile ? (
                    <div 
                      onClick={() => document.getElementById('comprobanteFile').click()}
                      className="upload-area border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <input 
                        type="file" 
                        id="comprobanteFile" 
                        accept="image/*,application/pdf" 
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, 'deposit')}
                      />
                      <div className="text-3xl mb-2">📄</div>
                      <p className="font-semibold dark:text-white text-sm">Click para seleccionar archivo</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG o PDF (máx. 5MB)</p>
                    </div>
                  ) : (
                    <div className="archivo-seleccionado p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl flex justify-between items-center">
                      <span className="text-sm font-semibold truncate max-w-[300px] dark:text-white">📎 {depositoFile.name}</span>
                      <button 
                        type="button" 
                        className="text-[#e74c3c] font-bold cursor-pointer bg-transparent border-none"
                        onClick={() => setDepositoFile(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Número de referencia (opcional)</label>
                      <input 
                        type="text" 
                        value={referenciaDeposito}
                        onChange={(e) => setReferenciaDeposito(e.target.value)}
                        className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                        placeholder="Ej: 123456789"
                      />
                    </div>

                    <div className="form-group flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Banco de origen (opcional)</label>
                      <input 
                        type="text" 
                        value={bancoOrigenDeposito}
                        onChange={(e) => setBancoOrigenDeposito(e.target.value)}
                        className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                        placeholder="Ej: BBVA, Santander"
                      />
                    </div>

                    <div className="form-group flex flex-col gap-1 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Fecha del depósito (opcional)</label>
                      <input 
                        type="date" 
                        value={fechaDeposito}
                        onChange={(e) => setFechaDeposito(e.target.value)}
                        className="rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3.5 bg-primary text-white font-bold rounded-xl cursor-pointer hover:bg-red-700 disabled:opacity-50 mt-4"
                    disabled={!depositoFile}
                  >
                    Enviar comprobante
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal: Oxxo Pay barcode scan */}
      {stage === 'oxxopay' && (
        <div style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>
          <div className="bg-white dark:bg-slate-900 rounded-[20px] w-[90%] max-w-[500px] overflow-hidden shadow-2xl">
            <div style={{ background: 'linear-gradient(135deg, #f20d0d, #6e0404)', padding: '22px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
                <h2 style={{ fontSize: '1.35em', fontWeight: '700', margin: 0 }}>OXXO Pay</h2>
              </div>
              <button type="button" onClick={() => setStage('method')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center' }}>&times;</button>
            </div>

            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <h3 className="dark:text-white" style={{ margin: 0, fontSize: '1.2em' }}>Total a pagar: <span style={{ color: '#f20d0d', fontWeight: 'bold' }}>${total.toFixed(2)} MXN</span></h3>
              
              <div style={{ background: '#f8f9fa', border: '2px dashed #e2e8f0', padding: '20px', borderRadius: '14px', textAlign: 'center', width: '100%' }} className="dark:bg-slate-800 dark:border-slate-700">
                <p style={{ marginTop: 0, color: '#64748b', fontSize: '0.9em', marginBottom: '10px' }} className="dark:text-slate-400">Dicta o escanea este código en caja</p>
                <div style={{ display: 'flex', justifyContent: 'center', background: 'white', padding: '10px', borderRadius: '10px' }}>
                  <svg ref={barcodeRef} id="barcode"></svg>
                </div>
              </div>

              {scanning && (
                <div id="scanner-container" style={{ width: '100%', borderRadius: '14px', overflow: 'hidden', border: '2px solid #e2e8f0', position: 'relative', background: 'black' }}>
                  <video id="scanner-video-react" style={{ width: '100%', height: 'auto', maxHeight: '300px', display: 'block', objectFit: 'cover' }}></video>
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <button onClick={() => setScanning(false)} style={{ background: 'rgba(255,0,0,0.8)', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Cámara</button>
                  </div>
                </div>
              )}

              {!scanning && (
                <button 
                  id="btn-escanear-oxxopay" 
                  onClick={() => setScanning(true)} 
                  style={{ width: '100%', background: '#f20d0d', color: 'white', fontWeight: '700', padding: '15px', border: 'none', borderRadius: '12px', fontSize: '1.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.2s' }} 
                  className="hover:bg-red-700"
                >
                  <span className="material-symbols-outlined">center_focus_strong</span>
                  Simular Escaneo (WebCam)
                </button>
              )}
              
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8em', margin: 0 }}>Presiona el botón para abrir la cámara web y escanear el código de barras generado para simular el pago en Oxxo.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tuition Limits Alert Confirmation */}
      {showLimitAlert && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10005,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: 'white', padding: '40px', borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)', textAlign: 'center', maxWidth: '400px'
          }}>
            <div style={{ fontSize: '4em', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ color: '#e67e22', marginBottom: '15px', fontSize: '1.5em', fontWeight: 'bold' }}>Límite de colegiaturas alcanzado</h2>
            <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.6' }}>
              De acuerdo a tu grado actual, has alcanzado tu límite de <strong>{maxTuitions === 1 ? '1 pago' : `${maxTuitions} pagos`}</strong> de colegiatura correspondientes a lo que restaba de tu plan de estudios.<br/><br/>
              ¿Estás seguro de que quieres realizar otro pago adicional?
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  setShowLimitAlert(false);
                  setPendingCallback(null);
                }} 
                style={{
                  background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px 25px',
                  borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowLimitAlert(false);
                  if (pendingCallback) {
                    pendingCallback();
                  }
                }} 
                style={{
                  background: '#e67e22', color: 'white', border: 'none', padding: '12px 25px',
                  borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Sí, continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
