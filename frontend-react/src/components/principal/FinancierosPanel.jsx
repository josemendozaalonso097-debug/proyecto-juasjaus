import TooltipBubble from './TooltipBubble';
import { createBrandBackground } from '../../utils/branding';

const SERVICE_ROWS = [
  { id: 'seguimiento', label: 'Seguimiento', icon: 'route', onClick: 'onOpenSeguimiento', accent: '#2563eb' },
  { id: 'tramites', label: 'Subir Papelería', icon: 'draw', onClick: 'onOpenPapeleria', accent: '#ea580c' },
  { id: 'orientacion', label: 'Orientación', icon: 'psychology', onClick: 'onOpenOrientacion', accent: '#0f766e' },
];

export default function FinancierosPanel({ onOpenPapeleria, onOpenOrientacion, onNavigateTienda, onOpenSeguimiento, userId, theme }) {
  const selectedSections = theme?.sections || ['seguimiento', 'tramites', 'orientacion', 'tienda'];
  const callbacks = { onOpenSeguimiento, onOpenPapeleria, onOpenOrientacion };
  const rows = SERVICE_ROWS.filter((item) => selectedSections.includes(item.id));

  return (
    <section data-tour="services" className="overflow-hidden rounded-2xl border bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-slate-800 dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:border-slate-700" style={{ backgroundColor: theme?.backgroundColor || '#f5f3ff', borderColor: `${theme?.primaryColor || '#7c3aed'}44` }}>
      <div className="p-5 text-white" style={createBrandBackground(theme || {})}>
        <div className="flex items-center gap-3">
          {theme?.logoUrl ? <img src={theme.logoUrl} alt="" className="h-10 w-10 rounded-lg bg-white/90 object-contain p-1" /> : <span className="material-symbols-outlined rounded-xl bg-white/15 p-2 text-xl">account_balance</span>}
          <div className="min-w-0">
            <h3 className="truncate text-xl font-black leading-tight">{theme?.title || 'Financieros'}</h3>
            <p className="mt-1 text-xs font-semibold text-white/80">{theme?.tagline || 'Servicios escolares y pagos'}</p>
          </div>
          <TooltipBubble userId={userId} stepId="services" />
        </div>
      </div>
      <div className="p-6">
        {theme?.catalogImageUrl && <img src={theme.catalogImageUrl} alt="Libros, uniformes o productos escolares" className="mb-5 h-32 w-full rounded-xl object-cover" />}
        <p className="mb-5 text-sm font-medium text-slate-500 dark:text-slate-400">{theme?.description || 'Adquiere productos escolares o realiza tus trámites.'}</p>
        <ul className="mb-5 space-y-3">
          {rows.map((item) => (
            <li key={item.id}>
              <button onClick={callbacks[item.onClick]} className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-left transition-all hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                <span className="flex items-center gap-4">
                  <span className="rounded-lg p-2.5" style={{ backgroundColor: `${item.accent}18`, color: item.accent }}><span className="material-symbols-outlined text-xl">{item.icon}</span></span>
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                </span>
                <span className="material-symbols-outlined text-slate-300 transition-colors group-hover:text-primary">arrow_forward</span>
              </button>
            </li>
          ))}
        </ul>
        {selectedSections.includes('tienda') && <button onClick={onNavigateTienda} className="w-full cursor-pointer rounded-xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-90" style={createBrandBackground(theme || {})}>Ingresar a Tienda</button>}
        {!rows.length && !selectedSections.includes('tienda') && <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">Los servicios están ocultos por configuración administrativa.</p>}
      </div>
    </section>
  );
}
