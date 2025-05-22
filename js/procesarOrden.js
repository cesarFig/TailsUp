document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const idUsuario = localStorage.getItem('idUsuario');
  let totalOrden = 0;
  localStorage.removeItem('id_punto');
  if (!idUsuario) {
    console.error('Error: idUsuario no encontrado en localStorage.');
    cartItemsContainer.innerHTML = '<p>Error: No se pudo obtener el ID del usuario.</p>';
    return;
  }

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`http://localhost/TailsUp-Backend/endPointGetItemsOrdenUsuario.php?idUsuario=${idUsuario}`);
      if (!response.ok) {
        throw new Error(`Error en la respuesta de la red: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error al realizar la solicitud fetch:', error);
      throw error;
    }
  };

  const renderCartItems = (items) => {
    cartItemsContainer.innerHTML = '';
    if (items.length === 0) {
      cartItemsContainer.innerHTML = '<p>No hay artículos seleccionados en el carrito.</p>';
      return;
    }

    let subtotal = 0;
    items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('cart-item');
      itemElement.style.display = 'flex';
      itemElement.style.justifyContent = 'space-between';
      itemElement.innerHTML = `
                <span>${item.nombre_producto}</span>
                <span>$${item.precio_actual.toFixed(2)}</span>
            `;
      cartItemsContainer.appendChild(itemElement);
      subtotal += item.precio_actual * item.cantidad;
    });


    const separator = document.createElement('hr');
    separator.style.margin = '20px 0';
    cartItemsContainer.appendChild(separator);


    const subtotalElement = document.createElement('div');
    subtotalElement.classList.add('summary-line');
    subtotalElement.innerHTML = `
            <span>Subtotal:</span>
            <span style="float: right;">$${subtotal.toFixed(2)}</span>
        `;
    cartItemsContainer.appendChild(subtotalElement);


    fetch(`http://localhost/TailsUp-Backend/endPointGetCarrito.php?idUsuario=${idUsuario}`)
      .then(response => response.json())
      .then(data => {
        let descuentoCupon = 0;
        if (data.id_cupon) {
          return fetch(`http://localhost/TailsUp-Backend/endPointGetCuponWithId.php?idCupon=${data.id_cupon}`)
            .then(response => response.json())
            .then(cuponData => {
              descuentoCupon = (subtotal * cuponData.descuento_porcentaje) / 100;
              const cuponElement = document.createElement('div');
              cuponElement.classList.add('summary-line');
              cuponElement.innerHTML = `
                                <span>Cupon (${cuponData.codigo_cupon}):</span>
                                <span style="float: right;">-$${descuentoCupon.toFixed(2)}</span>
                            `;
              cartItemsContainer.appendChild(cuponElement);

              const totalElement = document.createElement('div');
              totalElement.classList.add('summary-line');
              totalElement.innerHTML = `
                                <span style="font-weight: bold;">Total:</span>
                                <span style="float: right; font-weight: bold; color: orange;">$${(subtotal - descuentoCupon).toFixed(2)}</span>
                            `;
              cartItemsContainer.appendChild(totalElement);
            });
        } else {
          const totalElement = document.createElement('div');
          totalElement.classList.add('summary-line');
          totalElement.innerHTML = `
                        <span style="font-weight: bold;">Total:</span>
                        <span style="float: right; font-weight: bold; color: orange;">$${subtotal.toFixed(2)}</span>
                    `;
          cartItemsContainer.appendChild(totalElement);
        }
      })
      .catch(error => console.error('Error al verificar el cupón:', error));
  };

  fetchCartItems()
    .then(renderCartItems)
    .catch(error => {
      cartItemsContainer.innerHTML = '<p>Error al cargar los artículos del carrito.</p>';
    });

  const deliveryForm = document.getElementById('delivery-form');
  const popupContainer = document.getElementById('popup-container');
  const listaDirecciones = document.getElementById('lista-direcciones');
  const retiroCheckbox = document.querySelector('.envio-checkbox');

  async function refreshDirecciones(idUsuario) {
    listaDirecciones.innerHTML = ''; // Limpiar las direcciones actuales
    try {
      const response = await fetch('http://localhost/TailsUp-Backend/endPointListarDirecciones.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idUsuario })
      });

      const data = await response.json();

      if (data.success) {
        let firstCheckbox;
        data.direcciones.forEach((direccion, index) => {
          const li = document.createElement('li');
          li.style.listStyleType = 'none';
          li.style.marginBottom = '10px';
          li.innerHTML = `
                    <div class="envio-opcion">
                        <button class="delete-address-btn" data-id-direccion="${direccion.id_direccion}" style="margin-right: 10px; background-color: transparent; border: none;">
                            <img src="https://cdn-icons-png.flaticon.com/512/542/542724.png" alt="Eliminar" style="width: 20px; height: 20px; opacity: 0.7;">
                        </button>
                        <div class="envio-text">
                            <h4>Dirección Guardada ${index + 1}</h4>
                            <p>${direccion.direccion}, ${direccion.codigo_postal}, ${direccion.estado}</p>
                        </div>
                        <input type="checkbox" class="envio-checkbox" name="direccion" data-id-direccion="${direccion.id_direccion}" ${index === 0 ? 'checked' : ''}>
                    </div>
                `;
          listaDirecciones.appendChild(li);

          if (index === 0) {
            firstCheckbox = li.querySelector('input[type="checkbox"]');
            // Guardar el id_direccion de la primera dirección en localStorage
            localStorage.setItem('id_direccion', direccion.id_direccion);
            localStorage.setItem('es_en_retiro', false);
          }
        });

        if (firstCheckbox) {
          retiroCheckbox.checked = false;
        }

        if (data.direcciones.length === 0) {
          retiroCheckbox.checked = false; // No marcar "Retiro en punto de entrega" si no hay direcciones
          localStorage.removeItem('id_direccion');
          localStorage.removeItem('es_en_retiro');
        }

        // Agregar eventos a los botones de eliminar
        const deleteButtons = document.querySelectorAll('.delete-address-btn');
        deleteButtons.forEach(button => {
          button.addEventListener('click', async (event) => {
            const idDireccion = event.currentTarget.dataset.idDireccion;
            try {
              const deleteResponse = await fetch('http://localhost/TailsUp-Backend/endPointEliminarDireccion.php', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idDireccion, idUsuario })
              });

              const deleteResult = await deleteResponse.json();

              if (deleteResult.success) {
                showCustomAlert('Dirección eliminada correctamente.', '#41BB74');
                await refreshDirecciones(idUsuario); // Refrescar las direcciones listadas
              } else {
                showCustomAlert('Error al eliminar la dirección: ' + deleteResult.message, '#E52727');
              }
            } catch (error) {
              showCustomAlert('Error al conectar con el servidor: ' + error.message, '#E52727');
            }
          });
        });
      } else {
        console.error('Error al obtener las direcciones:', data.message);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  }

  listaDirecciones.addEventListener('change', (event) => {
    if (event.target.classList.contains('envio-checkbox')) {
      const checkboxes = listaDirecciones.querySelectorAll('.envio-checkbox');
      checkboxes.forEach(checkbox => {
        if (checkbox !== event.target) {
          checkbox.checked = false;
        }
      });

      if (event.target.checked) {
        const idDireccion = event.target.dataset.idDireccion;
        localStorage.setItem('id_direccion', idDireccion);
        localStorage.removeItem('id_punto');
      } else {
        localStorage.removeItem('id_direccion');
      }

      retiroCheckbox.checked = false;
      localStorage.setItem('es_en_retiro', false);
    }
  });

  retiroCheckbox.addEventListener('change', () => {
    if (retiroCheckbox.checked) {
        // Desmarcar todos los checkboxes de direcciones si se selecciona "Retiro en punto de entrega"
        const checkboxes = listaDirecciones.querySelectorAll('.envio-checkbox');
        localStorage.removeItem('id_direccion');
        localStorage.setItem('es_en_retiro', true);
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Mostrar ventana emergente con sucursales
        const sucursalesPopup = document.createElement('div');
        sucursalesPopup.classList.add('popup');
        sucursalesPopup.innerHTML = `
            <div class="popup-content" style="text-align: center;background-color: #ebd9c8">
                <h3>Selecciona una sucursal</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; ">
                    <button class="sucursal-btn" data-id-punto="1" style="border-radius: 50px; padding: 10px; background-color: #f0f0f0; border: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Morelia</button>
                    <button class="sucursal-btn" data-id-punto="2" style="border-radius: 50px; padding: 10px; background-color: #f0f0f0; border: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Guadalajara</button>
                    <button class="sucursal-btn" data-id-punto="3" style="border-radius: 50px; padding: 10px; background-color: #f0f0f0; border: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">CDMX</button>
                    <button class="sucursal-btn" data-id-punto="4" style="border-radius: 50px; padding: 10px; background-color: #f0f0f0; border: none; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">Monterrey</button>
                </div>
                <button class="close-popup-btn" style="padding: 10px; border-radius: 10px; background-color: #003f5a; color: white;">Cerrar</button>
            </div>
        `;
        document.body.appendChild(sucursalesPopup);

        // Resaltar la sucursal previamente seleccionada
        const selectedPoint = localStorage.getItem('id_punto');
        if (selectedPoint) {
            const selectedButton = sucursalesPopup.querySelector(`.sucursal-btn[data-id-punto="${selectedPoint}"]`);
            if (selectedButton) {
                selectedButton.style.backgroundColor = '#d1e7dd';
            }
        }

        // Manejar selección de sucursal
        const sucursalButtons = sucursalesPopup.querySelectorAll('.sucursal-btn');
        sucursalButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                sucursalButtons.forEach(btn => {
                    btn.style.backgroundColor = '#f0f0f0';
                });
                event.target.style.backgroundColor = '#d1e7dd'; // Cambiar color para indicar selección
                const idPunto = event.target.dataset.idPunto;
                localStorage.setItem('id_punto', idPunto);
            });
        });

        // Manejar cierre de la ventana emergente
        const closePopupBtn = sucursalesPopup.querySelector('.close-popup-btn');
        closePopupBtn.addEventListener('click', () => {
            const selectedPoint = localStorage.getItem('id_punto');
            if (!selectedPoint) {
                showCustomAlert('Por favor selecciona una sucursal antes de cerrar.', '#ff0000');
                return;
            }
            document.body.removeChild(sucursalesPopup);
        });
    }
});

  deliveryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const idUsuario = localStorage.getItem('idUsuario');
    const formData = new FormData(deliveryForm);
    formData.append('idUsuario', idUsuario);

    try {
      const response = await fetch('http://localhost/TailsUp-Backend/endPointGuardarDireccion.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        showCustomAlert('Dirección guardada correctamente.', '#28a745');
        popupContainer.classList.add('hidden');
        await refreshDirecciones(idUsuario); // Refrescar las direcciones listadas
      } else {
        showCustomAlert('Error al guardar la dirección: ' + result.message, '#ff0000');
      }
    } catch (error) {
      showCustomAlert('Error al conectar con el servidor: ' + error.message, '#ff0000');
    }
  });

  if (idUsuario) {
    refreshDirecciones(idUsuario); // Cargar las direcciones al inicio
  } else {
    console.error('No se encontró el idUsuario en localStorage.');
  }

  // Si no hay direcciones, marcar "Retiro en punto de entrega" por defecto
  retiroCheckbox.checked = true;


  //botones de paypal
  paypal.Buttons({
    createOrder: function (data, actions) {
        const totalElement = document.querySelector('.summary-line span:last-child');
        const totalAmount = totalElement ? parseFloat(totalElement.textContent.replace('$', '').replace(',', '')) : 0;

        // Verificar si hay un descuento aplicado
        const discountElement = document.querySelector('.summary-line span[style*="color: orange;"]');
        const discountedAmount = discountElement ? parseFloat(discountElement.textContent.replace('$', '').replace(',', '')) : totalAmount;

        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: discountedAmount.toFixed(2),
                    currency_code: 'MXN'
                },
                description: "Compra simulada de prueba"
            }]
        });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(async function (details) {
            showCustomAlert("¡Compra completa!\nID de transacción: " + details.id, '#41BB74');
            console.log(details);

            // Prepare ticket data
            const fechaEntrega = new Date();
            const diaActual = new Date().toISOString().split('T')[0];
            fechaEntrega.setDate(fechaEntrega.getDate() + 2);

            const esEnRetiro = localStorage.getItem('es_en_retiro') === 'true';
            const idDireccion = localStorage.getItem('id_direccion');
            const idPunto = esEnRetiro ? (localStorage.getItem('id_punto') || 1) : null;

            const ticketData = {
                idUsuario: idUsuario,
                folio: details.id,
                subtotal: parseFloat(document.querySelector('.summary-line span:nth-child(2)').textContent.replace('$', '').replace(',', '')),
                descuento: parseFloat(document.querySelector('.summary-line span:nth-child(2)').textContent.replace('$', '').replace(',', '')) - parseFloat(document.querySelector('.summary-line span[style*="color: orange;"]').textContent.replace('$', '').replace(',', '')) || 0,
                total: parseFloat(document.querySelector('.summary-line span[style*="color: orange;"]').textContent.replace('$', '').replace(',', '')),
                fecha: diaActual,
                fecha_entrega: fechaEntrega.toISOString().split('T')[0],
                id_direccion: idDireccion,
                id_punto: idPunto,
                es_a_direccion: !esEnRetiro,
                items: await fetchCartItems()
            };

            ticketData.items = ticketData.items.map(item => ({
                nombre_producto: item.nombre_producto,
                cantidad: item.cantidad,
                precio_unitario: item.precio_actual,
                precio_total: item.precio_actual * item.cantidad
            }));

            console.log('Datos enviados al endpoint:', ticketData);

            try {
                const response = await fetch('http://localhost/TailsUp-Backend/endPointGuardarTicket.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(ticketData)
                });

                const result = await response.json();

                if (result.success) {
                    localStorage.removeItem('id_punto');
                    localStorage.removeItem('id_direccion');


                    // Cambiar al paso 4 "resumen"
                    const paymentSteps = document.querySelectorAll('.payment-steps .step');
                    paymentSteps.forEach((step, index) => {
                        if (index === 3) {
                            step.classList.add('active');
                        } else {
                            step.classList.remove('active');
                        }
                    });

                    document.querySelector('.metodos-pago').style.display = 'none';
                    document.querySelector('.resumen-compra').style.display = 'grid';

                    const folioSpan = document.getElementById('folio-exito');
                    if (folioSpan) {
                        folioSpan.textContent = details.id;
                    }

                    const blueContainer = document.querySelector('.blue-rounded-container');
                    const roundedContainer = document.querySelector('.rounded-container');
                    if (roundedContainer) {
                        roundedContainer.style.border = '4px solid #FEA02F';
                    }
                    if (blueContainer) {
                        blueContainer.style.border = '2px solid #1ca000';
                    }
                } else {
                    console.error('Error al guardar el ticket:', result.message);
                    showCustomAlert('Error al guardar el ticket: ' + result.message, '#E52727');
                }
            } catch (error) {
                console.error('Error al conectar con el servidor:', error);
                showCustomAlert('Error al conectar con el servidor: ' + error.message, '#E52727');
            }
        });
    },
    onError: function (err) {
        console.error("Error en el pago simulado:", err);
        showCustomAlert("Error en el pago simulado: " + err.message, '#E52727');
    }
  }).render('#paypal-button-container');

  const confirmButton = document.querySelector('.confirm-button-container button');
  const metodosEnvio = document.querySelector('.metodos-envio');
  const metodosPago = document.querySelector('.metodos-pago');
  const resumenCompra = document.querySelector('.resumen-compra');

  confirmButton.addEventListener('click', () => {
    const paymentSteps = document.querySelectorAll('.payment-steps .step');
    paymentSteps.forEach((step, index) => {
        if (index === 2) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    metodosEnvio.style.display = 'none';
    metodosPago.style.display = 'block';
  });
  
  metodosPago.style.display = 'none';
  resumenCompra.style.display = 'none';

});