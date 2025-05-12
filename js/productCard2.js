document.addEventListener('DOMContentLoaded', function () {

  function obtenerProductos() {
    fetch('http://localhost/TailsUp-Backend/endPointGetProductos.php')
      .then(response => response.json())
      .then(productos => {
        const comida = [];
        const juguetes = [];

        productos.forEach(p => {
          const cat = p.categoria.toLowerCase();
          if (cat.includes('comida') || cat.includes('alimento') || cat.includes('alimentación')) {
            comida.push(p);
          } else if (cat.includes('juguete')) {
            juguetes.push(p);
          }
        });

        renderCategoria(comida, 'contenedorProductos');
        renderCategoria(juguetes, 'contenedorToys');

        manejarTruncadoResponsivo('.productTitle');
        iniciarAjustes();
      })
      .catch(error => console.error('Error al cargar productos:', error));
  }

  function renderCategoria(productos, idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    contenedor.innerHTML = '';

    const ordenados = productos
      .slice()
      .sort((a, b) => Number(b.rating) - Number(a.rating))
      .slice(0, 4); // Top 4

    ordenados.forEach(p => renderProducto(p, contenedor));
  }

  function renderProducto(producto, contenedor) {
    const card = document.createElement('div');
    card.className = 'productCard';

    card.innerHTML = `
      <div class="productImage">
        <img src="images/${producto.imagen_producto}" alt="${producto.nombre_producto}">
      </div>
      <div class="productTitle">
        <h4>${producto.nombre_producto}</h4>
      </div>
      <div class="productRating">
        <img src="images/Star.png" alt="Estrella">
        <p>(${producto.rating}) ${producto.unidades_vendidas} Sold</p>
      </div>
      <div class="productPrice">
        <p>
          $${formatearPrecio(String(producto.precio_actual))}
          ${producto.precio_anterior && producto.precio_anterior !== producto.precio_actual
            ? `<s>$${formatearPrecio(String(producto.precio_anterior))}</s>` : ''}
        </p>
      </div>
      <div class="productBtns">
        <button class="btnCompra">Comprar ahora</button>
        <button class="btnCarrito">
          <img src="images/CarritoSimple.png" alt="carritoSimple.png">
        </button>
      </div>
    `;

    contenedor.appendChild(card);
  }

  function formatearPrecio(precio) {
    if (!precio.includes('.')) return `${precio}.00`;
    const partes = precio.split('.');
    return partes[1].length === 1 ? `${precio}0` : precio;
  }

  function ajustarTamañoFuente(selector, reglas) {
    document.querySelectorAll(selector).forEach(elemento => {
      const texto = elemento.textContent.trim();
      let fontSize = reglas.default;
      for (let regla of reglas.condiciones) {
        if (texto.length >= regla.maxCaracteres) {
          fontSize = regla.fontSize;
        }
      }
      elemento.style.fontSize = fontSize;
    });
  }

  function manejarTruncadoResponsivo(selector) {
    const maxCaracteres = window.innerWidth <= 768 ? 10 : 22;
    document.querySelectorAll(selector).forEach(elemento => {
      const titulo = elemento.querySelector('h4');
      if (!titulo) return;
      if (!titulo.hasAttribute('data-texto-completo')) {
        titulo.setAttribute('data-texto-completo', titulo.textContent.trim());
      }
      const textoOriginal = titulo.getAttribute('data-texto-completo');
      titulo.textContent = textoOriginal.length > maxCaracteres
        ? textoOriginal.substring(0, maxCaracteres) + '...'
        : textoOriginal;
      titulo.setAttribute('title', textoOriginal);
    });
  }

  function iniciarAjustes() {
    const reglas = {
      default: '13px',
      condiciones: [
        { maxCaracteres: 10, fontSize: '16px' },
        { maxCaracteres: 14, fontSize: '14px' },
        { maxCaracteres: 18, fontSize: '12px' }
      ]
    };
    ajustarTamañoFuente('.productRating p', reglas);
    ajustarTamañoFuente('.productPrice p', reglas);
  }

  obtenerProductos();
  iniciarAjustes();

  window.addEventListener('resize', function () {
    manejarTruncadoResponsivo('.productTitle');
    iniciarAjustes();
  });

});
