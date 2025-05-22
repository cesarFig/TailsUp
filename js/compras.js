document.addEventListener('DOMContentLoaded', function() {
    // Obtener ID de usuario desde almacenamiento local
    const userId = localStorage.getItem('idUsuario');
    if (!userId) {
        showCustomAlert('Usuario no autenticado', '#E52727');
        window.location.href = 'login.html';
        return;
    }

    const container = document.querySelector('.pedidos-container');
    const filterButtons = document.querySelectorAll('.filtros-ordenes-button');

    let allTickets = []; // Almacenar todos los tickets para filtrar dinámicamente

    // Función para renderizar tickets
    function renderTickets(tickets) {
        container.innerHTML = '';
        if (tickets.length === 0) {
            container.innerHTML = '<h1 class="pedidos-title empty-message">No hay pedidos</h1>';
            return;
        }

        tickets.forEach(ticket => {
            fetch(`http://localhost/TailsUp-Backend/endPointGetTicketItems.php?id_ticket=${ticket.id_ticket}`)
                .then(res => res.json())
                .then(itemsData => {
                    if (itemsData.error) {
                        console.error(itemsData.error);
                        return;
                    }
                    const count = Array.isArray(itemsData) ? itemsData.length : 0;
                    // Calcular estado de entrega
                    const deliveryDate = new Date(ticket.fecha_entrega);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    deliveryDate.setHours(0, 0, 0, 0);
                    const diffDays = Math.round((deliveryDate - today) / (1000 * 60 * 60 * 24));
                    let diaEntregaText;
                    if (diffDays < 0) {
                        diaEntregaText = 'Entregado';
                    } else if (diffDays === 0) {
                        diaEntregaText = 'Llega hoy';
                    } else if (diffDays === 1) {
                        diaEntregaText = 'Llega mañana';
                    } else {
                        diaEntregaText = `Llega en ${diffDays} días`;
                    }
                    // Crear elemento de pedido
                    const pedidoEl = document.createElement('div');
                    pedidoEl.classList.add('ticket');
                    pedidoEl.innerHTML = `
                        <div class="pedido-item">
                            <div class="imagen-orden">
                                <img src="https://cdn-icons-png.flaticon.com/512/10053/10053703.png" alt="Orden" class="pedido-icon">
                                <h1 class="num-orden">Orden #${ticket.folio}</h1>
                            </div>
                            <p class="dia-entrega">${diaEntregaText}</p>
                            <div class="pedido-item-info">
                                <img src="https://static.thenounproject.com/png/2958546-200.png" alt="Productos" class="num-items-icon">
                                <p class="num-items">${count} producto${count !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div class="pedido-items-container"></div>
                    `;
                    container.appendChild(pedidoEl);

                    // Agregar productos al contenedor correspondiente
                    const itemsContainer = pedidoEl.querySelector('.pedido-items-container');
                    itemsData.forEach(item => {
                        const itemEl = document.createElement('div');
                        itemEl.classList.add('pedido-item-detalle');
                        itemEl.innerHTML = `
                            <img src="images/${item.imagen_producto}" alt="Producto" class="producto-imagen">
                            <p class="producto-nombre">${item.nombre_producto}</p>
                            <p class="producto-marca">Marca: ${item.marca || 'N/A'}</p>
                            <p class="producto-cantidad">Cantidad: ${item.cantidad}</p>
                            <p class="producto-precio">Precio unitario: $${item.precio_unitario}</p>
                        `;
                        itemsContainer.appendChild(itemEl);
                    });
                })
                .catch(err => console.error('Error al obtener items del ticket:', err));
        });
    }

    // Llamar al endpoint de tickets por usuario
    fetch(`http://localhost/TailsUp-Backend/endPointGetTickets.php?idUsuario=${userId}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error(data.error);
                return;
            }
            // Asegurarse de tener un arreglo de tickets
            allTickets = Array.isArray(data) ? data : (data ? [data] : []);
            renderTickets(allTickets);
        })
        .catch(err => console.error('Error al obtener tickets:', err));

    // Agregar eventos a los botones de filtro
    filterButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            // Actualizar clase activa
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filtrar tickets según el botón seleccionado
            let filteredTickets;
            if (index === 0) { // Próximos
                filteredTickets = allTickets.filter(ticket => {
                    const deliveryDate = new Date(ticket.fecha_entrega);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    deliveryDate.setHours(0, 0, 0, 0);
                    return deliveryDate >= today;
                });
            } else if (index === 1) { // Entregados
                filteredTickets = allTickets.filter(ticket => {
                    const deliveryDate = new Date(ticket.fecha_entrega);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    deliveryDate.setHours(0, 0, 0, 0);
                    return deliveryDate < today;
                });
            } else { // Todos
                filteredTickets = allTickets;
            }

            renderTickets(filteredTickets);
        });
    });
});