import { createBrandBackground } from '../utils/branding';

export default function AppHeader({ userProfile, profileAvatar, onOpenMenu, onOpenProfile, theme }) {
  const brandBackground = createBrandBackground(theme || {});
  return (
    <>
      <header style={brandBackground} className="hidden lg:flex backdrop-blur-md bg-opacity-90 text-white items-center justify-between whitespace-nowrap px-10 py-5 shadow-lg sticky top-0 z-50 border-b border-white/10">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity border-none bg-transparent text-left"
        >
          <span className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            {theme?.logoUrl && <img src={theme.logoUrl} alt={`Logo ${theme.title || 'institucional'}`} className="h-8 w-auto object-contain" />}
          </span>
          <span>
            <span className="block text-2xl font-black leading-tight tracking-[-0.015em] text-white">{theme?.title || 'CBTis 258'}</span>
            <span className="block text-xs font-semibold text-white/90 uppercase tracking-widest">{theme?.tagline || 'Un motivo de orgullo'}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-4 bg-black/10 py-2 px-4 rounded-full border border-white/20 shadow-sm cursor-pointer hover:bg-black/20 transition-colors"
        >
          <span className="text-sm font-bold text-white">{userProfile?.nombre ?? '—'}</span>
          <span
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-white/50 bg-slate-300"
            style={{ backgroundImage: `url("${profileAvatar}")` }}
          />
        </button>
      </header>

      <header style={brandBackground} className="flex lg:hidden fixed top-0 left-0 right-0 z-50 text-white backdrop-blur-md border-b border-white/15 h-[66px] items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenMenu}
            className="w-10 h-10 rounded-full border border-white/20 bg-white/10 cursor-pointer flex items-center justify-center text-white shrink-0"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            {theme?.logoUrl && <img src={theme.logoUrl} alt={`Logo ${theme.title || 'institucional'}`} className="w-[30px] h-[30px] object-contain shrink-0" />}
            <div className="min-w-0">
              <span className="block font-black text-[1.05rem] leading-tight truncate">{theme?.title || 'CBTis 258'}</span>
              <span className="block text-[8px] font-semibold uppercase tracking-[0.16em] text-white/75 truncate">{theme?.tagline || 'Un motivo de orgullo'}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenProfile}
          className="border-2 border-white/60 cursor-pointer p-0 rounded-full shrink-0 bg-white/20"
          aria-label="Abrir perfil"
        >
          <span
            className="block w-9 h-9 rounded-full bg-center bg-no-repeat bg-cover bg-slate-300"
            style={{ backgroundImage: `url("${profileAvatar}")` }}
          />
        </button>
      </header>
    </>
  );
}
