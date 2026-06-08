import React, { useState, useEffect } from 'react';
import { obtenerHistorial } from '../../utils/storage.js';
import { generarPDFHistorial } from '../../utils/pdf.js';

export default function ModalHistorial({ isOpen, onClose }) {
  const [historial, setHistorial] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const items = obtenerHistorial() || [];
      // Replicating historical reverse like in the legacy JS:
      // Note: slice() is used to avoid mutating the original array when calling reverse()
      const reversedItems = [...items].reverse();
      setHistorial(reversedItems);

      const total = items.reduce((acc, curr) => acc + curr.total, 0);
      setTotalSpent(total);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-historial fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-sm overflow-y-auto" id="modalHistorial" onClick={(e) => e.target.id === 'modalHistorial' && onClose()}>
      <div className="modal-historial-content dark:bg-slate-900 dark:text-slate-100 relative w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-4 my-10 max-h-[90vh]">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-primary to-red-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src="/imgs/yameharte.png" alt="CBTis 258" className="h-9 w-auto object-contain" />
            <div>
              <h2 className="text-white text-lg font-black leading-tight">CBTis 258</h2>
              <p className="text-white/80 text-[11px] font-semibold uppercase tracking-widest">Historial de Compras</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <span className="material-symbols-outlined text-white">close</span>
          </button>
        </header>

        {/* Historial Layout */}
        <div className="historial-layout grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          
          {/* Columna Izquierda: Historial */}
          <div className="lg:col-span-2 space-y-4 historial-compras">
            {historial.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-lg font-medium">No hay compras registradas aún</p>
              </div>
            ) : (
              historial.map((compra, index) => {
                const productosHTML = compra.productos.map(prod => 
                  `${prod.nombre} x${prod.cantidad}${prod.tallaSeleccionada ? ` (${prod.tallaSeleccionada})` : ''}`
                ).join(' + ');

                const isCompletado = compra.estado === 'Completado' || compra.estado === 'Entregado';

                return (
                  <div key={index} className="compra-card bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary transition-all">
                    <div className="compra-fecha text-sm font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                      {compra.fecha}
                    </div>
                    <div className="compra-info flex-1">
                      <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">{productosHTML}</h3>
                      <div className="compra-badges flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCompletado 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {compra.estado || 'Pendiente'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                          {compra.metodoPago}
                        </span>
                      </div>
                    </div>
                    <div className="compra-precio text-lg font-black text-primary shrink-0">
                      ${compra.total.toFixed(2)} MXN
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Columna Derecha: Resumen de Cuenta */}
          <div className="resumen-cuenta bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 h-fit space-y-6">
            <h3 className="font-bold text-lg text-primary text-center border-b border-slate-100 dark:border-slate-700 pb-3 uppercase tracking-wider">
              Resumen de Cuenta
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Compras Realizadas</span>
                <strong className="font-bold text-slate-800 dark:text-white text-base">{historial.length}</strong>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Total Gastado</span>
                <strong className="font-black text-primary text-xl">${totalSpent.toFixed(2)} MXN</strong>
              </div>
            </div>

            <button 
              onClick={generarPDFHistorial}
              className="w-full py-4 bg-gradient-to-r from-primary to-red-700 text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all uppercase tracking-wider text-xs"
            >
              Descargar Facturas
            </button>

            <div className="info-adicional bg-slate-50 dark:bg-slate-700/50 border-l-4 border-primary p-4 rounded-r-xl">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <strong>Nota:</strong> Puedes descargar tus facturas y comprobantes consolidados en formato PDF.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
