document.addEventListener('DOMContentLoaded', function() {

  function obtenerCarrito() {
    const userId = localStorage.getItem('idUsuario');

    if (!userId) {
      alert('Usuario no autenticado');
      window.location.href = 'login.html';
      return;
    }

    fetch(`http://localhost/TailsUp-Backend/endPointGetCarrito.php?idUsuario=${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Datos del carrito:', data); // Verificar datos recibidos

        if (data.error) {
          console.error(data.error);
          const tbody = document.querySelector('.cart-table tbody');
          tbody.innerHTML = '<tr><td colspan="7" class="empty-cart-message">Carrito vacío</td></tr>';
          return;
        }

        const tbody = document.querySelector('.cart-table tbody');
        tbody.innerHTML = '';

        data.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td><input type="checkbox"></td>
            <td class="product-image-cell"><img src="images/${item.imagen_producto}" alt="${item.nombre_producto}" class="product-image"></td>
            <td class="product-info">
              <span class="product-name">${item.nombre_producto}</span>
            </td>
            <td class="product-price">
              <span class="current-price">$${item.precio_actual.toFixed(2)}</span>
              <span class="previous-price">$${item.precio_anterior.toFixed(2)}</span>
            </td>
            <td class="product-quantity">
              <button class="quantity-btn decrease" data-id="${item.id_item}">-</button>
              <input type="number" value="${item.cantidad}" min="1" class="quantity-input" data-id="${item.id_item}">
              <button class="quantity-btn increase" data-id="${item.id_item}">+</button>
            </td>
            <td class="product-total">$${(item.precio_actual * item.cantidad).toFixed(2)}</td>
            <td class="product-action"><button class="delete-btn" data-id="${item.id_item}"><i class="fas fa-trash"></i></button></td>
          `;
          tbody.appendChild(row);
        });

        // Agregar eventos a los botones y checkboxes
        agregarEventosBotones();
        agregarEventosCheckboxes();

        // Actualizar "Tu orden" al cargar el carrito
        actualizarTuOrden();
      })
      .catch(error => console.error('Error al obtener el carrito:', error));
  }

  function agregarEventosBotones() {
    // Botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        const itemId = this.getAttribute('data-id');
        eliminarProducto(itemId);
      });
    });

    // Botones de cantidad
    document.querySelectorAll('.quantity-btn').forEach(button => {
      button.addEventListener('click', function() {
        const itemId = this.getAttribute('data-id');
        console.log('Item ID:', itemId); 
        const input = document.querySelector(`.quantity-input[data-id="${itemId}"]`);
        if (!input) {
          console.error('Input element not found for item ID:', itemId);
          return;
        }
        let nuevaCantidad = parseInt(input.value);

        if (this.classList.contains('increase')) {
          nuevaCantidad++;
        } else if (this.classList.contains('decrease') && nuevaCantidad > 1) {
          nuevaCantidad--;
        }

        input.value = nuevaCantidad;
        actualizarCantidad(itemId, nuevaCantidad);
      });
    });
  }

  function agregarEventosCheckboxes() {
    const checkboxes = document.querySelectorAll('.cart-table tbody tr input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', actualizarTuOrden);
    });
  }

  function actualizarTuOrden() {
    const seleccionados = document.querySelectorAll('.cart-table tbody tr input[type="checkbox"]:checked');
    const tuOrdenContainer = document.querySelector('.order-summary-box');

    // Limpiar contenido actual
    tuOrdenContainer.innerHTML = '<h2>Tu orden</h2>';

    if (seleccionados.length === 0) {
      tuOrdenContainer.innerHTML += '<p>No hay productos seleccionados.</p>';
      return;
    }

    let subtotal = 0;
    let descuentoCupon = 0;

    seleccionados.forEach(checkbox => {
      const fila = checkbox.closest('tr');
      const nombreProducto = fila.querySelector('.product-name').textContent;
      const cantidad = fila.querySelector('.quantity-input').value;
      const precioTotal = parseFloat(fila.querySelector('.product-total').textContent.replace('$', ''));

      subtotal += precioTotal;

      const itemResumen = document.createElement('div');
      itemResumen.classList.add('summary-item');
      itemResumen.innerHTML = `
        <span class="summary-product-name">${nombreProducto}</span>
        <span class="summary-quantity">${cantidad}x</span>
        <span class="summary-price">$${precioTotal.toFixed(2)}</span>
      `;

      tuOrdenContainer.appendChild(itemResumen);
    });

    // Verificar si hay un cupón aplicado
    const userId = localStorage.getItem('idUsuario');
    fetch(`http://localhost/TailsUp-Backend/endPointGetCarrito.php?idUsuario=${userId}`)
      .then(response => response.json())
      .then(data => {
        if (data.id_cupon) {
          return fetch(`http://localhost/TailsUp-Backend/endPointGetCupon.php?idCupon=${data.id_cupon}`)
            .then(response => response.json())
            .then(cuponData => {
              descuentoCupon = (subtotal * cuponData.descuento_porcentaje) / 100;
              actualizarResumen(subtotal, descuentoCupon);
            });
        } else {
          actualizarResumen(subtotal, descuentoCupon);
        }
      })
      .catch(error => console.error('Error al verificar el cupón:', error));

    function actualizarResumen(subtotal, descuentoCupon) {
      const total = subtotal - descuentoCupon;

      // Agregar el subtotal
      const subtotalResumen = document.createElement('div');
      subtotalResumen.classList.add('summary-line');
      subtotalResumen.innerHTML = `
        <span>Subtotal:</span>
        <span class="subtotal-price" style="float: right;">$${subtotal.toFixed(2)}</span>
      `;
      tuOrdenContainer.appendChild(subtotalResumen);

      // Agregar el descuento del cupón
      const cuponResumen = document.createElement('div');
      cuponResumen.classList.add('summary-line');
      cuponResumen.innerHTML = `
        <span>Cupones:</span>
        <span class="cupon-discount" style="float: right;">-$${descuentoCupon.toFixed(2)}</span>
      `;
      tuOrdenContainer.appendChild(cuponResumen);

      // Agregar el total
      const totalResumen = document.createElement('div');
      totalResumen.classList.add('summary-line');
      totalResumen.innerHTML = `
        <span style="font-weight: bold;">Total:</span>
        <span class="total-price" style="float: right; font-weight: bold;">$${total.toFixed(2)}</span>
      `;
      tuOrdenContainer.appendChild(totalResumen);
    }
  }

  function eliminarProducto(itemId) {
    const userId = localStorage.getItem('idUsuario');

    fetch(`http://localhost/TailsUp-Backend/endPointEliminarCarritoItem.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: itemId, idUsuario: userId })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          obtenerCarrito(); // Recargar el carrito
        } else {
          console.error('Error al eliminar el producto:', data.message);
        }
      })
      .catch(error => console.error('Error al eliminar el producto:', error));
  }

  function actualizarCantidad(itemId, nuevaCantidad) {
    const userId = localStorage.getItem('idUsuario');

    fetch(`http://localhost/TailsUp-Backend/endPointActualizarCantidadCarrito.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: itemId, cantidad: nuevaCantidad, idUsuario: userId })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          obtenerCarrito(); // Recargar el carrito
        } else {
          console.error('Error al actualizar la cantidad:', data.message);
        }
      })
      .catch(error => console.error('Error al actualizar la cantidad:', error));
  }

  function aplicarCupon() {
    const cuponInput = document.querySelector('.coupon-input');
    const cuponCodigo = cuponInput.value.trim();
    const userId = localStorage.getItem('idUsuario');

    if (!cuponCodigo) {
      alert('Por favor, ingresa un código de cupón.');
      return;
    }

    fetch(`http://localhost/TailsUp-Backend/endPointGetCupon.php?codigoCupon=${cuponCodigo}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Cupón no válido o no encontrado.');
        }
        return response.json();
      })
      .then(cuponData => {
        if (!cuponData.activo) {
          alert('El cupón ingresado no está activo.');
          return;
        }

        // Actualizar el carrito con el id_cupon
        fetch(`http://localhost/TailsUp-Backend/endPointActualizarCuponCarrito.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ idUsuario: userId, idCupon: cuponData.id_cupon })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Error al aplicar el cupón al carrito.');
            }
            return response.json();
          })
          .then(data => {
            if (data.success) {
              alert('Cupón aplicado exitosamente.');
              actualizarTuOrden(); // Recalcular los totales
            } else {
              alert('No se pudo aplicar el cupón.');
            }
          })
          .catch(error => console.error('Error al actualizar el carrito con el cupón:', error));
      })
      .catch(error => alert(error.message));
  }

  // Agregar evento al botón de aplicar cupón
  const aplicarCuponBtn = document.querySelector('.apply-coupon-btn');
  if (aplicarCuponBtn) {
    aplicarCuponBtn.addEventListener('click', aplicarCupon);
  }

  obtenerCarrito();
});
