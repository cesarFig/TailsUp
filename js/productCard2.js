let productosFavoritos = [];

function toggleHeart(btn, idProducto) {
  const nombreUsuario = localStorage.getItem('usuario');
  if (!nombreUsuario) {
    window.location.href = "login.html";
    return;
  }

  btn.classList.toggle('liked');
  const icon = btn.querySelector('i');
  const liked = btn.classList.contains('liked');

  icon.classList.toggle('fa-solid', liked);
  icon.classList.toggle('fa-regular', !liked);

  const payload = {
    nombre: nombreUsuario,
    id_producto: idProducto,
    liked: liked
  };

  fetch("http://localhost/TailsUp-Backend/endPointAgregarFavorito.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.status !== "success") {
        console.warn("⚠️ Error al actualizar favorito:", data.message);
      }
    })
    .catch(err => console.error("❌ Error al conectar con el servidor:", err));
}

function verificarAccionUsuario(callback) {
  const usuario = localStorage.getItem("usuario");
  if (!usuario) {
    window.location.href = "login.html";
  } else {
    callback();
  }
}

function agregarAlCarrito(idProducto) {
  const idUsuario = localStorage.getItem('idUsuario');
  if (!idUsuario) {
    console.warn("⚠️ Usuario no autenticado. Redirigiendo a la página de inicio de sesión.");
    window.location.href = "login.html";
    return;
  }

  const payload = {
    idUsuario: idUsuario,
    idProducto: idProducto,
    cantidad: 1 // Default quantity, can be adjusted as needed
  };

  fetch("http://localhost/TailsUp-Backend/endPointAddToCart.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("✅ Producto añadido al carrito correctamente.");
      } else {
        console.warn("⚠️ Error al añadir al carrito:", data.error);
      }
    })
    .catch(err => console.error("❌ Error al conectar con el servidor:", err));
}

document.addEventListener('DOMContentLoaded', function () {
  function inicializarProductos() {
    const nombreUsuario = localStorage.getItem('usuario');
    if (!nombreUsuario) {
      console.warn("⚠️ No hay usuario en localStorage. Se mostrarán productos sin favoritos.");
      productosFavoritos = [];
      obtenerProductos();
      return;
    }

    fetch('http://localhost/TailsUp-Backend/endPointGetFavoritos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: nombreUsuario })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          productosFavoritos = data.productos.map(p => Number(p.id_producto));
        } else {
          productosFavoritos = [];
        }
        obtenerProductos();
      })
      .catch(error => {
        console.error("❌ Error al obtener favoritos:", error);
        obtenerProductos();
      });
  }

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
      .slice(0, 4);

    ordenados.forEach(p => renderProducto(p, contenedor));
  }

  function renderProducto(producto, contenedor) {
    const card = document.createElement('div');
    card.className = 'productCard';

    const esFavorito = productosFavoritos.includes(Number(producto.id_producto));
    const claseCorazon = esFavorito ? 'fa-solid' : 'fa-regular';
    const claseLiked = esFavorito ? 'liked' : '';

    card.innerHTML = `
      <div class="productImage">
        <button class="heart-button ${claseLiked}" onclick="toggleHeart(this, ${producto.id_producto})">
          <i class="${claseCorazon} fa-heart"></i>
        </button>
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
        <button class="btnCompra" onclick="verificarAccionUsuario(() => agregarAlCarrito(${producto.id_producto}))">Comprar ahora</button>
        <button class="btnCarrito" onclick="verificarAccionUsuario(() => alert('Agregar al carrito ${producto.id_producto}'))">
          <img src="images/CarritoSimple.png" alt="carritoSimple.png">
        </button>
      </div>
    `;

    contenedor.appendChild(card);
    card.addEventListener('click', function (e) {
      if (e.target.closest('.heart-button') || e.target.closest('.btnCompra') || e.target.closest('.btnCarrito')) {
        return; // Evita abrir modal si se hace clic en botones
      }

      mostrarDetallesProducto(producto);
    });
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

  inicializarProductos();
  iniciarAjustes();

  window.addEventListener('resize', function () {
    manejarTruncadoResponsivo('.productTitle');
    iniciarAjustes();
  });
});
