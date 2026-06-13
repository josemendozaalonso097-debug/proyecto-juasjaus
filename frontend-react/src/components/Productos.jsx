import { useState, useEffect, useRef } from 'react';
import { showToast } from '../utils/toast';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../api/tienda';

const semestresLabels = ['1er', '2do', '3er', '4to', '5to', '6to'];

const titulos = {
    uniformes: 'Uniformes y Credenciales',
    Libros: 'Libros de Texto',
    tramites: 'Trámites y Documentos',
};

const iconos = {
    uniformes: 'apparel',
    Libros: 'menu_book',
    tramites: 'description',
};

const CATEGORIAS = [
    { value: 'uniformes', label: 'Uniformes' },
    { value: 'Libros', label: 'Libros' },
    { value: 'tramites', label: 'Trámites' },
];

const emptyForm = {
    nombre: '',
    marca: '',
    precio: '',
    categoria: 'uniformes',
    imagen: '',
    tallas: false,
    semestre: false,
};

// ── Admin product modal ──────────────────────────────────────────────────────
function ProductoModal({ isOpen, onClose, initialData, onSaved }) {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const fileRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const base = initialData
                ? { ...initialData, precio: String(initialData.precio) }
                : { ...emptyForm };
            setForm(base);
            setImagePreview(initialData?.imagen || '');
        }
    }, [isOpen, initialData]);

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            showToast('La imagen no debe superar 3 MB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setForm(f => ({ ...f, imagen: ev.target.result }));
            setImagePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) { showToast('El nombre es obligatorio', 'error'); return; }
        if (!form.precio || isNaN(Number(form.precio)) || Number(form.precio) <= 0) {
            showToast('El precio debe ser un número mayor a 0', 'error'); return;
        }
        setSaving(true);
        try {
            const payload = { ...form, precio: Number(form.precio) };
            let res;
            if (initialData?.id) {
                res = await updateProducto(initialData.id, payload);
            } else {
                res = await createProducto(payload);
            }
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || 'Error al guardar');
            }
            showToast(initialData?.id ? 'Producto actualizado' : 'Producto creado', 'success');
            onSaved();
            onClose();
        } catch (e) {
            showToast(e.message || 'Error al guardar el producto', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-white">
                        {initialData?.id ? 'Editar producto' : 'Nuevo producto'}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-none cursor-pointer">
                        <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-400">close</span>
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                    {/* Image area */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Imagen</label>
                        <div className="flex gap-3 items-start">
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors shrink-0 overflow-hidden bg-slate-50 dark:bg-slate-800"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" className="w-full h-full object-contain" onError={() => setImagePreview('')} />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-3xl">add_photo_alternate</span>
                                        <span className="text-[10px] text-slate-400 mt-1">Subir</span>
                                    </>
                                )}
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFile}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="text-sm font-bold text-primary border border-primary/30 rounded-xl px-3 py-2 cursor-pointer hover:bg-primary/5 transition-colors bg-transparent"
                                >
                                    Elegir archivo
                                </button>
                                <span className="text-[11px] text-slate-400">O pega una URL:</span>
                                <input
                                    type="text"
                                    placeholder="https://... o /imagenesTienda/..."
                                    value={form.imagen?.startsWith('data:') ? '' : form.imagen}
                                    onChange={e => { setForm(f => ({ ...f, imagen: e.target.value })); setImagePreview(e.target.value); }}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Nombre */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Nombre *</label>
                        <input
                            type="text"
                            placeholder="Ej. Playera Blanca"
                            value={form.nombre}
                            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-primary"
                        />
                    </div>

                    {/* Marca */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Marca / Tipo</label>
                        <input
                            type="text"
                            placeholder="Ej. CBTis 258, Libro, Documento"
                            value={form.marca}
                            onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-primary"
                        />
                    </div>

                    {/* Precio */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Precio (MXN) *</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={form.precio}
                            onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-primary"
                        />
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Categoría *</label>
                        <select
                            value={form.categoria}
                            onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-primary"
                        >
                            {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>

                    {/* Opciones */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={form.tallas}
                                onChange={e => setForm(f => ({ ...f, tallas: e.target.checked }))}
                                className="w-4 h-4 accent-primary"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tiene tallas</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={form.semestre}
                                onChange={e => setForm(f => ({ ...f, semestre: e.target.checked }))}
                                className="w-4 h-4 accent-primary"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Por semestre</span>
                        </label>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm border-none cursor-pointer disabled:opacity-60 mt-1 hover:bg-red-700 transition-colors"
                    >
                        {saving ? 'Guardando...' : (initialData?.id ? 'Guardar cambios' : 'Crear producto')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Product card ─────────────────────────────────────────────────────────────
function ProductoCard({ producto, isAdmin, onAgregar, onEdit, onDelete }) {
    const [tallaActiva, setTallaActiva] = useState('S');
    const [semestreActivo, setSemestreActivo] = useState('II');

    const handleAgregar = () => {
        const p = { ...producto };
        if (producto.tallas) p.tallaSeleccionada = tallaActiva;
        if (producto.semestre) p.tallaSeleccionada = semestreActivo;
        onAgregar(p);
    };

    return (
        <div className="product-card bg-white dark:bg-slate-800 dark:border-slate-700 rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all relative">
            {/* Admin buttons */}
            {isAdmin && (
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                    <button
                        onClick={() => onEdit(producto)}
                        className="w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                        title="Editar"
                    >
                        <span className="material-symbols-outlined text-[14px] text-slate-600 dark:text-slate-300">edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(producto)}
                        className="w-7 h-7 rounded-lg bg-red-50/90 dark:bg-red-950/60 backdrop-blur-sm flex items-center justify-center border-none cursor-pointer shadow-sm hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                        title="Eliminar"
                    >
                        <span className="material-symbols-outlined text-[14px] text-primary dark:text-red-400">delete</span>
                    </button>
                </div>
            )}

            {/* Image */}
            <div className="relative bg-slate-50 dark:bg-slate-900 p-4 flex items-center justify-center h-40">
                {producto.imagen ? (
                    <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <span className="text-4xl">🛍️</span>
                )}
                <div className="absolute top-3 right-3 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                    ${producto.precio}
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">{producto.marca}</p>
                <h2 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-3">{producto.nombre}</h2>

                {producto.tallas && (
                    <div className="mb-3">
                        <p className="text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">Talla</p>
                        <div className="flex gap-1.5 flex-wrap">
                            {['XS', 'S', 'M', 'L', 'XL'].map(t => (
                                <button key={t} onClick={() => setTallaActiva(t)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                        tallaActiva === t
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary'
                                    }`}>{t}</button>
                            ))}
                        </div>
                    </div>
                )}

                {producto.semestre && (
                    <div className="mb-3">
                        <p className="text-xs text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">Semestre</p>
                        <div className="flex gap-1.5 flex-wrap">
                            {['I', 'II', 'III', 'IV', 'V', 'VI'].map(s => (
                                <button key={s} onClick={() => setSemestreActivo(s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                        semestreActivo === s
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-primary'
                                    }`}>{s}</button>
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

// ── Main modal ───────────────────────────────────────────────────────────────
export default function Productos({ isOpen, onClose, categoria, onAgregarAlCarrito }) {
    const [productos, setProductos] = useState([]);
    const [loadingProductos, setLoadingProductos] = useState(false);
    const [tabSemestre, setTabSemestre] = useState(1);
    const [adminModal, setAdminModal] = useState(false);
    const [editingProducto, setEditingProducto] = useState(null);

    const isAdmin = (() => {
        try { return JSON.parse(localStorage.getItem('user'))?.rol === 'admin'; }
        catch { return false; }
    })();

    const fetchProductos = () => {
        if (!categoria) return;
        setLoadingProductos(true);
        getProductos(categoria)
            .then(r => r.json())
            .then(data => setProductos(Array.isArray(data) ? data : []))
            .catch(() => setProductos([]))
            .finally(() => setLoadingProductos(false));
    };

    useEffect(() => {
        if (isOpen) fetchProductos();
    }, [isOpen, categoria]);

    const handleEdit = (p) => {
        setEditingProducto(p);
        setAdminModal(true);
    };

    const handleDelete = async (p) => {
        if (!window.confirm(`¿Eliminar "${p.nombre}"?`)) return;
        try {
            const res = await deleteProducto(p.id);
            if (!res.ok) throw new Error();
            showToast('Producto eliminado', 'success');
            fetchProductos();
        } catch {
            showToast('Error al eliminar el producto', 'error');
        }
    };

    if (!isOpen) return null;

    const titulo = titulos[categoria] || 'Productos';
    const icono = iconos[categoria] || 'shopping_bag';

    return (
        <>
            <div
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-red-700 px-6 py-5 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-white">{icono}</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">{titulo}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <button
                                    onClick={() => { setEditingProducto(null); setAdminModal(true); }}
                                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl px-3 py-1.5 text-xs font-bold border-none cursor-pointer transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    Agregar
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer border-none bg-transparent"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs para Libros */}
                    {categoria === 'Libros' && (
                        <div className="flex border-b-2 border-slate-200 dark:border-slate-700 px-5 flex-shrink-0 dark:bg-slate-900 overflow-x-auto">
                            {semestresLabels.map((label, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setTabSemestre(i + 1)}
                                    className="cursor-pointer transition-all whitespace-nowrap text-center py-3 px-3 text-sm font-medium"
                                    style={{
                                        flex: 1,
                                        borderBottom: `3px solid ${tabSemestre === i + 1 ? '#f20d0d' : 'transparent'}`,
                                        color: tabSemestre === i + 1 ? '#f20d0d' : '#64748b',
                                        fontWeight: tabSemestre === i + 1 ? 700 : 500,
                                        marginBottom: '-2px'
                                    }}
                                >
                                    {label} Sem
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Grid de productos */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loadingProductos ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : productos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
                                <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-5xl">inventory_2</span>
                                <p className="text-slate-400 dark:text-slate-500 text-sm">No hay productos en esta categoría</p>
                                {isAdmin && (
                                    <button
                                        onClick={() => { setEditingProducto(null); setAdminModal(true); }}
                                        className="mt-1 text-sm font-bold text-primary hover:underline cursor-pointer border-none bg-transparent"
                                    >
                                        Agregar el primero
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {productos.map(producto => (
                                    <ProductoCard
                                        key={producto.id}
                                        producto={producto}
                                        isAdmin={isAdmin}
                                        onAgregar={(p) => { onAgregarAlCarrito(p); onClose(); }}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin create/edit modal */}
            <ProductoModal
                isOpen={adminModal}
                onClose={() => setAdminModal(false)}
                initialData={editingProducto ? { ...editingProducto, categoria: editingProducto.categoria || categoria } : { ...emptyForm, categoria }}
                onSaved={fetchProductos}
            />
        </>
    );
}
