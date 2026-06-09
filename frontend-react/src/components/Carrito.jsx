import { useState, useEffect, useCallback } from 'react';
import { showToast } from '../utils/toast';

// Hook global de carrito — usa localStorage como fuente de verdad
export function useCarrito() {
    const [carrito, setCarrito] = useState(() => {
        try {
            const saved = localStorage.getItem('carrito');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Sincronizar con localStorage
    useEffect(() => {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }, [carrito]);

    const agregarAlCarrito = useCallback((producto) => {
        setCarrito(prev => {
            const existente = prev.find(item =>
                item.id === producto.id &&
                (!item.tallaSeleccionada || item.tallaSeleccionada === producto.tallaSeleccionada)
            );
            if (existente) {
                return prev.map(item =>
                    item === existente ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prev, { ...producto, cantidad: 1 }];
        });
        showToast(`${producto.nombre} agregado al carrito`, 'success');
    }, []);

    const eliminarDelCarrito = useCallback((index) => {
        setCarrito(prev => prev.filter((_, i) => i !== index));
        showToast('Producto eliminado del carrito', 'info');
    }, []);

    const vaciarCarrito = useCallback(() => {
        setCarrito([]);
        localStorage.removeItem('carrito');
    }, []);

    const calcularTotal = useCallback(() => {
        return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }, [carrito]);

    return { carrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito, calcularTotal };
}

// Componente visual del carrito (sidebar derecho)
export default function Carrito({ carrito, eliminarDelCarrito, calcularTotal, onPagar }) {
    const total = calcularTotal();

    return (
        <aside className="w-full lg:w-80 space-y-6 flex-shrink-0 sidebar-derecha">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <span className="material-symbols-outlined">shopping_basket</span>
                    </div>
                    <h3 className="font-bold text-lg">Productos Seleccionados</h3>
                </div>

                <div className="space-y-4 mb-4">
                    {carrito.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                            No hay productos seleccionados
                        </p>
                    ) : (
                        <>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {carrito.map((item, index) => (
                                    <div key={`${item.id}-${item.tallaSeleccionada || ''}-${index}`}
                                        className="carrito-item-wrap"
                                        style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', padding: '12px',
                                            borderBottom: '1px solid #eee', marginBottom: '8px'
                                        }}>
                                        <div>
                                            <h4 style={{ fontSize: '0.95em', color: '#94272C', marginBottom: '4px' }}>
                                                {item.nombre}
                                            </h4>
                                            <p style={{ fontSize: '0.85em', color: '#666' }}>
                                                ${item.precio} x {item.cantidad}
                                                {item.tallaSeleccionada ? ` - Talla: ${item.tallaSeleccionada}` : ''}
                                            </p>
                                        </div>
                                        <button type="button"
                                            onClick={() => eliminarDelCarrito(index)}
                                            style={{
                                                background: '#e74c3c', color: 'white', border: 'none',
                                                padding: '6px 12px', borderRadius: '6px',
                                                cursor: 'pointer', fontSize: '0.85em'
                                            }}>
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div style={{
                                borderTop: '2px solid #94272C', paddingTop: '15px', marginTop: '15px'
                            }}>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    fontSize: '1.3em', fontWeight: 700, color: '#94272C'
                                }}>
                                    <span>Total:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <button onClick={onPagar}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-6">
                    <span className="material-symbols-outlined">credit_card</span>
                    PAGAR AHORA
                </button>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <div className="flex gap-3">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-xs text-primary font-medium leading-relaxed">
                        Los comprobantes de pago digitales deben presentarse en ventanilla para la entrega de materiales físicos.
                    </p>
                </div>
            </div>
        </aside>
    );
}
