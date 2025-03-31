// Definir las rutas de las imágenes originales y las nuevas
const imagenesOriginales = [
    'images/circulo1.png',
    'images/circulo2.png',
    'images/circulo3.png'
  ];
  
  const nuevasImagenes = [
    'images/circulo4.png',
    'images/circulo5.png',
    'images/circulo6.png'
  ];
  
  // Variable para controlar el estado del carrusel
  let mostrandoNuevas = false;
  let intervalo = null;
  
  // Función para alternar las imágenes con animación
  function alternarImagenes() {
    const imagenes = document.querySelectorAll('.divConsejos img');
    imagenes.forEach((img, index) => {
      // Agregar clase para animación de desvanecimiento y desplazamiento
      img.classList.add('fade-out-left');
      setTimeout(() => {
        // Cambiar la fuente de la imagen después de la animación
        img.src = mostrandoNuevas ? imagenesOriginales[index] : nuevasImagenes[index];
        // Remover la clase de animación y agregar clase para aparecer desde la derecha
        img.classList.remove('fade-out-left');
        img.classList.add('fade-in-right');
        setTimeout(() => {
          img.classList.remove('fade-in-right');
        }, 1000); // Duración de la animación de aparición
      }, 1000); // Duración de la animación de desaparición
    });
    mostrandoNuevas = !mostrandoNuevas;
  }
  
  // Función para iniciar el carrusel
  function iniciarCarrusel() {
    if (!intervalo) {
      alternarImagenes(); // Cambiar imágenes inmediatamente
      intervalo = setInterval(alternarImagenes, 5000); // Cambiar imágenes cada 5 segundos
    }
  }
  
  // Función para detener el carrusel
  function detenerCarrusel() {
    if (intervalo) {
      clearInterval(intervalo);
      intervalo = null;
    }
  }
  
  // Función para manejar cambios en el tamaño de la pantalla
  function manejarCambioTamano() {
    if (window.innerWidth <= 700) {
      iniciarCarrusel();
    } else {
      detenerCarrusel();
    }
  }
  
  // Agregar listener para cambios en el tamaño de la ventana
  window.addEventListener('resize', manejarCambioTamano);
  
  // Ejecutar la función una vez para establecer el estado inicial
  manejarCambioTamano();
  