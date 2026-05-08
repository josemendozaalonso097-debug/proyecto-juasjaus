import { productosData } from '../api/tienda.js?v=2';
import { carrito, actualizarCarrito } from './carrito.js?v=2';
import { mostrarNotificacion } from '../utils/notificaciones.js?v=2';
import { verificarLimiteColegiatura } from './pago.js?v=5';

export function abrirModal(categoria) { 
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const productosGrid = document.getElementById('productosGrid');
    
    const titulos = {
        uniformes: 'Uniformes y Credenciales',
        libros: 'Papelería',
        material: 'Material Escolar',
        tramites: 'Trámites y Documentos',
        informacion: 'Información',
        subir: 'Subir Papelería'
    };

    const iconos = {
        uniformes: 'apparel',
        Libros: 'menu_book',
        libros: 'menu_book',
        tramites: 'description',
        material: 'backpack',
        informacion: 'info',
        subir: 'upload_file'
    };

    if(modalTitle) modalTitle.textContent = titulos[categoria] || titulos[categoria.toLowerCase()] || 'Productos';
    
    const modalIcon = document.getElementById('modalIcon');
    if (modalIcon) {
        modalIcon.textContent = iconos[categoria] || 'shopping_bag';
    }

    if(productosGrid) productosGrid.innerHTML = '';

    const tabsNav = document.getElementById('modalTabsNav');
    if (tabsNav) tabsNav.innerHTML = '';

    const productos = productosData[categoria] || [];

    if (productos.length === 0) {
        if(productosGrid) productosGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">No hay productos disponibles</p>';
        if(modal) modal.style.display = 'block';
        return;
    }

    if (categoria === 'Libros') {
        const librosPorSemestre = {
            1: [6, 7, 8, 9, 10, 11, 13], 2: [6, 7, 8, 9, 10, 11, 12],
            3: [6, 7, 8, 9, 10, 11, 14], 4: [6, 7, 8, 9, 10, 11, 15, 17],
            5: [6, 7, 8, 9, 10, 11, 15, 16, 17, 18], 6: [6, 7, 8, 9, 10, 11, 19]
        };
        const semestresLabels = ['1er', '2do', '3er', '4to', '5to', '6to'];

        if(tabsNav) {
            tabsNav.innerHTML = `
                <div id="libros-tabs-nav" style="display: flex; border-bottom: 2px solid #e2e8f0; background: #fff; padding: 0 20px;">
                    ${semestresLabels.map((label, i) => `
                        <button class="libro-tab-btn" data-sem="${i + 1}" onclick="cambiarTabLibros(${i + 1})"
                            style="flex: 1; padding: 13px 6px; border: none; border-bottom: 3px solid ${i === 0 ? '#f20d0d' : 'transparent'};
                            background: transparent; color: ${i === 0 ? '#f20d0d' : '#64748b'}; font-weight: ${i === 0 ? '700' : '500'};
                            font-size: 0.88em; cursor: pointer; transition: all 0.2s; font-family: inherit;
                            white-space: nowrap; margin-bottom: -2px; text-align: center;">
                            ${label} Sem
                        </button>
                    `).join('')}
                </div>
            `;
        }

        window.cambiarTabLibros = function(sem) {
            document.querySelectorAll('.libro-tab-btn').forEach(btn => {
                const active = parseInt(btn.dataset.sem) === sem;
                btn.style.borderBottom = active ? '3px solid #f20d0d' : '3px solid transparent';
                btn.style.color = active ? '#f20d0d' : '#64748b';
                btn.style.fontWeight = active ? '700' : '500';
            });
            const ids = librosPorSemestre[sem] || [];
            const librosDelSem = productos.filter(p => ids.includes(p.id));
            const contenedor = document.getElementById('productosGrid');
            if(!contenedor) return;
            contenedor.innerHTML = '';
            librosDelSem.forEach(producto => {
                contenedor.appendChild(crearProductoCard(producto, categoria));
            });
        };

        window.cambiarTabLibros(1);
        if(modal) modal.style.display = 'block';
        return;
    }

    if(productosGrid) {
        productos.forEach(producto => {
            productosGrid.appendChild(crearProductoCard(producto, categoria));
        });
    }
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.closest('.size-selector');
            parent.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    if(modal) modal.style.display = 'block';
}

function crearProductoCard(producto, categoria) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image-container">
            <div class="product-image-placeholder">
                ${producto.imagen ? `<img src="${producto.imagen}" alt="${producto.nombre}">` : '👕'}
            </div>
            <div class="price-badge">$${producto.precio}</div>
        </div>
        <div class="product-info">
            <p class="product-brand">${producto.marca}</p>
            <h2 class="product-title">${producto.nombre}</h2>
            ${producto.tallas ? `
            <div class="size-selector"><p class="size-label">TALLA</p>
                <div class="size-options">
                    <button class="size-btn" data-size="XS">XS</button><button class="size-btn active" data-size="S">S</button>
                    <button class="size-btn" data-size="M">M</button><button class="size-btn" data-size="L">L</button><button class="size-btn" data-size="XL">XL</button>
                </div>
            </div>` : ''}
            ${producto.semestre ? `
            <div class="size-selector"><p class="size-label">SEMESTRE</p>
                <div class="size-options">
                    <button class="size-btn" data-size="I">I</button><button class="size-btn active" data-size="II">II</button>
                    <button class="size-btn" data-size="III">III</button><button class="size-btn" data-size="IV">IV</button>
                    <button class="size-btn" data-size="V">V</button><button class="size-btn" data-size="VI">VI</button>
                </div>
            </div>` : ''}
            <div class="product-actions">
                <button type="button" class="btn-add-cart" data-id="${producto.id}" data-cat="${categoria}">Agregar al carrito</button>
                <button class="btn-icon">🛒</button>
            </div>
        </div>
    `;
    const addBtn = card.querySelector('.btn-add-cart');
    if (addBtn) addBtn.addEventListener('click', () => agregarAlCarritoWrapper(producto.id, categoria, card));
    return card;
}

function agregarAlCarritoWrapper(productoId, categoria, cardElement) {
    let producto = null;
    for (let cat in productosData) {
        const found = productosData[cat].find(p => p.id === productoId);
        if (found) { producto = { ...found }; break; }
    }
    if (!producto) return;
    
    if (producto.nombre && producto.nombre.toLowerCase().includes('colegiatura')) {
        verificarLimiteColegiatura(() => {
            procesarAgregadoCarrito(producto, productoId, cardElement);
        });
    } else {
        procesarAgregadoCarrito(producto, productoId, cardElement);
    }
}

function procesarAgregadoCarrito(producto, productoId, cardElement) {
    if (producto.tallas || producto.semestre) {
        const sizeBtn = cardElement.querySelector('.size-btn.active');
        producto.tallaSeleccionada = sizeBtn ? sizeBtn.getAttribute('data-size') : 'S';
    }
    
    const existente = carrito.find(item => item.id === productoId && (!item.tallaSeleccionada || item.tallaSeleccionada === producto.tallaSeleccionada));
    if (existente) {
        existente.cantidad++;
    } else {
        producto.cantidad = 1;
        carrito.push(producto);
    }
    
    actualizarCarrito();
    mostrarNotificacion(`${producto.nombre} agregado al carrito`);
    cerrarModal();
}

export function cerrarModal() {
    const modal = document.getElementById('productModal');
    if(modal) modal.style.display = 'none';
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) cerrarModal();
});

window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
