document.addEventListener('DOMContentLoaded', function () {
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
          showCustomAlert("✅ Producto añadido al carrito correctamente.", '#41BB74');
        } else {
          console.warn("⚠️ Error al añadir al carrito:", data.error);
        }
      })
      .catch(err => console.error("❌ Error al conectar con el servidor:", err));
  }



  function obtenerProductos() {
    fetch('http://localhost/TailsUp-Backend/endPointGetProductos.php')
      .then(response => response.json())
      .then(productos => {
        const contenedorFood = document.getElementById('contenedorProductos3');
        const contenedorToys = document.getElementById('contenedorToys2');
        productos.forEach(producto => {
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
                  ${producto.precio_anterior && producto.precio_anterior !== producto.precio_actual ? `<s>$${formatearPrecio(String(producto.precio_anterior))}</s>` : ''}
                  </p>
              </div>
              <div class="productBtns">
                  <button class="btnCompra" onclick="verificarAccionUsuario(() => agregarAlCarrito(${producto.id_producto}))">Comprar ahora</button>
                  <button class="btnCarrito"><img src="images/CarritoSimple.png" alt="carritoSimple.png"></button>
              </div>
              
            `;
          if (producto.categoria.includes('Juguete')) {
            contenedorToys.appendChild(card);
          } else {
            contenedorFood.appendChild(card);
          }
        });

        // Aplicar ajustes después de que los productos estén cargados
        manejarTruncadoResponsivo('.productTitle');
        iniciarAjustes(); // Llamar iniciar ajustes para tamaños de fuente después de la carga
      })
      .catch(error => console.error('Error al cargar productos:', error));
  }

  function formatearPrecio(precio) {
    // Si el precio no tiene decimales, agregamos ".00"
    if (!precio.includes('.')) {
      return `${precio}.00`;
    }
    const partes = precio.split('.');
    if (partes[1].length === 1) {
      return `${precio}0`; // Si solo tiene un decimal, agregamos un cero
    }

    return precio; // Si ya tiene dos decimales, lo dejamos tal cual
  }

  function ajustarTamañoFuente(selector, reglas) {
    const elementos = document.querySelectorAll(selector);

    elementos.forEach(elemento => {
      const texto = elemento.textContent.trim();
      const longitud = texto.length;

      // Definir tamaño por defecto
      let fontSize = reglas.default;

      // Aplicar reglas de tamaños
      for (let regla of reglas.condiciones) {
        if (longitud >= regla.minCaracteres) {
          fontSize = regla.fontSize;
        }
      }

      elemento.style.fontSize = fontSize;
    });
  }

  function manejarTruncadoResponsivo(selector) {
    const elementos = document.querySelectorAll(selector);

    let maxCaracteres = window.innerWidth <= 768 ? 10 : 22;

    elementos.forEach(elemento => {
      const titulo = elemento.querySelector('h4');
      if (!titulo) return;

      if (!titulo.hasAttribute('data-texto-completo')) {
        titulo.setAttribute('data-texto-completo', titulo.textContent.trim());
      }

      const textoOriginal = titulo.getAttribute('data-texto-completo');

      if (textoOriginal.length > maxCaracteres) {
        // Cortar estrictamente en el límite de caracteres y agregar los puntos suspensivos
        const textoTruncado = textoOriginal.substring(0, maxCaracteres) + '...';

        titulo.textContent = textoTruncado;
        titulo.setAttribute('title', textoOriginal);
      } else {
        titulo.textContent = textoOriginal;
      }
    });
  }

  // --- Función para iniciar ajustes de truncado y tamaño fuente ---
  function iniciarAjustes() {
    // Definir reglas de ajuste de fuente
    const reglas = {
      default: '13px', // tamaño normal
      condiciones: [
        { maxCaracteres: 10, fontSize: '16px' },  // si tiene hasta 10 caracteres → fuente grande
        { maxCaracteres: 14, fontSize: '14px' },  // si tiene hasta 14 caracteres → fuente media
        { maxCaracteres: 18, fontSize: '12px' }   // si tiene hasta 18 caracteres → fuente más pequeña
      ]
    };

    // Ajustar tamaños de fuente en los elementos de la página
    ajustarTamañoFuente('.productRating p', reglas);
    ajustarTamañoFuente('.productPrice p', reglas);
  }

  // Llamar a la función de obtener productos
  obtenerProductos();

  // Llamar a iniciar ajustes iniciales
  iniciarAjustes();

  // Ajustes al redimensionar
  window.addEventListener('resize', function () {
    manejarTruncadoResponsivo('.productTitle');
    iniciarAjustes(); // Reaplicar ajustes de fuente en caso de resize
  });

});
