import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { confirmarPagoOxxo } from '../../api/oxxo';

export default function TabOxxo() {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const stopScanner = () => {
    readerRef.current?.reset();
    readerRef.current = null;
    setScanning(false);
  };

  const confirmCode = async (code) => {
    const normalized = String(code || '').replace(/\D/g, '');
    if (!normalized) {
      setMessage({ type: 'error', text: 'No se detectó un código válido.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await confirmarPagoOxxo(normalized);
      const payment = result.payment;
      setMessage({
        type: 'success',
        text: `${result.message}. ${payment?.user?.nombre || 'Usuario'} — $${Number(payment?.total || 0).toFixed(2)} MXN`,
      });
      setManualCode('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const startScanner = async () => {
    setMessage(null);
    setScanning(true);
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    try {
      await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          stopScanner();
          confirmCode(result.getText());
        } else if (error && error.name !== 'NotFoundException') {
          console.error('OXXO scanner:', error);
        }
      });
    } catch (error) {
      stopScanner();
      setMessage({ type: 'error', text: 'No se pudo acceder a la cámara. Revisa los permisos del navegador.' });
    }
  };

  useEffect(() => () => readerRef.current?.reset(), []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 text-[#f20d0d] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">barcode_reader</span>
          </div>
          <div>
            <h2 className="text-lg font-black dark:text-white">Confirmar pago OXXO</h2>
            <p className="text-sm text-slate-500 mt-1">
              Escanea el código de barras del alumno. El pago se marcará como completado automáticamente.
            </p>
          </div>
        </div>

        {scanning && (
          <div className="rounded-2xl overflow-hidden bg-black mb-4">
            <video ref={videoRef} className="w-full max-h-[360px] object-cover" muted playsInline />
            <button
              type="button"
              onClick={stopScanner}
              className="w-full py-3 bg-slate-800 text-white font-bold cursor-pointer"
            >
              Cerrar cámara
            </button>
          </div>
        )}

        {!scanning && (
          <button
            type="button"
            onClick={startScanner}
            disabled={busy}
            className="w-full py-4 rounded-xl bg-[#f20d0d] hover:bg-red-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined">photo_camera</span>
            Abrir cámara y escanear
          </button>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
          <span className="text-xs font-bold text-slate-400 uppercase">o introducir código</span>
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            confirmCode(manualCode);
          }}
          className="flex gap-2"
        >
          <input
            value={manualCode}
            onChange={(event) => setManualCode(event.target.value.replace(/\D/g, '').slice(0, 18))}
            inputMode="numeric"
            placeholder="Código de 18 dígitos"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:border-[#f20d0d] font-mono tracking-wider"
          />
          <button
            type="submit"
            disabled={busy || manualCode.length < 18}
            className="px-5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold cursor-pointer disabled:opacity-40"
          >
            Confirmar
          </button>
        </form>

        {message && (
          <div className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 text-sm text-amber-800 dark:text-amber-300">
        <strong>Importante:</strong> cada código es único y vence una hora después de generarse. Los códigos vencidos no pueden confirmarse.
      </div>
    </div>
  );
}