
const input = document.getElementById('inputBusqueda');
const resultados = document.getElementById('resultadosBusqueda');
const botonBuscar = document.getElementById('btnBuscar');

function mostrarResultados(productos) {
    resultados.innerHTML = '';
    if (productos.length === 0) {
        resultados.innerHTML = '<div class="resultado-item">No se encontraron productos</div>';
        resultados.style.display = 'block';
        return;
    }

    productos.forEach(producto => {
        const item = document.createElement('div');
        item.classList.add('resultado-item');

        item.innerHTML = `
            <img src=images/${producto.imagen_producto} alt="${producto.nombre - producto}">
            <div class="resultado-texto">
                <span class="nombre">${producto.nombre_producto}</span>
                <span class="precio">$${producto.precio_actual}</span>
            </div>
        `;

        item.onclick = () => {
            mostrarDetallesProducto(producto);
        };

        resultados.appendChild(item);
    });

    resultados.style.display = 'block';
}

function buscarProductos(query) {
    if (query.trim() === '') {
        resultados.style.display = 'none';
        return;
    }

    fetch(`http://localhost/TailsUp-Backend/buscarProductos.php?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => mostrarResultados(data))
        .catch(err => {
            console.error('❌ Error al buscar:', err);
            resultados.innerHTML = '<div class="resultado-item">Error al buscar productos</div>';
            resultados.style.display = 'block';
        });
}

input.addEventListener('input', () => {
    const texto = input.value.trim();
    if (texto.length > 0) {
        buscarProductos(texto);
    } else {
        resultados.style.display = 'none';
    }
});

botonBuscar.addEventListener('click', () => {
    const texto = input.value.trim();
    if (texto.length > 0) {
        buscarProductos(texto);
    }
});

document.addEventListener('click', function (e) {
    if (!document.querySelector('.buscadorDiv').contains(e.target)) {
        resultados.style.display = 'none';
    }
});
let comentariosMock = [];
let estrellasSeleccionadas = 0;
function renderEstrellasFormulario() {
    const contenedor = document.getElementById('estrellasFormulario');
    contenedor.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        const estrella = document.createElement('i');
        estrella.className = i <= estrellasSeleccionadas ? 'fa-solid fa-star seleccionada' : 'fa-regular fa-star';
        estrella.dataset.valor = i;
        estrella.addEventListener('click', () => {
            estrellasSeleccionadas = i;
            renderEstrellasFormulario();
        });
        contenedor.appendChild(estrella);
    }
}
function mostrarComentarios() {
    const lista = document.getElementById('comentariosLista');
    lista.innerHTML = '';

    if (comentariosMock.length === 0) {
        lista.innerHTML = '<p style="color: #777;">No hay comentarios aún.</p>';
        return;
    }

    comentariosMock.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comentario';

        const estrellas = Array.from({ length: 5 }, (_, i) =>
            `<i class="${i < c.rating ? 'fa-solid' : 'fa-regular'} fa-star"></i>`).join('');

        div.innerHTML = `
      <strong>${c.usuario}</strong>
      <div class="estrellas-comentario">${estrellas}</div>
      <p>${c.texto}</p>
    `;
        lista.appendChild(div);
    });
}

function agregarComentario() {
    const texto = document.getElementById('nuevoComentario').value.trim();
    const usuario = localStorage.getItem('usuario') || 'Anónimo';

    if (texto.length === 0 || estrellasSeleccionadas === 0) return;

    comentariosMock.push({ usuario, texto, rating: estrellasSeleccionadas });

    document.getElementById('nuevoComentario').value = '';
    estrellasSeleccionadas = 0;
    renderEstrellasFormulario();
    mostrarComentarios();
}

function cambiarCantidad(valor) {
    const input = document.getElementById('cantidad');
    let cantidad = parseInt(input.value, 10);
    cantidad += valor;
    if (cantidad < 1) cantidad = 1;
    input.value = cantidad;
}
function formatearPrecio(precio) {
    const precioStr = String(precio); // 🔁 Forzamos que sea texto

    if (!precioStr.includes('.')) return `${precioStr}.00`;

    const partes = precioStr.split('.');
    return partes[1].length === 1 ? `${precioStr}0` : precioStr;
}
function renderEstrellas(rating) {
    const estrellasContainer = document.getElementById('modalEstrellas');
    estrellasContainer.innerHTML = '';

    const estrellasLlenas = Math.floor(rating);
    const mediaEstrella = rating % 1 >= 0.5;
    const vacias = 5 - estrellasLlenas - (mediaEstrella ? 1 : 0);

    for (let i = 0; i < estrellasLlenas; i++) {
        estrellasContainer.innerHTML += '<i class="fa-solid fa-star"></i>';
    }
    if (mediaEstrella) {
        estrellasContainer.innerHTML += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    for (let i = 0; i < vacias; i++) {
        estrellasContainer.innerHTML += '<i class="fa-regular fa-star"></i>';
    }
}
function renderEstrellasFormulario() {
    const contenedor = document.getElementById('estrellasFormulario');
    contenedor.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
        const estrella = document.createElement('i');
        estrella.className = i <= estrellasSeleccionadas ? 'fa-solid fa-star seleccionada' : 'fa-regular fa-star';
        estrella.dataset.valor = i;
        estrella.addEventListener('click', () => {
            estrellasSeleccionadas = i;
            renderEstrellasFormulario();
        });
        contenedor.appendChild(estrella);
    }
}

function mostrarDetallesProducto(producto) {
    localStorage.setItem('idProductoActual', producto.id_producto);
    document.getElementById('modalImagenProducto').src = 'images/' + producto.imagen_producto;
    document.getElementById('modalNombreProducto').textContent = producto.nombre_producto;
    document.getElementById('modalMarcaProducto').textContent = producto.marca || 'Sin marca';


    document.getElementById('modalRatingVentas').textContent = `(${producto.rating}) ${producto.unidades_vendidas} vendidos`;

    document.getElementById('modalPrecioProducto').textContent = `$${formatearPrecio(producto.precio_actual)}`;
    document.getElementById('modalPrecioAnteriorProducto').textContent =
        producto.precio_anterior && producto.precio_anterior !== producto.precio_actual
            ? `$${formatearPrecio(producto.precio_anterior)}`
            : '';

    document.getElementById('modalDescripcionProducto').textContent = producto.descripcion || 'Sin descripción disponible.';
    document.getElementById('modalProducto').style.display = 'flex';
    renderEstrellas(producto.rating);
    const imagenZoom = document.getElementById('modalImagenProducto');

    imagenZoom.addEventListener('mousemove', function (e) {
        const { left, top, width, height } = this.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        this.style.transformOrigin = `${x}% ${y}%`;
        this.style.transform = "scale(2)";
    });

    imagenZoom.addEventListener('mouseleave', function () {
        this.style.transform = "scale(1)";
    });
    comentariosMock = []; // o cargar desde base de datos en el futuro
    mostrarComentarios();
    renderEstrellasFormulario();
}



function cerrarModalProducto() {
    document.getElementById('modalProducto').style.display = 'none';
}

