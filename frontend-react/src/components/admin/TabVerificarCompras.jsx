import React, { useState } from 'react';
import { verificarCompra } from '../../api/compras';

export default function TabVerificarCompras() {
  const [verificationId, setVerificationId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const id = verificationId.trim();
    if (id.length !== 18) {
      setError('El ID debe tener exactamente 18 dígitos.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await verificarCompra(id);
      setResult({ type: 'success', purchase: response.compra, message: response.message });
    } catch (requestError) {
      if (requestError.status === 409 || requestError.data?.detail?.already_used) {
        setError(requestError.message || 'Este ID de compra ya fue usado para una verificación.');
      } else {
        setError(requestError.message || 'No se pudo verificar la compra.');
      }
    } finally {
      setLoading(false);
    }
  };

  const purchase = result?.purchase;
  const normalizedRole = purchase?.usuario?.rol?.toLowerCase();
  const personLabel = ['alumno', 'estudiante'].includes(normalizedRole)
    ? `Semestre ${purchase.usuario.semestre || '—'}`
    : `Rol: ${purchase?.usuario?.rol || '—'}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
          <div>
            <h2 className="text-lg font-black dark:text-white">Verificar compras</h2>
            <p className="text-sm text-slate-500 mt-1">
              Introduce el ID de 18 dígitos que aparece en el historial del usuario.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            value={verificationId}
            onChange={(event) => setVerificationId(event.target.value.replace(/\D/g, '').slice(0, 18))}
            inputMode="numeric"
            autoComplete="off"
            placeholder="000000000000000000"
            className="flex-1 px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:border-[#f20d0d] font-mono tracking-[0.18em] text-lg"
          />
          <button
            type="submit"
            disabled={loading || verificationId.length !== 18}
            className="px-6 py-3.5 rounded-xl bg-[#f20d0d] hover:bg-red-700 text-white font-bold cursor-pointer disabled:opacity-40"
          >
            {loading ? 'Verificando…' : 'Verificar ID'}
          </button>
        </form>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-red-700 dark:text-red-300">
            <span className="material-symbols-outlined">warning</span>
            <div>
              <strong>ID no disponible</strong>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {purchase && (
          <div className="mt-5 rounded-xl bg-green-50 dark:bg-green-950/25 border border-green-200 dark:border-green-900/50 p-5">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-black">
              <span className="material-symbols-outlined">check_circle</span>
              {result.message}
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-5 text-sm">
              <Info label="ID de compra" value={purchase.verification_id} mono />
              <Info label="Fecha" value={new Date(purchase.created_at).toLocaleString('es-MX')} />
              <Info label="Alumno / usuario" value={purchase.usuario?.nombre || '—'} />
              <Info label="Semestre / rol" value={personLabel} />
              <Info label="Método de pago" value={purchase.metodo_pago || '—'} />
              <Info label="Estado" value={purchase.estado} />
            </div>
            <div className="mt-5 pt-4 border-t border-green-200 dark:border-green-900/50">
              <p className="text-xs font-bold uppercase text-green-700/70 dark:text-green-300/70 mb-2">Compra</p>
              <ul className="space-y-1 text-sm text-green-900 dark:text-green-100">
                {purchase.productos?.map((item, index) => (
                  <li key={`${item.nombre}-${index}`}>
                    {item.nombre} × {item.cantidad} — ${(item.precio_total || item.precio * item.cantidad).toFixed(2)} MXN
                  </li>
                ))}
              </ul>
              <p className="text-right font-black text-lg mt-3 text-green-800 dark:text-green-200">
                Total: ${Number(purchase.total).toFixed(2)} MXN
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-slate-100 dark:bg-slate-900/70 p-4 text-sm text-slate-500 dark:text-slate-400">
        La verificación es de un solo uso y se registra en el servidor con la fecha y el administrador que la realizó. Si alguien intenta reutilizar el ID, el sistema lo rechazará.
      </div>
    </div>
  );
}

function Info({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-green-700/70 dark:text-green-300/70">{label}</p>
      <p className={`mt-1 font-semibold text-green-900 dark:text-green-100 ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</p>
    </div>
  );
}