import React, { useState, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { obtenerHistorial } from '../utils/storage';
import { generarPDFHistorial } from '../utils/pdf';
import { obtenerPagosOxxo } from '../api/oxxo';
import { obtenerMisCompras } from '../api/compras';

export default function HistorialModal({ isOpen, onClose }) {
  const [historial, setHistorial] = useState([]);
  const [oxxoCodePayment, setOxxoCodePayment] = useState(null);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;
    const loadHistory = async () => {
      const localHistory = obtenerHistorial();
      if (!cancelled) setHistorial(localHistory);
      try {
        const [serverPurchases, oxxoPayments] = await Promise.all([
          obtenerMisCompras(),
          obtenerPagosOxxo(),
        ]);
        if (cancelled) return;
        const purchaseHistory = serverPurchases.map(purchase => ({
          id: `purchase-${purchase.id}`,
          fecha: new Date(purchase.created_at).toLocaleDateString('es-MX'),
          metodoPago: purchase.metodo_pago,
          productos: purchase.productos,
          total: purchase.total,
          estado: purchase.estado,
          verificationId: purchase.verification_id,
        }));
        const oxxoHistory = oxxoPayments.map(payment => ({
          id: `oxxo-${payment.id}`,
          fecha: new Date(payment.created_at).toLocaleDateString('es-MX'),
          metodoPago: 'OXXO Pay',
          productos: payment.productos,
          total: payment.total,
          estado: payment.estado,
          verificationId: payment.verification_id,
          oxxoPayment: payment,
        }));
        setHistorial([
          ...localHistory.filter(item => !item.verificationId && !item.oxxoPaymentId),
          ...purchaseHistory,
          ...oxxoHistory.filter(payment => !purchaseHistory.some(
            purchase => purchase.verificationId === payment.verificationId
          )),
        ].sort((a, b) => new Date(b.oxxoPayment?.created_at || 0) - new Date(a.oxxoPayment?.created_at || 0)));
        setServerError('');
      } catch {
        setServerError('No se pudo actualizar el historial OXXO. Mostrando los pagos guardados localmente.');
      }
    };

    loadHistory();
    const interval = setInterval(loadHistory, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const totalGastado = historial.reduce((acc, compra) => acc + compra.total, 0);

  return (
    <>
    <div 
      className="modal-historial fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      id="modalHistorial"
      onClick={(e) => { if (e.target.id === 'modalHistorial') onClose(); }}
    >
      <div className="modal-historial-content bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] w-full max-w-4xl border border-primary/10">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-red-800 px-6 py-4 flex items-center justify-between shrink-0 text-white">
          <div className="flex items-center gap-3">
            <img src="/imgs/yameharte.png" alt="CBTis 258" className="h-9 w-auto object-contain" />
            <div>
              <h2 className="text-white text-lg font-black leading-tight">CBTis 258</h2>
              <p className="text-white/80 text-[11px] font-semibold uppercase tracking-widest">Historial de Compras</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Content Layout */}
        <div className="historial-layout flex flex-col md:flex-row flex-grow overflow-hidden p-6 gap-6">
          {/* Left Column: Purchase List */}
          <div className="historial-compras flex-grow overflow-y-auto space-y-4 pr-2 max-h-[50vh] md:max-h-[60vh]">
            {historial.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p>Aún no tienes compras. Cuando realices una, podrás consultar aquí tu comprobante y su estado.</p>
              </div>
            ) : (
                historial.map((compra, index) => {
                const productosHTML = compra.productos.map(prod => 
                  `${prod.nombre} x${prod.cantidad}${prod.tallaSeleccionada ? ` (${prod.tallaSeleccionada})` : ''}`
                ).join(' + ');

                return (
                  <div key={compra.id || index} className="compra-card bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                      <div className="compra-fecha text-xs text-slate-400 font-semibold mb-1 uppercase">{compra.fecha}</div>
                      <div className="compra-info">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{productosHTML}</h3>
                        <div className="compra-badges flex gap-2 mt-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${compra.estado === 'Completado' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'}`}>
                            {compra.estado || 'Pendiente'}
                          </span>
                          <span className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {compra.metodoPago}
                          </span>
                        </div>
                        {compra.verificationId && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">ID de compra:</span>
                            <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider">
                              {compra.verificationId}
                            </span>
                            <button
                              type="button"
                              title="Copiar ID"
                              onClick={() => navigator.clipboard.writeText(compra.verificationId)}
                              className="text-slate-400 hover:text-[#f20d0d] cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          </div>
                        )}
                        {compra.oxxoPayment?.estado === 'Pendiente' && (
                          <button
                            type="button"
                            onClick={() => setOxxoCodePayment(compra.oxxoPayment)}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#f20d0d] hover:text-red-700 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">barcode</span>
                            Mostrar código de barras
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="compra-precio text-base font-black text-primary">${compra.total.toFixed(2)} MXN</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Account Summary */}
          <div className="resumen-cuenta bg-slate-50 dark:bg-slate-800/40 p-6 rounded-xl border border-slate-200 dark:border-slate-800 w-full md:w-[280px] shrink-0 flex flex-col justify-between self-start">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Resumen de Cuenta</h3>
              
              <div className="space-y-4">
                <div className="resumen-item flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Compras Realizadas</span>
                  <strong className="text-slate-800 dark:text-slate-100 font-bold">{historial.length}</strong>
                </div>
                <div className="resumen-item flex justify-between items-center text-sm pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Total Gastado</span>
                  <strong className="total-amount text-primary font-black text-lg">${totalGastado.toFixed(2)} MXN</strong>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button 
                onClick={generarPDFHistorial}
                disabled={historial.length === 0}
                className="btn-facturas w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
              >
                DESCARGAR FACTURAS
              </button>

              <div className="info-adicional bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs p-3 rounded-lg leading-relaxed">
                <p><strong>Nota:</strong> Puedes visualizar o descargar tus facturas en formato PDF.</p>
              </div>
            </div>
          </div>
        </div>
        {serverError && (
          <p className="px-6 pb-4 text-xs text-amber-600 dark:text-amber-400">{serverError}</p>
        )}
      </div>
    </div>
    {oxxoCodePayment && (
      <OxxoHistoryCodeModal
        payment={oxxoCodePayment}
        onClose={() => setOxxoCodePayment(null)}
      />
    )}
    </>
  );
}

function OxxoHistoryCodeModal({ payment, onClose }) {
  const [barcodeRef, setBarcodeRef] = useState(null);

  useEffect(() => {
    if (!barcodeRef) return;
    JsBarcode(barcodeRef, payment.code, {
      format: 'CODE128',
      displayValue: true,
      width: 2,
      height: 92,
      margin: 16,
      fontSize: 16,
      textMargin: 8,
      lineColor: '#111827',
      background: '#ffffff',
    });
  }, [barcodeRef, payment.code]);

  const download = () => {
    if (!barcodeRef) return;
    const svg = new XMLSerializer().serializeToString(barcodeRef);
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `OXXO-${payment.code}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#f20d0d] to-[#6e0404] px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h2 className="font-black text-lg">Código OXXO Pay</h2>
            <p className="text-white/75 text-xs mt-1">Pago pendiente de confirmación</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/15 hover:bg-white/25 cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Total a pagar</p>
          <p className="text-2xl font-black text-[#f20d0d] mb-5">${Number(payment.total).toFixed(2)} MXN</p>
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-4 overflow-x-auto">
            <svg ref={setBarcodeRef} className="mx-auto max-w-full" />
          </div>
          <p className="font-mono text-sm font-bold tracking-widest text-slate-700 dark:text-slate-300 mt-3">{payment.code}</p>
          <p className="text-xs text-slate-500 mt-2">Válido durante 1 hora desde su generación.</p>
          <button type="button" onClick={download} className="w-full mt-5 py-3 rounded-xl bg-[#f20d0d] hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined">download</span>
            Descargar código
          </button>
        </div>
      </div>
    </div>
  );
}
