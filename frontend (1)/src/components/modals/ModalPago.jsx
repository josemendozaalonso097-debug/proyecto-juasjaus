import React, { useState, useEffect, useRef } from 'react';
import { guardarEnHistorial } from '../../utils/storage.js';
import { generarPDFComprobante } from '../../utils/pdf.js';

const showToast = (message, type = 'info') => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[Toast ${type}]: ${message}`);
  }
};

export default function ModalPago({ isOpen, onClose, total = 3000, items = null, onPaymentSuccess }) {
  // Steps: 'method', 'card', 'transfer', 'deposit', 'oxxopay', 'success'
  const [step, setStep] = useState('method');
  const [loading, setLoading] = useState(false);

  // Card details
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardType, setCardType] = useState('generic');
  
  // Card validation icons state
  const [validName, setValidName] = useState(null);
  const [validNumber, setValidNumber] = useState(null);
  const [validExpiry, setValidExpiry] = useState(null);
  const [validCvv, setValidCvv] = useState(null);

  // Deposit/Transfer receipt details
  const [receiptFile, setReceiptFile] = useState(null);
  const [reference, setReference] = useState('');
  const [sourceBank, setSourceBank] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const codeReaderRef = useRef(null);

  // Barcode Ref
  const barcodeSvgRef = useRef(null);

  // Success dialog info
  const [successInfo, setSuccessInfo] = useState({ title: '', message: '' });

  useEffect(() => {
    if (isOpen) {
      setStep('method');
      // Reset fields
      setCardName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      setCardType('generic');
      setValidName(null);
      setValidNumber(null);
      setValidExpiry(null);
      setValidCvv(null);
      setReceiptFile(null);
      setReference('');
      setSourceBank('');
      setPaymentDate('');
      setScannerActive(false);
    }
  }, [isOpen]);

  // Card validation helper
  const handleCardNumberChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    raw = raw.slice(0, 16);
    let formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);

    // Detect card type
    if (raw.startsWith('4')) setCardType('visa');
    else if (raw.startsWith('5')) setCardType('mastercard');
    else if (raw.startsWith('34') || raw.startsWith('37')) setCardType('amex');
    else if (raw.length === 0) setCardType('generic');
    else setCardType('generic');

    setValidNumber(raw.length === 16);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setCardExpiry(val);
    
    if (val.length === 5) {
      const [month, year] = val.split('/');
      const m = parseInt(month, 10);
      setValidExpiry(m >= 1 && m <= 12);
    } else {
      setValidExpiry(null);
    }
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(val);
    setValidCvv(val.length >= 3);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setCardName(val);
    setValidName(val.trim().length >= 3);
  };

  // Render Barcode when Oxxo Pay opens
  useEffect(() => {
    if (step === 'oxxopay' && barcodeSvgRef.current && window.JsBarcode) {
      const barcodeValue = `OXXOPAY-${total}`;
      window.JsBarcode(barcodeSvgRef.current, barcodeValue, {
        format: "CODE128",
        displayValue: true,
        width: 1.5,
        height: 60,
        fontSize: 14
      });
    }
  }, [step, total]);

  // Webcam Scanner
  const startScanner = () => {
    if (typeof window.ZXing === 'undefined') {
      showToast("La librería del escáner no cargó correctamente.", 'error');
      return;
    }
    setScannerActive(true);
    
    if (!codeReaderRef.current) {
      codeReaderRef.current = new window.ZXing.BrowserMultiFormatReader();
    }

    codeReaderRef.current.decodeFromVideoDevice(null, 'scanner-video', (result, err) => {
      if (result) {
        console.log("Código leído: ", result.text);
        stopScanner();
        handleSuccessfulPurchase('Oxxo Pay');
      }
      if (err && !(err instanceof window.ZXing.NotFoundException)) {
        console.error(err);
      }
    }).catch((err) => {
      console.error("Error al iniciar cámara: ", err);
      showToast("No se pudo acceder a la cámara o no hay permisos.", 'error');
      stopScanner();
    });
  };

  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScannerActive(false);
  };

  const handleSuccessfulPurchase = (metodoPago) => {
    const fecha = new Date();
    const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    const fechaFormato = `${fecha.getDate().toString().padStart(2, '0')}/${meses[fecha.getMonth()]}/${fecha.getFullYear()}`;
    
    const compraItems = (items && items.length > 0) ? items : [{ nombre: 'Colegiatura Semestral', precio: total, cantidad: 1 }];

    const compra = {
      fecha: fechaFormato,
      metodoPago: metodoPago,
      productos: compraItems.map(item => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
        tallaSeleccionada: item.tallaSeleccionada || null
      })),
      total: total,
      estado: (metodoPago === 'Tarjeta' || metodoPago === 'Tarjeta Bancaria' || metodoPago === 'Oxxo Pay') ? 'Completado' : 'Pendiente'
    };

    guardarEnHistorial(compra);
    
    if (window.jspdf) {
      generarPDFComprobante(metodoPago, fechaFormato, total, compraItems);
    } else {
      console.warn("jsPDF is not loaded. Skipping receipt PDF generation.");
    }
    
    const esTarjeta = metodoPago === 'Tarjeta' || metodoPago === 'Tarjeta Bancaria' || metodoPago === 'Oxxo Pay';
    setSuccessInfo({
      title: esTarjeta ? "¡Pago Exitoso!" : "¡Comprobante recibido!",
      message: esTarjeta 
        ? `Tu pago con ${metodoPago} se procesó correctamente.\nEstado: Completado`
        : `Tu comprobante de ${metodoPago} fue recibido exitosamente.\nEstado: Pendiente de verificación\n\nTe notificaremos una vez que sea validado.`
    });

    setStep('success');

    // Confetti effect
    if (esTarjeta && typeof window.confetti === 'function') {
      window.confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#af101a', '#ffffff', '#005faf']
      });
    }

    if (onPaymentSuccess) {
      onPaymentSuccess(compra);
    }
  };

  const getCardLogo = () => {
    switch (cardType) {
      case 'visa':
        return <span className="absolute right-4 bottom-3.5 z-10 text-blue-600 font-extrabold text-sm font-mono tracking-tighter">VISA</span>;
      case 'mastercard':
        return <span className="absolute right-4 bottom-3.5 z-10 text-orange-500 font-extrabold text-sm font-mono tracking-tighter">MC</span>;
      case 'amex':
        return <span className="absolute right-4 bottom-3.5 z-10 text-teal-600 font-extrabold text-sm font-mono tracking-tighter">AMEX</span>;
      default:
        return <span className="material-symbols-outlined absolute right-4 bottom-3.5 z-10 text-slate-400">credit_card</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-[450px] bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Step: SELECT METHOD */}
        {step === 'method' && (
          <div>
            <div className="bg-gradient-to-r from-primary to-red-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-3xl">payments</span>
                <h2 className="text-white text-xl font-bold">Método de Pago</h2>
              </div>
              <button onClick={onClose} className="text-white bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-4">Selecciona cómo deseas realizar tu pago</p>
              
              {/* Tarjeta */}
              <button onClick={() => setStep('card')} className="flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl w-full text-left bg-slate-50 dark:bg-slate-800 hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-all">
                <span className="material-symbols-outlined text-primary text-3xl">credit_card</span>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">Tarjeta de Crédito / Débito</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Visa, Mastercard, AMEX</div>
                </div>
              </button>

              {/* Transferencia SPEI */}
              <button onClick={() => setStep('transfer')} className="flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl w-full text-left bg-slate-50 dark:bg-slate-800 hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-all">
                <span className="material-symbols-outlined text-primary text-3xl">account_balance</span>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">Transferencia Bancaria</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">SPEI / Depósito a cuenta</div>
                </div>
              </button>

              {/* OXXO Deposito */}
              <button onClick={() => setStep('deposit')} className="flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl w-full text-left bg-slate-50 dark:bg-slate-800 hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-all">
                <span className="material-symbols-outlined text-primary text-3xl">store</span>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">Depósito OXXO</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Sube tu comprobante de pago físico</div>
                </div>
              </button>

              {/* Oxxo Pay */}
              <button onClick={() => setStep('oxxopay')} className="flex items-center gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-2xl w-full text-left bg-slate-50 dark:bg-slate-800 hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-all">
                <span className="material-symbols-outlined text-primary text-3xl">qr_code_scanner</span>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white">Pago OXXO Pay</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Escanea el código de barras en caja</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step: CARD CHECKOUT */}
        {step === 'card' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSuccessfulPurchase('Tarjeta Bancaria'); }} className="form relative w-full">
            <div className="bg-gradient-to-r from-primary to-red-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-3xl">credit_card</span>
                <h2 className="text-white text-xl font-bold">Pago Seguro</h2>
              </div>
              <button type="button" onClick={() => setStep('method')} className="text-white bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
              </button>
            </div>
            
            <div className="p-8 space-y-5">
              <div className="text-center mb-4">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Total a Pagar</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  ${total.toFixed(2)} MXN
                </h3>
              </div>

              {/* Titular */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Titular de la tarjeta</span>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={handleNameChange}
                    placeholder="Nombre completo"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-medium outline-none"
                    style={{ borderColor: validName === true ? '#27ae60' : validName === false ? '#e74c3c' : undefined }}
                  />
                  {validName === true && <span className="absolute right-4 text-[#27ae60] font-bold">✓</span>}
                  {validName === false && <span className="absolute right-4 text-[#e74c3c] font-bold">✕</span>}
                </div>
              </div>

              {/* Número de tarjeta */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Número de tarjeta</span>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                    className="w-full pl-4 pr-16 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-mono tracking-widest text-base outline-none"
                    style={{ borderColor: validNumber === true ? '#27ae60' : validNumber === false ? '#e74c3c' : undefined }}
                  />
                  {getCardLogo()}
                  {validNumber === true && <span className="absolute right-12 text-[#27ae60] font-bold">✓</span>}
                </div>
              </div>

              {/* Expiración & CVV */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Expiración</span>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-center tracking-widest font-mono outline-none"
                    style={{ borderColor: validExpiry === true ? '#27ae60' : validExpiry === false ? '#e74c3c' : undefined }}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">CVV</span>
                  <input
                    type="password"
                    required
                    value={cardCvv}
                    onChange={handleCvvChange}
                    placeholder="•••"
                    maxLength="4"
                    className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-center tracking-widest font-mono outline-none"
                    style={{ borderColor: validCvv === true ? '#27ae60' : validCvv === false ? '#e74c3c' : undefined }}
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(242,13,13,0.25)] hover:bg-red-700 transition-all cursor-pointer text-sm uppercase tracking-widest mt-4">
                Procesar Pago
              </button>
            </div>
          </form>
        )}

        {/* Step: TRANSFER SPEI */}
        {step === 'transfer' && (
          <div>
            <div className="bg-gradient-to-r from-primary to-red-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-3xl">account_balance</span>
                <h2 className="text-white text-xl font-bold">SPEI Bancario</h2>
              </div>
              <button type="button" onClick={() => setStep('method')} className="text-white bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-slate-800 dark:text-slate-100">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2 text-xs">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Datos de Transferencia</h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Banco:</span>
                  <span className="font-bold">Banamex</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">CLABE:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold font-mono">002180012345678901</span>
                    <button onClick={() => { navigator.clipboard.writeText('002180012345678901'); showToast('CLABE copiada', 'success'); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">📋</button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Titular:</span>
                  <span className="font-bold">CBTis 258 - Finanzas</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold text-primary">
                  <span>Monto:</span>
                  <span>${total.toFixed(2)} MXN</span>
                </div>
              </div>

              {/* Upload Comprobante */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Subir Comprobante</label>
                {!receiptFile ? (
                  <div 
                    onClick={() => document.getElementById('comprobanteFileInput')?.click()}
                    className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-4xl text-primary/60 mb-2">upload_file</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click para seleccionar archivo</span>
                    <span className="text-[10px] text-slate-400 mt-1">PDF, PNG, JPG (Máx 5MB)</span>
                    <input 
                      type="file" 
                      id="comprobanteFileInput" 
                      className="hidden" 
                      accept="image/*,application/pdf"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <span className="material-symbols-outlined text-green-600">check_circle</span>
                      <span className="text-xs font-bold truncate">{receiptFile.name}</span>
                    </div>
                    <button onClick={() => setReceiptFile(null)} className="p-1 text-slate-400 hover:text-red-500">✕</button>
                  </div>
                )}
              </div>

              {/* Reference */}
              <div className="flex flex-col gap-1 text-xs">
                <span>Número de referencia (opcional)</span>
                <input 
                  type="text" 
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ej: 123456789" 
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <button 
                onClick={() => {
                  if (!receiptFile) { showToast('Por favor sube tu comprobante de transferencia.', 'warning'); return; }
                  handleSuccessfulPurchase('Transferencia');
                }}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors cursor-pointer text-sm"
              >
                Enviar Comprobante
              </button>
            </div>
          </div>
        )}

        {/* Step: OXXO DEPOSITO */}
        {step === 'deposit' && (
          <div>
            <div className="bg-gradient-to-r from-primary to-red-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-3xl">store</span>
                <h2 className="text-white text-xl font-bold">Depósito OXXO</h2>
              </div>
              <button type="button" onClick={() => setStep('method')} className="text-white bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-slate-800 dark:text-slate-100">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2 text-xs">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Datos para Depósito</h3>
                <div className="flex justify-between">
                  <span className="text-slate-500">Banco:</span>
                  <span className="font-bold">Banamex</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Número de Cuenta:</span>
                  <span className="font-bold font-mono">1234 5678 9012 3456</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold text-primary">
                  <span>Monto:</span>
                  <span>${total.toFixed(2)} MXN</span>
                </div>
              </div>

              {/* Upload Comprobante */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Subir Ticket OXXO</label>
                {!receiptFile ? (
                  <div 
                    onClick={() => document.getElementById('comprobanteFileInputDeposit')?.click()}
                    className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-4xl text-primary/60 mb-2">upload_file</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Click para seleccionar archivo</span>
                    <span className="text-[10px] text-slate-400 mt-1">PDF, PNG, JPG (Máx 5MB)</span>
                    <input 
                      type="file" 
                      id="comprobanteFileInputDeposit" 
                      className="hidden" 
                      accept="image/*,application/pdf"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <span className="material-symbols-outlined text-green-600">check_circle</span>
                      <span className="text-xs font-bold truncate">{receiptFile.name}</span>
                    </div>
                    <button onClick={() => setReceiptFile(null)} className="p-1 text-slate-400 hover:text-red-500">✕</button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  if (!receiptFile) { showToast('Por favor sube tu ticket de depósito.', 'warning'); return; }
                  handleSuccessfulPurchase('Depósito Oxxo');
                }}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors cursor-pointer text-sm"
              >
                Enviar Comprobante
              </button>
            </div>
          </div>
        )}

        {/* Step: OXXO PAY (Barcode & Camera scanner simulation) */}
        {step === 'oxxopay' && (
          <div>
            <div className="bg-gradient-to-r from-primary to-red-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white text-3xl">qr_code_scanner</span>
                <h2 className="text-white text-xl font-bold">OXXO Pay</h2>
              </div>
              <button type="button" onClick={() => { stopScanner(); setStep('method'); }} className="text-white bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
              </button>
            </div>
            <div className="p-6 flex flex-col align-center items-center gap-5 text-slate-800 dark:text-slate-100">
              <h3 className="text-lg font-bold">Total a pagar: <span className="text-primary font-black">${total.toFixed(2)} MXN</span></h3>
              
              <div className="bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 rounded-2xl text-center w-full flex flex-col items-center justify-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Dicta o escanea este código en caja</p>
                <div className="bg-white p-2.5 rounded-lg flex items-center justify-center">
                  {/* Visual SVG for JsBarcode or CSS barcode fallback */}
                  <svg ref={barcodeSvgRef} id="barcode" className="max-w-full">
                    {/* Fallback visual barcode pattern */}
                    <g fill="black">
                      <rect x="10" y="5" width="2" height="60" />
                      <rect x="14" y="5" width="1" height="60" />
                      <rect x="17" y="5" width="3" height="60" />
                      <rect x="22" y="5" width="1" height="60" />
                      <rect x="25" y="5" width="4" height="60" />
                      <rect x="31" y="5" width="2" height="60" />
                      <rect x="35" y="5" width="1" height="60" />
                      <rect x="38" y="5" width="3" height="60" />
                      <rect x="43" y="5" width="2" height="60" />
                      <rect x="47" y="5" width="1" height="60" />
                      <rect x="50" y="5" width="4" height="60" />
                      <rect x="56" y="5" width="2" height="60" />
                      <rect x="60" y="5" width="3" height="60" />
                      <rect x="65" y="5" width="1" height="60" />
                      <rect x="68" y="5" width="2" height="60" />
                      <rect x="72" y="5" width="4" height="60" />
                    </g>
                    <text x="42" y="75" fontFamily="monospace" fontSize="11" textAnchor="middle">OXXOPAY-{total}</text>
                  </svg>
                </div>
              </div>

              {/* WebCam scan container */}
              {scannerActive && (
                <div className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden relative bg-black aspect-video flex items-center justify-center">
                  <video id="scanner-video" className="w-full h-full object-cover block"></video>
                  <button onClick={stopScanner} className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-bold">
                    Cerrar Cámara
                  </button>
                </div>
              )}

              {!scannerActive ? (
                <button onClick={startScanner} className="w-full py-4 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors">
                  <span className="material-symbols-outlined">center_focus_strong</span>
                  Simular Escaneo (WebCam)
                </button>
              ) : (
                <button onClick={() => handleSuccessfulPurchase('Oxxo Pay')} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
                  <span className="material-symbols-outlined">task_alt</span>
                  Simular Escaneo Exitoso
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step: SUCCESS confirmation dialog */}
        {step === 'success' && (
          <div className="p-8 flex flex-col items-center text-center text-slate-800 dark:text-slate-100">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-black text-[#27ae60] mb-3">{successInfo.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-line leading-relaxed mb-6">
              {successInfo.message}
            </p>
            <button 
              onClick={() => {
                onClose();
                setStep('method');
              }}
              className="px-8 py-3 bg-[#27ae60] text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
