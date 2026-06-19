import React from 'react';

export function DesktopWelcomeBanner({ userProfile, profileAvatar, pendingCount, greeting, formattedDate }) {
  return (
    <div className="mb-10 rounded-3xl overflow-hidden shadow-xl" style={{ animation: 'bannerSlideIn 0.55s cubic-bezier(0.22,1,0.36,1) both' }}>
      <div className="relative bg-gradient-to-br from-[#af101a] via-[#8b0d15] to-[#3d0408] p-8 flex items-center justify-between gap-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-72 h-32 bg-white/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-4 right-48 w-2 h-2 rounded-full bg-white/20" />
        <div className="absolute top-12 right-64 w-1 h-1 rounded-full bg-white/30" />
        <div className="absolute bottom-6 right-32 w-1.5 h-1.5 rounded-full bg-white/20" />

        <div className="relative z-10 flex flex-col gap-2 min-w-0">
          <p className="text-white/70 text-sm font-semibold uppercase tracking-[0.18em]">
            {greeting.emoji}&nbsp;&nbsp;{greeting.text}
          </p>
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight truncate">
            {userProfile ? userProfile.nombre.split(' ')[0] : '—'}
            <span className="text-white/50 font-light">
              {userProfile?.nombre?.includes(' ') ? ' ' + userProfile.nombre.split(' ').slice(1).join(' ') : ''}
            </span>
          </h2>
          <p className="text-white/60 text-sm font-medium capitalize mt-0.5">{formattedDate}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${pendingCount === 0 ? 'bg-green-500/20 text-green-200 border border-green-400/30' : 'bg-red-400/20 text-red-200 border border-red-300/30'}`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${pendingCount === 0 ? 'bg-green-400' : 'bg-red-300'}`} />
              {pendingCount === 0 ? 'Al corriente' : `${pendingCount} pago(s) pendiente(s)`}
            </span>
            {userProfile && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white/80 border border-white/20">
                <span className="material-symbols-outlined text-[13px]">school</span>
                {userProfile.semestre}° Semestre
              </span>
            )}
          </div>
        </div>

        <div className="relative z-10 shrink-0">
          <div
            className="w-24 h-24 rounded-2xl border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10"
            style={{ backgroundImage: `url("${profileAvatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white text-[12px]">check</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileWelcomeBanner({ userProfile, profileAvatar, pendingCount, greeting, formattedDate }) {
  return (
    <section className="mb-5 mt-4" style={{ animation: 'bannerSlideIn 0.55s cubic-bezier(0.22,1,0.36,1) both' }}>
      <div className="relative bg-gradient-to-br from-[#af101a] via-[#8b0d15] to-[#3d0408] rounded-2xl p-5 overflow-hidden shadow-lg">
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 w-40 h-16 bg-white/3 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-white/65 text-[11px] font-bold uppercase tracking-[0.18em] mb-1">
              {greeting.emoji}&nbsp; {greeting.text}
            </p>
            <h2 className="text-[1.6rem] font-black text-white leading-tight tracking-tight">
              {userProfile ? userProfile.nombre.split(' ')[0] : '—'}
            </h2>
            {userProfile?.nombre?.includes(' ') && (
              <p className="text-white/50 text-sm font-medium -mt-0.5">
                {userProfile.nombre.split(' ').slice(1).join(' ')}
              </p>
            )}
          </div>
          <div className="relative shrink-0">
            <div
              className="w-[52px] h-[52px] rounded-xl border-2 border-white/25 shadow-lg overflow-hidden bg-white/10"
              style={{ backgroundImage: `url("${profileAvatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[11px]">check</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/10">
          <p className="text-white/55 text-[11px] font-medium capitalize">{formattedDate}</p>
          <div className="flex gap-2">
            {userProfile && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/10 text-white/80 border border-white/15">
                <span className="material-symbols-outlined text-[11px]">school</span>
                {userProfile.semestre}° Sem
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${pendingCount === 0 ? 'bg-green-500/20 text-green-200 border-green-400/30' : 'bg-red-300/20 text-red-200 border-red-300/30'}`}>
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${pendingCount === 0 ? 'bg-green-400' : 'bg-red-300'}`} />
              {pendingCount === 0 ? 'Al corriente' : `${pendingCount} pendiente(s)`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
