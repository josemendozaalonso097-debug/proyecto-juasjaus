import { Link, useLocation } from "react-router-dom";

const BASE = "/acceso-escuela";

function Brand() {
  return (
    <Link to="/login" className="flex items-center gap-3 no-underline" aria-label="Volver al acceso CBTis 258">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-red-200 dark:shadow-red-950/40">
        <span className="material-symbols-outlined">account_balance</span>
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-black tracking-wide text-slate-900 dark:text-white">SERVICIOS ESCOLARES</span>
        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Portal institucional</span>
      </span>
    </Link>
  );
}

function Shell({ children, eyebrow = "ACCESO INSTITUCIONAL" }) {
  return (
    <main className="min-h-screen bg-[#f8f5f5] text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-28 h-96 w-96 rounded-full bg-red-200/30 blur-3xl dark:bg-red-950/25" />
        <div className="absolute -bottom-40 -right-20 h-[30rem] w-[30rem] rounded-full bg-orange-100/50 blur-3xl dark:bg-red-950/20" />
      </div>
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-primary/30 hover:text-primary dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span className="hidden sm:inline">Volver al CBTis 258</span><span className="sm:hidden">Volver</span>
        </Link>
      </header>
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-12 pt-5 sm:px-8 sm:pt-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center gap-2 text-xs font-black tracking-[0.16em] text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />{eyebrow}
          </div>
          {children}
          <footer className="mt-12 border-t border-slate-200/80 pt-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
            CBTis 258 · Prototipo de acceso para otras instituciones
          </footer>
        </div>
      </div>
    </main>
  );
}

function IconTile({ icon, tone = "red" }) {
  const tones = {
    red: "bg-red-50 text-primary dark:bg-red-950/40 dark:text-red-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  };
  return <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tones[tone]}`}><span className="material-symbols-outlined">{icon}</span></span>;
}

function ChoiceCard({ to, icon, title, description, badge, tone = "red" }) {
  return (
    <Link to={to} className="group flex min-h-36 items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 no-underline shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-red-950/5 dark:border-slate-800 dark:bg-slate-900">
      <IconTile icon={icon} tone={tone} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-base font-extrabold text-slate-900 dark:text-white">{title}{badge && <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-primary dark:bg-red-950/40">{badge}</span>}</span>
        <span className="mt-1.5 block text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</span>
      </span>
      <span className="material-symbols-outlined mt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary">arrow_forward</span>
    </Link>
  );
}

function Stepper({ active = 1 }) {
  const labels = ["Tipo de acceso", "Institución", "Siguiente paso"];
  return <div className="mb-8 grid grid-cols-3 gap-2" aria-label={`Paso ${active} de 3`}>
    {labels.map((label, i) => <div key={label}>
      <div className={`mb-2 h-1.5 rounded-full ${i + 1 <= active ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"}`} />
      <span className={`text-[10px] font-bold uppercase tracking-wide sm:text-xs ${i + 1 === active ? "text-primary" : "text-slate-400"}`}>{label}</span>
    </div>)}
  </div>;
}

function PageHeading({ title, children }) {
  return <div className="mb-8"><h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>{children && <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">{children}</p>}</div>;
}

function AccessHome() {
  return <Shell><Stepper active={1} />
    <PageHeading title="¿Cómo quieres ingresar?">Selecciona la opción que mejor describe tu relación con el plantel.</PageHeading>
    <div className="grid gap-4 sm:grid-cols-2">
      <ChoiceCard to={`${BASE}/planteles`} icon="school" title="Soy alumno o familiar" description="Continuar al portal del CBTis 258 y consultar sus servicios escolares." badge="CBTis 258" />
      <ChoiceCard to={`${BASE}/planteles?tipo=docente`} icon="cast_for_education" title="Soy docente o personal escolar" description="Acceder a tu plantel o conocer cómo funciona el portal para escuelas." tone="blue" />
    </div>
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-sm leading-6 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
      <span className="material-symbols-outlined mt-0.5 text-primary">info</span>
      <p className="m-0">Este flujo es una propuesta visual. Las opciones todavía no validan identidad ni otorgan acceso a información escolar.</p>
    </div>
  </Shell>;
}

function Institutions() {
  const location = useLocation();
  const isStaff = new URLSearchParams(location.search).get("tipo") === "docente";
  return <Shell><Stepper active={2} />
    <PageHeading title={isStaff ? "Elige tu institución" : "Selecciona tu plantel"}>{isStaff ? "Busca el acceso de tu escuela o explora el portal de otra institución." : "Por ahora, el acceso disponible corresponde al CBTis 258."}</PageHeading>
    <div className="grid gap-4 sm:grid-cols-2">
      <ChoiceCard to="/login" icon="account_balance" title="CBTis 258" description="Ir al acceso actual para alumnos y personal del plantel." badge="Disponible" />
      <ChoiceCard to={`${BASE}/buscar`} icon="travel_explore" title="Otra institución" description="Buscar un plantel o continuar si todavía no aparece en el directorio." tone="blue" />
    </div>
    <Link to={BASE} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 no-underline hover:text-primary"><span className="material-symbols-outlined text-lg">arrow_back</span> Cambiar tipo de acceso</Link>
  </Shell>;
}

function SearchSchool() {
  return <Shell><Stepper active={2} />
    <PageHeading title="Busca tu escuela">Escribe el nombre del plantel y su ubicación. Aquí aparecerían las coincidencias del directorio.</PageHeading>
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">Nombre de la institución
          <span className="relative mt-2 block"><span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">search</span><input className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800" placeholder="Ej. CBTis 258" /></span>
        </label>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Estado
          <span className="relative mt-2 block"><span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">map</span><input className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800" placeholder="Estado" /></span>
        </label>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Código postal <span className="font-normal text-slate-400">(opcional)</span>
          <span className="relative mt-2 block"><span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400">location_on</span><input inputMode="numeric" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800" placeholder="00000" /></span>
        </label>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Link to={`${BASE}/planteles?tipo=docente`} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 no-underline hover:bg-slate-50 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-lg">arrow_back</span> Regresar</Link><Link to={`${BASE}/sin-coincidencias`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-extrabold text-white no-underline shadow-lg shadow-red-900/15 hover:bg-red-700">Buscar institución <span className="material-symbols-outlined text-lg">search</span></Link></div>
    </div>
    <p className="mt-4 text-center text-xs text-slate-400">Prototipo: el botón muestra el estado sin coincidencias; la búsqueda aún no está conectada.</p>
  </Shell>;
}

function NoMatches() {
  return <Shell eyebrow="DIRECTORIO DE INSTITUCIONES"><Stepper active={2} />
    <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-10 text-center shadow-sm sm:px-12 dark:border-slate-800 dark:bg-slate-900">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"><span className="material-symbols-outlined text-3xl">domain_disabled</span></span>
      <h1 className="mt-5 text-3xl font-black">Aún no encontramos tu escuela</h1>
      <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-500 dark:text-slate-400">Puedes conocer el portal con una vista de demostración o iniciar una solicitud para que revisemos la incorporación de tu plantel.</p>
      <div className="mx-auto mt-8 grid max-w-2xl gap-4 text-left sm:grid-cols-2">
        <ChoiceCard to={`${BASE}/demo`} icon="visibility" title="Probar una demo" description="Recorrer una muestra con contenido ficticio." tone="green" />
        <ChoiceCard to={`${BASE}/solicitud`} icon="add_business" title="Solicitar mi escuela" description="Dejar los datos del plantel para iniciar la conversación." tone="red" />
      </div>
      <Link to={`${BASE}/buscar`} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-slate-500 no-underline hover:text-primary"><span className="material-symbols-outlined text-lg">arrow_back</span> Volver a buscar</Link>
    </div>
  </Shell>;
}

function Demo() {
  const modules = [["event", "Avisos y calendario", "Novedades y fechas importantes del plantel."], ["assignment", "Trámites escolares", "Orientación para solicitudes y procesos."], ["storefront", "Servicios y tienda", "Información de productos y servicios escolares."]];
  return <Shell eyebrow="VISTA DE DEMOSTRACIÓN"><Stepper active={3} />
    <div className="grid gap-7 md:grid-cols-[1.1fr_.9fr] md:items-center">
      <div><span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Entorno de muestra</span><h1 className="mt-5 text-4xl font-black tracking-tight">Conoce el portal escolar</h1><p className="mt-4 text-base leading-7 text-slate-500 dark:text-slate-400">Explora cómo se podrían reunir servicios e información escolar en un solo espacio. Esta demo es únicamente visual y utiliza contenido de ejemplo.</p><Link to={`${BASE}/solicitud`} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-extrabold text-white no-underline shadow-lg shadow-red-900/15 hover:bg-red-700">Quiero este portal para mi escuela <span className="material-symbols-outlined text-lg">arrow_forward</span></Link></div>
      <div className="space-y-3">{modules.map(([icon, title, description]) => <div key={title} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><IconTile icon={icon} tone="red"/><div><h2 className="text-sm font-extrabold">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p></div></div>)}</div>
    </div>
    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200"><span className="font-extrabold">Demo de diseño:</span> todavía no hay contenido interactivo ni datos reales de otras escuelas.</div>
  </Shell>;
}

function RequestSchool() {
  return <Shell eyebrow="INCORPORAR UNA INSTITUCIÓN"><Stepper active={3} />
    <PageHeading title="Cuéntanos de tu escuela">Este formulario es una maqueta para visualizar la solicitud. Aún no envía ni almacena datos.</PageHeading>
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-900 dark:bg-red-950/30 dark:text-red-200"><span className="material-symbols-outlined mt-0.5">domain</span><p className="m-0">Datos de contacto institucional para evaluar una posible implementación del portal.</p></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">Nombre oficial de la escuela<input className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800" placeholder="Nombre del plantel" /></label>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nombre de contacto<input className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800" placeholder="Nombre y apellido" /></label>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cargo o función<input className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800" placeholder="Docente, dirección, administración…" /></label>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Correo de contacto<input type="email" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800" placeholder="nombre@escuela.edu.mx" /></label>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Estado / municipio<input className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800" placeholder="Ubicación del plantel" /></label>
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 sm:col-span-2">¿Qué te gustaría gestionar desde el portal?<textarea rows="3" className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800" placeholder="Avisos, trámites, calendario, servicios…" /></label>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><Link to={`${BASE}/sin-coincidencias`} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-500 no-underline hover:bg-slate-50 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-lg">arrow_back</span> Regresar</Link><button type="button" disabled className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-extrabold text-white opacity-60">Enviar solicitud <span className="material-symbols-outlined text-lg">send</span></button></div>
      <p className="mt-4 text-center text-xs text-slate-400">Envío deshabilitado durante esta etapa de diseño.</p>
    </div>
  </Shell>;
}

export default function InstitutionFlow() {
  const { pathname } = useLocation();
  if (pathname === `${BASE}/planteles`) return <Institutions />;
  if (pathname === `${BASE}/buscar`) return <SearchSchool />;
  if (pathname === `${BASE}/sin-coincidencias`) return <NoMatches />;
  if (pathname === `${BASE}/demo`) return <Demo />;
  if (pathname === `${BASE}/solicitud`) return <RequestSchool />;
  return <AccessHome />;
}
