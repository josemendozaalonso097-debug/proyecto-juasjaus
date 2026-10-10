import { useEffect, useMemo, useRef, useState } from 'react';
import { useCustomization } from '../../hooks/useCustomization';
import { createBrandBackground } from '../../utils/branding';
import { showToast } from '../../utils/toast';


const SURFACES = [
  { id: 'cbtis', title: 'Portal CBTis', subtitle: 'Identidad general de la página principal', icon: 'school' },
  { id: 'finanzas', title: 'Financieros', subtitle: 'Panel de servicios, pagos y trámites', icon: 'account_balance' },
  { id: 'login', title: 'Pantalla de acceso', subtitle: 'Login y paneles de registro', icon: 'login' },
];
const SECTIONS = [
  ['pagos', 'Pagos'], ['eventos', 'Eventos'], ['tienda', 'Tienda'],
  ['tramites', 'Trámites'], ['seguimiento', 'Seguimiento'], ['orientacion', 'Orientación'],
];
const EMPTY = { title: '', tagline: '', description: '', logoUrl: '', heroImageUrl: '', catalogImageUrl: '', primaryColor: '#f20d0d', secondaryColor: '#6e0404', backgroundColor: '#f8f5f5', colorStyle: 'gradient', sections: [] };
const PREVIEW_CHANNEL = 'cbtis-login-preview';

function ImageField({ label, value, onChange }) {
  const onUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
      showToast('Usa una imagen PNG, JPG, WebP o GIF.', 'warning');
      event.target.value = '';
      return;
    }
    if (file.size > 700 * 1024) {
      showToast('La imagen debe pesar 700 KB o menos para la vista temporal.', 'warning');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ''));
    reader.onerror = () => showToast('No se pudo leer la imagen.', 'error');
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</label>
      <input value={value.startsWith('data:') ? '' : value} onChange={(event) => onChange(event.target.value)} placeholder="URL https://… o ruta /imgs/…" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined text-base">upload</span> Subir imagen (máx. 700 KB)
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={onUpload} />
        </label>
        {value && <button type="button" onClick={() => onChange('')} className="text-xs font-bold text-red-600 hover:underline">Quitar</button>}
      </div>
      {value && <img src={value} alt={`Vista previa de ${label.toLowerCase()}`} className="max-h-24 max-w-full rounded-lg border border-slate-200 object-contain p-1 dark:border-slate-700" />}
    </div>
  );
}

export default function TabCustomization() {
  const { getCustomization, updateCustomization, resetCustomization } = useCustomization();
  const [surface, setSurface] = useState('cbtis');
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);
  const form = useMemo(() => drafts[surface] || { ...EMPTY, ...getCustomization(surface) }, [drafts, surface, getCustomization]);
  const liveStateRef = useRef({ surface, form });
  const channelRef = useRef(null);
  const pendingPreviewsRef = useRef(new Set());
  const activePreviewsRef = useRef(new Set());

  useEffect(() => {
    liveStateRef.current = { surface, form };
  }, [surface, form]);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return undefined;
    const channel = new BroadcastChannel(PREVIEW_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (event) => {
      const previewId = event.data?.previewId;
      if (event.data?.type === 'LOGIN_PREVIEW_REQUEST' && previewId && pendingPreviewsRef.current.has(previewId) && liveStateRef.current.surface === 'login') {
        pendingPreviewsRef.current.delete(previewId);
        activePreviewsRef.current.add(previewId);
        channel.postMessage({ type: 'LOGIN_PREVIEW_THEME', previewId, theme: liveStateRef.current.form });
      } else if (event.data?.type === 'LOGIN_PREVIEW_CLOSED' && previewId) {
        pendingPreviewsRef.current.delete(previewId);
        activePreviewsRef.current.delete(previewId);
      }
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (surface === 'login') {
      activePreviewsRef.current.forEach((previewId) => {
        channelRef.current?.postMessage({ type: 'LOGIN_PREVIEW_THEME', previewId, theme: form });
      });
    }
  }, [surface, form]);

  const change = (field, value) => setDrafts((current) => ({
    ...current,
    [surface]: { ...(current[surface] || { ...EMPTY, ...getCustomization(surface) }), [field]: value },
  }));
  const toggleSection = (id) => change('sections', form.sections.includes(id) ? form.sections.filter((item) => item !== id) : [...form.sections, id]);

  const handleApply = (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      updateCustomization(surface, form);
      showToast('Cambios aplicados temporalmente. Al recargar, volverá el diseño base CBTis.', 'success');
    } catch (error) {
      showToast(error.message || 'No se pudieron aplicar los cambios.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const base = resetCustomization(surface);
    setDrafts((current) => ({ ...current, [surface]: base }));
    showToast(`Diseño base de ${SURFACES.find((item) => item.id === surface)?.title || 'la página'} restaurado.`, 'success');
  };

  const previewLogin = () => {
    const previewId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    pendingPreviewsRef.current.add(previewId);
    window.open(`/login?preview=1&previewId=${encodeURIComponent(previewId)}`, '_blank', 'noopener,noreferrer');
  };
  const selectedSurface = SURFACES.find((item) => item.id === surface);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Branding del portal</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">Personalización temporal</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Prueba una plantilla reutilizable para CBTis, Financieros o el login. Los cambios viven solo en esta sesión del navegador; no se guardan en el servidor y al recargar vuelve el diseño base CBTis.</p>
          </div>
          {surface === 'login' && <button type="button" onClick={previewLogin} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"><span className="material-symbols-outlined text-lg">open_in_new</span>Previsualizar login en otra pestaña</button>}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {SURFACES.map((item) => (
          <button key={item.id} type="button" onClick={() => setSurface(item.id)} className={`rounded-2xl border p-4 text-left transition ${surface === item.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'}`}>
            <span className={`material-symbols-outlined ${surface === item.id ? 'text-primary' : 'text-slate-400'}`}>{item.icon}</span>
            <span className="mt-2 block font-black text-slate-900 dark:text-white">{item.title}</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{item.subtitle}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleApply} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6 rounded-3xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedSurface?.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Edita nombre, identidad visual y secciones para probar la plantilla. Los cambios no sobreviven a una recarga.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2"><span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Nombre del portal</span><input required maxLength={80} value={form.title} onChange={(e) => change('title', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
            <label className="space-y-2"><span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Lema / subtítulo</span><input maxLength={120} value={form.tagline} onChange={(e) => change('tagline', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>
          </div>
          <label className="block space-y-2"><span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Descripción breve</span><textarea maxLength={240} rows={2} value={form.description} onChange={(e) => change('description', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" /></label>

          <div className="grid gap-5 md:grid-cols-2">
            <ImageField label="Logo institucional" value={form.logoUrl} onChange={(value) => change('logoUrl', value)} />
            <ImageField label="Imagen principal / banner" value={form.heroImageUrl} onChange={(value) => change('heroImageUrl', value)} />
            {surface === 'finanzas' && <ImageField label="Imagen de libros, uniformes o tienda" value={form.catalogImageUrl || ''} onChange={(value) => change('catalogImageUrl', value)} />}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[['primaryColor', 'Color principal'], ['secondaryColor', 'Color complementario'], ['backgroundColor', 'Fondo']].map(([field, label]) => (
              <label key={field} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><input type="color" value={form[field]} onChange={(e) => change(field, e.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" /><span><span className="block text-xs font-bold text-slate-700 dark:text-slate-200">{label}</span><span className="text-xs text-slate-400">{form[field]}</span></span></label>
            ))}
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">Estilo de color</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {[['gradient', 'Degradado'], ['solid', 'Plano'], ['mesh', 'Degradado suave']].map(([value, label]) => (
                <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold ${form.colorStyle === value ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}><input type="radio" name="colorStyle" value={value} checked={form.colorStyle === value} onChange={() => change('colorStyle', value)} />{label}</label>
              ))}
            </div>
          </fieldset>

          {surface === 'login' ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">La pantalla de acceso solo admite personalización visual; la configuración de secciones pertenece al portal.</p> : <fieldset>
            <legend className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">Secciones visibles</legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SECTIONS.map(([id, label]) => <label key={id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"><input type="checkbox" checked={form.sections.includes(id)} onChange={() => toggleSection(id)} className="accent-primary" />{label}</label>)}
            </div>
          </fieldset>}

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60"><span className="material-symbols-outlined text-lg">palette</span>{saving ? 'Aplicando…' : 'Aplicar temporalmente'}</button>
            <button type="button" onClick={handleReset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-lg">restart_alt</span>Restablecer valores base</button>
            {surface === 'login' && <button type="button" onClick={previewLogin} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-lg">visibility</span>Ver login sin cerrar sesión</button>}
          </div>
        </div>

        <aside className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="p-4" style={createBrandBackground(form)}>
            <div className="flex items-center gap-3 text-white">
              {form.logoUrl && <img src={form.logoUrl} alt="Logo" className="h-12 w-12 rounded-xl bg-white/90 object-contain p-1" />}
              <div><p className="font-black">{form.title || 'Nombre del portal'}</p><p className="text-xs text-white/80">{form.tagline || 'Lema institucional'}</p></div>
            </div>
            {form.heroImageUrl && <img src={form.heroImageUrl} alt="Vista previa de banner" className="mt-4 h-32 w-full rounded-xl object-cover" />}
          </div>
          <div className="space-y-3 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">Vista previa temporal</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{form.description || 'La descripción breve se mostrará en la página seleccionada.'}</p>
            <div className="flex flex-wrap gap-2">{form.sections.map((id) => <span key={id} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{SECTIONS.find(([key]) => key === id)?.[1] || id}</span>)}</div>
          </div>
        </aside>
      </form>
    </div>
  );
}
