import { useState } from 'react';
import { productosData } from '../api/tienda';

const librosPorSemestre = {
    1: [6, 7, 8, 9, 10, 11, 13],
    2: [6, 7, 8, 9, 10, 11, 12],
    3: [6, 7, 8, 9, 10, 11, 14],
    4: [6, 7, 8, 9, 10, 11, 15, 17],
    5: [6, 7, 8, 9, 10, 11, 15, 16, 17, 18],
    6: [6, 7, 8, 9, 10, 11, 19]
};

const semestresLabels = ['1er', '2do', '3er', '4to', '5to', '6to'];

const titulos = {
    uniformes: 'Uniformes y Credenciales',
    libros: 'Papelería',
    material: 'Material Escolar',
    tramites: 'Trámites y Documentos',
    Libros: 'Libros de Texto'
};

const iconos = {
    uniformes: 'apparel',
    Libros: 'menu_book',
    libros: 'menu_book',
    tramites: 'description',
    material: 'backpack'
};

function ProductoCard({ producto, categoria, onAgregar }) {
    const [tallaActiva, setTallaActiva] = useState('S');
    const [semestreActivo, setSemestreActivo] = useState('II');

    const handleAgregar = () => {
        const productoFinal = { ...producto };
        if (producto.tallas) productoFinal.tallaSeleccionada = tallaActiva;
        if (producto.semestre) productoFinal.tallaSeleccionada = semestreActivo;
        onAgregar(productoFinal);
    };

    return (
        <div className="product-card bg-white dark:bg-slate-800 dark:border-slate-700 rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="product-image-container relative bg-slate-50 dark:bg-slate-900 p-4 flex items-center justify-center h-40">
                {producto.imagen ? (
                    <img src={producto.imagen} alt={producto.nombre}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                    <span className="text-4xl">👕</span>
                )}
                <div className="absolute top-3 right-3 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                    ${producto.precio}
                </div>
            </div>
            <div className="p-4">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">{producto.marca}</p>
                <h2 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-3">{producto.nombre}</h2>

                {producto.tallas && (
                    <div className="mb-3">
                        <p className="text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">Talla</p>
                        <div className="flex gap-1.5 flex-wrap">
                            {['XS', 'S', 'M', 'L', 'XL'].map(t => (
                                <button key={t}
                                    onClick={() => setTallaActiva(t)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                        tallaActiva === t
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary'
                                    }`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {producto.semestre && (
                    <div className="mb-3">
                        <p className="text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">Semestre</p>
                        <div className="flex gap-1.5 flex-wrap">
                            {['I', 'II', 'III', 'IV', 'V', 'VI'].map(s => (
                                <button key={s}
                                    onClick={() => setSemestreActivo(s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                        semestreActivo === s
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary'
                                    }`}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button type="button" onClick={handleAgregar}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 mt-2">
                    <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                    Agregar al carrito
                </button>
            </div>
        </div>
    );
}

export default function Productos({ isOpen, onClose, categoria, onAgregarAlCarrito }) {
    const [tabSemestre, setTabSemestre] = useState(1);

    if (!isOpen) return null;

    const productos = productosData[categoria] || [];
    const titulo = titulos[categoria] || 'Productos';
    const icono = iconos[categoria] || 'shopping_bag';

    // Filtrar libros por semestre si aplica
    let productosVisibles = productos;
    if (categoria === 'Libros') {
        const ids = librosPorSemestre[tabSemestre] || [];
        productosVisibles = productos.filter(p => ids.includes(p.id));
    }

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col modal-content-sheet">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-red-700 px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-white">{icono}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white">{titulo}</h2>
                    </div>
                    <button onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Tabs para Libros */}
                {categoria === 'Libros' && (
                    <div className="flex border-b-2 border-slate-200 dark:border-slate-700 px-5 flex-shrink-0 dark:bg-slate-900 overflow-x-auto">
                        {semestresLabels.map((label, i) => (
                            <button key={i + 1}
                                onClick={() => setTabSemestre(i + 1)}
                                className="cursor-pointer transition-all whitespace-nowrap text-center py-3 px-3 text-sm font-medium"
                                style={{
                                    flex: 1,
                                    borderBottom: `3px solid ${tabSemestre === i + 1 ? '#f20d0d' : 'transparent'}`,
                                    color: tabSemestre === i + 1 ? '#f20d0d' : '#64748b',
                                    fontWeight: tabSemestre === i + 1 ? 700 : 500,
                                    marginBottom: '-2px'
                                }}>
                                {label} Sem
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid de productos */}
                <div className="flex-1 overflow-y-auto p-6">
                    {productosVisibles.length === 0 ? (
                        <p className="text-center py-10 text-slate-400">No hay productos disponibles</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {productosVisibles.map(producto => (
                                <ProductoCard
                                    key={producto.id}
                                    producto={producto}
                                    categoria={categoria}
                                    onAgregar={(p) => {
                                        onAgregarAlCarrito(p);
                                        onClose();
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
