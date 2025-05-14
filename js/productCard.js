
  function toggleHeart(btn, idProducto) {    
  btn.classList.toggle('liked');
  const icon = btn.querySelector('i');
  const liked = btn.classList.contains('liked');

  icon.classList.toggle('fa-solid', liked);
  icon.classList.toggle('fa-regular', !liked);

  const nombreUsuario = localStorage.getItem('usuario');
  if (!nombreUsuario) {
    console.warn("⚠️ Usuario no encontrado en localStorage");
    return;
  }

  const payload = {
    usuario: nombreUsuario,
    id_producto: idProducto,
    liked: liked
  };

  console.log("📦 Enviando:", payload); // ⬅️ Verifica esto

  fetch("http://localhost/TailsUp-Backend/endPointAgregarFavorito.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => {
      console.log("🔁 Respuesta del servidor:", data); // ⬅️ Verifica si es éxito o error
      if (data.status !== "success") {
        console.warn("⚠️ Error al actualizar favorito:", data.message);
      }
    })
    .catch(err => console.error("❌ Error al conectar con el servidor:", err));
}
document.addEventListener('DOMContentLoaded', function () {
  let productosGlobales = [];
  let productosFavoritos = [];

  let filtroPrecioMaximo = 399;
  let marcasSeleccionadas = new Set();
  let tagSeleccionado = null;

  const marcaContadores = new Map(); // Asocia value del checkbox con su <span>

  
  document.querySelectorAll('.btnCategoriaPet').forEach(btn => {
  btn.addEventListener('click', function () {
    const categoria = this.getAttribute('data-categoria');

    // Si ya estaba seleccionada, desactivarla
    if (this.classList.contains('selected')) {
      this.classList.remove('selected');
      filtrarPorCategoria("Todos");
      return;
    }

    // Desmarcar todos y marcar solo este
    document.querySelectorAll('.btnCategoriaPet').forEach(b => b.classList.remove('selected'));
    this.classList.add('selected');

    filtrarPorCategoria(categoria);
  });
});


  function mapearContadoresMarcas() {
    const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    const spans = document.querySelectorAll('.containerNumInputs span');

    checkboxes.forEach((checkbox, i) => {
      const marca = checkbox.value;
      if (spans[i]) {
        marcaContadores.set(marca, spans[i]);
      }
    });
  }

  function actualizarContadoresMarcas(productos) {
    const conteo = {};
    productos.forEach(p => {
      if (!conteo[p.marca]) conteo[p.marca] = 0;
      conteo[p.marca]++;
    });

    marcaContadores.forEach((span, marca) => {
      span.textContent = conteo[marca] || 0;
    });
  }

  function obtenerProductos() {
    const nombreUsuario = localStorage.getItem('usuario');
    if (!nombreUsuario) {
      console.warn('⚠️ No hay usuario en localStorage');
      return;
    }

    fetch('http://localhost/TailsUp-Backend/endPointGetFavoritos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: nombreUsuario })
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === "success") {
          productosFavoritos = data.productos.map(p => p.id_producto);
        } else {
          console.warn("⚠️ No se pudieron obtener favoritos:", data.message);
        }
        return fetch('http://localhost/TailsUp-Backend/endPointGetProductos.php');
      })
      .then(response => response.json())
      .then(productos => {
        productosGlobales = productos;
        mapearContadoresMarcas();
        actualizarContadoresMarcas(productosGlobales);
        filtrarPorCategoria("Todos");
      })
      .catch(error => console.error('❌ Error al cargar productos o favoritos:', error));
  }

  function filtrarPorCategoria(categoria) {
    const contenedorComida = document.getElementById('contenedorProductos');
    const contenedorJuguetes = document.getElementById('contenedorToys');
    const contenedorRopa = document.getElementById('contenedorProductos2');
    const contenedorAseo = document.getElementById('contenedorToys2');

    contenedorComida.innerHTML = '';
    contenedorJuguetes.innerHTML = '';
    contenedorRopa.innerHTML = '';
    contenedorAseo.innerHTML = '';

    const productosFiltrados = productosGlobales.filter(p => {
      const categoriaMatch = categoria === "Todos" || p.categoria.toLowerCase().includes(categoria.toLowerCase());
      const precioMatch = Number(p.precio_actual) <= filtroPrecioMaximo;
      const marcaMatch = marcasSeleccionadas.size === 0 || marcasSeleccionadas.has(p.marca);
      const tagMatch = !tagSeleccionado || (
        p.nombre_producto.toLowerCase().includes(tagSeleccionado.toLowerCase()) ||
        (p.etiquetas && p.etiquetas.toLowerCase().includes(tagSeleccionado.toLowerCase()))
      );
      return categoriaMatch && precioMatch && marcaMatch && tagMatch;
    });

    actualizarContadoresMarcas(productosGlobales); // 👈 Actualiza siempre desde el total, no filtrado

    const comida = productosFiltrados
      .filter(p => {
        const cat = p.categoria.toLowerCase();
        return cat.includes('comida') || cat.includes('alimento') || cat.includes('alimentación') ||
          (!cat.includes('juguete') && !cat.includes('ropa') && !cat.includes('aseo') && !cat.includes('higiene'));
      }).slice(0, 4);

    const juguetes = productosFiltrados
      .filter(p => p.categoria.toLowerCase().includes('juguete'))
      .slice(0, 4);

    const ropa = productosFiltrados
      .filter(p => p.categoria.toLowerCase().includes('ropa'))
      .slice(0, 4);

    const aseo = productosFiltrados
      .filter(p => {
        const cat = p.categoria.toLowerCase();
        return cat.includes('aseo') || cat.includes('higiene');
      })
      .slice(0, 4);

    const renderProducto = (producto, contenedor) => {
      const card = document.createElement('div');
      card.className = 'productCard';
      card.dataset.idProducto = producto.id_producto;

      const esFavorito = productosFavoritos.map(Number).includes(Number(producto.id_producto));
     
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
          <button class="btnCompra">Comprar ahora</button>
          <button class="btnCarrito"><img src="images/CarritoSimple.png" alt="carritoSimple.png"></button>
        </div>
      `;
      contenedor.appendChild(card);
    };

    comida.forEach(p => renderProducto(p, contenedorComida));
    juguetes.forEach(p => renderProducto(p, contenedorJuguetes));
    ropa.forEach(p => renderProducto(p, contenedorRopa));
    aseo.forEach(p => renderProducto(p, contenedorAseo));

    manejarTruncadoResponsivo('.productTitle');
    iniciarAjustes();
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

  // Eventos de filtros
  const inputRango = document.querySelector('.rangoPrecio');
  const btnAplicarPrecio = document.querySelector('.btnAplicar');

  if (inputRango && btnAplicarPrecio) {
    inputRango.addEventListener('input', function () {
      document.querySelector('.containerTextFiltro p').textContent = `Price: $9 - $${this.value}`;
    });

    btnAplicarPrecio.addEventListener('click', function () {
      filtroPrecioMaximo = Number(inputRango.value);
      filtrarPorCategoria("Todos");
      this.classList.add('animate');
  setTimeout(() => this.classList.remove('animate'), 300);
    });
  }

  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      if (this.checked) {
        marcasSeleccionadas.add(this.value);
      } else {
        marcasSeleccionadas.delete(this.value);
      }
      filtrarPorCategoria("Todos");
    });
  });

  document.querySelectorAll('.filtro-tag').forEach(boton => {
    boton.addEventListener('click', function () {
      if (tagSeleccionado === this.dataset.tag) {
        tagSeleccionado = null;
        this.classList.remove('activo');
      } else {
        document.querySelectorAll('.filtro-tag').forEach(btn => btn.classList.remove('activo'));
        this.classList.add('activo');
        tagSeleccionado = this.dataset.tag;
      }
      filtrarPorCategoria("Todos");
    });
  });

  obtenerProductos();
  iniciarAjustes();

  window.addEventListener('resize', function () {
    manejarTruncadoResponsivo('.productTitle');
    iniciarAjustes();
  });
});
