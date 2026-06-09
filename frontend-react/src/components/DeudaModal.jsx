import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeudaModal({ isOpen, onClose, pendingCount }) {
  const navigate = useNavigate();
  if (!isOpen || pendingCount <= 0) return null;

  const totalDebt = pendingCount * 3000;

  const handlePayClick = () => {
    onClose();
    // Navigate to Tienda and automatically trigger checkout or focus cart
    navigate('/tienda', { state: { autoPayColegiatura: true } });
  };

  return (
    <div id="modalDeuda" className="fixed inset-0 z-[1005] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-red-500/30 mx-4 max-h-[90vh] flex flex-col">
        {/* Background accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

        {/* Header Alert Box */}
        <div className="bg-red-50 dark:bg-red-900/20 px-6 py-6 border-b border-red-100 dark:border-red-900/50 flex flex-col items-center text-center relative z-10">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4 shadow-inner ring-4 ring-white dark:ring-slate-900">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h2 class="text-xl font-black text-slate-800 dark:text-white leading-tight mb-1">Aviso Importante</h2>
          <p className="text-sm text-red-600 dark:text-red-400 font-bold">Tienes colegiaturas atrasadas</p>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10 bg-white dark:bg-slate-900">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Hemos detectado que tienes <strong id="modal-deuda-cantidad" className="text-slate-800 dark:text-slate-200">{pendingCount}</strong> pago(s) pendiente(s) de colegiatura.
            </p>
          </div>
          
          {/* Monto Box */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center mb-6">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total a liquidar</span>
            <span className="text-2xl font-black text-red-600 dark:text-red-500" id="modal-deuda-monto">
              ${totalDebt.toLocaleString('en-US')}.00 MXN
            </span>
          </div>

          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mb-6 px-2">
            Por favor, ponte al corriente lo antes posible para evitar recargos o bloqueos en tus servicios escolares. Puedes realizar tu pago en la Tienda.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={handlePayClick}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-primary text-white font-bold rounded-xl shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">payment</span>
              Ir a pagar ahora
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all active:scale-95 cursor-pointer"
            >
              Cerrar aviso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
