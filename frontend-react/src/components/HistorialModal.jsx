import React, { useState, useEffect } from 'react';
import { obtenerHistorial } from '../utils/storage';
import { generarPDFHistorial } from '../utils/pdf';

export default function HistorialModal({ isOpen, onClose }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setHistorial(obtenerHistorial());
    }
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
                <p>No hay compras registradas aún</p>
              </div>
            ) : (
              [...historial].reverse().map((compra, index) => {
                const productosHTML = compra.productos.map(prod => 
                  `${prod.nombre} x${prod.cantidad}${prod.tallaSeleccionada ? ` (${prod.tallaSeleccionada})` : ''}`
                ).join(' + ');

                return (
                  <div key={index} className="compra-card bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
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
      </div>
    </div>
  );
}
