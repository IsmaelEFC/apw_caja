// --- VARIABLES GLOBALES ---
let data = { categorias: [] };
let totalEfectivo = parseFloat(localStorage.getItem('totalEfectivo')) || 0;
let totalTransferencia = parseFloat(localStorage.getItem('totalTransferencia')) || 0;
let detalleVentas = JSON.parse(localStorage.getItem('detalleVentas')) || {};
let ventaActual = null;
let categoriaActual = null;

// --- ELEMENTOS DEL DOM ---
const categoriasContainer = document.getElementById('categorias-container');
const totalEfectivoSpan = document.getElementById('total-efectivo');
const totalTransferenciaSpan = document.getElementById('total-transferencia');
const fechaActualSpan = document.getElementById('fecha-actual');
const modalPago = document.getElementById('modal-pago');
const montoModalSpan = document.getElementById('monto-modal');
const pagoEfectivoBtn = document.getElementById('pago-efectivo');
const pagoTransferenciaBtn = document.getElementById('pago-transferencia');
const reiniciarDiaBtn = document.getElementById('reiniciar-dia');
const verTotalDetalleBtn = document.getElementById('ver-total-detalle');
const modalDetalle = document.getElementById('modal-detalle');
const totalGeneradoSpan = document.getElementById('total-generado');
const detalleListaUl = document.getElementById('detalle-lista');
const generarPdfBtn = document.getElementById('generar-pdf-btn');

const agregarProductoBtn = document.getElementById('agregar-producto-btn');
const modalAgregarProducto = document.getElementById('modal-agregar-producto');
const formNuevoProducto = document.getElementById('form-nuevo-producto');
const nombreProductoInput = document.getElementById('nombre-producto');
const precioProductoInput = document.getElementById('precio-producto');
const categoriaProductoSelect = document.getElementById('categoria-producto');

// --- FUNCIONES ---

async function inicializarApp() {
    try {
        const hoy = new Date();
        const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        if (fechaActualSpan) {
            fechaActualSpan.textContent = hoy.toLocaleDateString('es-CL', opcionesFecha);
        }
        
        await cargarDatos();
        generarInterfazProductos();
        actualizarResumen();
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
}

async function cargarDatos() {
    try {
        const datosGuardados = localStorage.getItem('data');
        if (datosGuardados) {
            data = JSON.parse(datosGuardados);
        } else {
            const response = await fetch('./productos.json');
            if (response.ok) {
                const fetchedData = await response.json();
                if (fetchedData.categorias && Array.isArray(fetchedData.categorias)) {
                    data.categorias = fetchedData.categorias;
                }
            } else {
                console.warn('No se pudo cargar productos.json. Se usará un catálogo vacío.');
                data.categorias = [{ nombre: 'General', productos: [] }];
            }
            actualizarResumen();
        }
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        data.categorias = [{ nombre: 'General', productos: [] }];
    }
}

function generarInterfazProductos() {
    categoriasContainer.innerHTML = '';
    categoriaProductoSelect.innerHTML = '';

    if (data.categorias.length === 0) {
        const mensaje = document.createElement('p');
        mensaje.textContent = 'No hay categorías ni productos disponibles.';
        categoriasContainer.appendChild(mensaje);
        return;
    }

    data.categorias.forEach((categoria, index) => {
        const categoriaDiv = document.createElement('div');
        categoriaDiv.className = 'categoria' + (index === 0 ? ' activa' : '');
        
        const header = document.createElement('div');
        header.className = 'categoria-header';
        header.innerHTML = `
            <span>${categoria.nombre}</span>
            <span class="toggle-icon">${index === 0 ? '▼' : '▶'}</span>
        `;
        
        const contenido = document.createElement('div');
        contenido.className = 'categoria-contenido';
        if (index === 0) {
            contenido.style.display = 'grid';
        }
        
        if (Array.isArray(categoria.productos) && categoria.productos.length > 0) {
            const productosOrdenados = [...categoria.productos].sort((a, b) => a.nombre.localeCompare(b.nombre));
            productosOrdenados.forEach(producto => {
                const btn = document.createElement('button');
                btn.className = 'producto-btn';
                btn.innerHTML = `
                    <span class="nombre">${producto.nombre}</span>
                    <span class="precio">${formatearPrecio(producto.precio)}</span>
                `;
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    abrirModalPago(producto);
                });
                contenido.appendChild(btn);
            });
        } else {
            const mensaje = document.createElement('div');
            mensaje.className = 'sin-productos';
            mensaje.textContent = 'No hay productos en esta categoría.';
            contenido.appendChild(mensaje);
        }
        
        header.addEventListener('click', () => {
            document.querySelectorAll('.categoria').forEach(cat => {
                if (cat !== categoriaDiv) {
                    cat.classList.remove('activa');
                    cat.querySelector('.toggle-icon').textContent = '▶';
                    cat.querySelector('.categoria-contenido').style.display = 'none';
                }
            });
            
            const isActive = categoriaDiv.classList.toggle('activa');
            const icon = header.querySelector('.toggle-icon');
            icon.textContent = isActive ? '▼' : '▶';
            contenido.style.display = isActive ? 'grid' : 'none';
        });
        
        categoriaDiv.appendChild(header);
        categoriaDiv.appendChild(contenido);
        categoriasContainer.appendChild(categoriaDiv);

        const option = document.createElement('option');
        option.value = categoria.nombre;
        option.textContent = categoria.nombre;
        categoriaProductoSelect.appendChild(option);
    });
}

function abrirModalPago(producto) {
    ventaActual = producto;
    montoModalSpan.textContent = formatearPrecio(ventaActual.precio);
    modalPago.style.display = 'flex';
}

function cerrarModal(modal) {
    modal.style.display = 'none';
}

function formatearPrecio(monto) {
    return `$${monto.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`;
}

function actualizarResumen() {
    if (totalEfectivoSpan) {
        totalEfectivoSpan.textContent = formatearPrecio(totalEfectivo);
    }
    if (totalTransferenciaSpan) {
        totalTransferenciaSpan.textContent = formatearPrecio(totalTransferencia);
    }
    localStorage.setItem('totalEfectivo', totalEfectivo);
    localStorage.setItem('totalTransferencia', totalTransferencia);
    localStorage.setItem('detalleVentas', JSON.stringify(detalleVentas));
    localStorage.setItem('data', JSON.stringify(data));
}

function registrarVenta(metodo) {
    const nombreProducto = ventaActual.nombre;
    const precioProducto = ventaActual.precio;
    if (metodo === 'efectivo') {
        totalEfectivo += precioProducto;
    } else if (metodo === 'transferencia') {
        totalTransferencia += precioProducto;
    }
    if (!detalleVentas[nombreProducto]) {
        detalleVentas[nombreProducto] = { cantidad: 0, total: 0 };
    }
    detalleVentas[nombreProducto].cantidad++;
    detalleVentas[nombreProducto].total += precioProducto;
    actualizarResumen();
    cerrarModal(modalPago);
}

function prepararCierreDeCaja() {
    mostrarDetalle();
}

async function generarPDFyReiniciar() {
    const { jsPDF } = window.jspdf;
    const content = document.getElementById('reporte-pdf-content');
    if (Object.keys(detalleVentas).length === 0) {
        alert('No hay ventas para generar un reporte. Reiniciando caja.');
        reiniciarCaja();
        return;
    }
    document.querySelector('.close-button[data-modal="modal-detalle"]').style.display = 'none';
    const canvas = await html2canvas(content, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    document.querySelector('.close-button[data-modal="modal-detalle"]').style.display = 'block';
    const today = new Date().toISOString().slice(0, 10);
    const filename = `Reporte_Caja_${today}.pdf`;
    const pdfBlob = pdf.output('blob');
    if (navigator.share && navigator.canShare({ files: [new File([pdfBlob], filename, { type: 'application/pdf' })] })) {
        try {
            await navigator.share({
                files: [new File([pdfBlob], filename, { type: 'application/pdf' })],
                title: 'Reporte de Caja',
                text: 'Aquí está el reporte de cierre de caja.'
            });
            reiniciarCaja();
        } catch (error) {
            console.error('Error al compartir:', error);
            pdf.save(filename);
            reiniciarCaja();
        }
    } else {
        pdf.save(filename);
        alert('Tu navegador no soporta la función de compartir. El PDF ha sido descargado.');
        reiniciarCaja();
    }
}

function reiniciarCaja() {
    totalEfectivo = 0;
    totalTransferencia = 0;
    detalleVentas = {};
    actualizarResumen();
    cerrarModal(modalDetalle);
    alert('Caja reiniciada. ¡Día cerrado!');
}

function mostrarDetalle() {
    const totalGenerado = totalEfectivo + totalTransferencia;
    totalGeneradoSpan.textContent = formatearPrecio(totalGenerado);
    detalleListaUl.innerHTML = '';
    const detalleArray = Object.keys(detalleVentas).map(key => ({
        nombre: key,
        ...detalleVentas[key]
    }));
    detalleArray.sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (detalleArray.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No hay ventas registradas para hoy.';
        detalleListaUl.appendChild(li);
        generarPdfBtn.style.display = 'none';
    } else {
        detalleArray.forEach(item => {
            const li = document.createElement('li');
            const precioUnitario = item.total / item.cantidad;
            li.innerHTML = `
                <span>${item.nombre}</span>
                <span>${item.cantidad} x ${formatearPrecio(precioUnitario)} = ${formatearPrecio(item.total)}</span>
            `;
            detalleListaUl.appendChild(li);
        });
        generarPdfBtn.style.display = 'block';
    }
    modalDetalle.style.display = 'flex';
}

function manejarNuevoProducto(event) {
    event.preventDefault();
    const nombre = nombreProductoInput.value.trim();
    const precio = parseFloat(precioProductoInput.value);
    const categoriaNombre = categoriaProductoSelect.value;
    if (nombre && !isNaN(precio) && precio >= 0 && categoriaNombre) {
        const categoria = data.categorias.find(cat => cat.nombre === categoriaNombre);
        if (categoria) {
            const existe = categoria.productos.some(p => p.nombre.toLowerCase() === nombre.toLowerCase());
            if (existe) {
                alert(`El producto "${nombre}" ya existe en la categoría "${categoriaNombre}".`);
                return;
            }
            const nuevoProducto = { nombre, precio };
            categoria.productos.push(nuevoProducto);
            actualizarResumen();
            generarInterfazProductos();
            alert(`Producto "${nombre}" agregado a la categoría "${categoriaNombre}" con éxito.`);
            formNuevoProducto.reset();
            cerrarModal(modalAgregarProducto);
        }
    } else {
        alert('Por favor, ingresa un nombre, precio y categoría válidos.');
    }
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', inicializarApp);
pagoEfectivoBtn.addEventListener('click', () => registrarVenta('efectivo'));
pagoTransferenciaBtn.addEventListener('click', () => registrarVenta('transferencia'));
reiniciarDiaBtn.addEventListener('click', prepararCierreDeCaja);
verTotalDetalleBtn.addEventListener('click', mostrarDetalle);
generarPdfBtn.addEventListener('click', generarPDFyReiniciar);
agregarProductoBtn.addEventListener('click', () => {
    if (data.categorias.length === 0) {
        alert('No puedes agregar productos sin tener al menos una categoría. Agrega una categoría primero en productos.json.');
        return;
    }
    cerrarModal(modalDetalle);
    abrirModalAgregarProducto();
});
formNuevoProducto.addEventListener('submit', manejarNuevoProducto);

document.querySelectorAll('.close-button').forEach(btn => {
    btn.addEventListener('click', (event) => {
        const modalId = event.target.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
            cerrarModal(modal);
        }
    });
});

window.addEventListener('click', (event) => {
    if (event.target === modalPago) {
        cerrarModal(modalPago);
    }
    if (event.target === modalDetalle) {
        cerrarModal(modalDetalle);
    }
    if (event.target === modalAgregarProducto) {
        cerrarModal(modalAgregarProducto);
    }
});