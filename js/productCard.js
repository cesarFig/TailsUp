document.addEventListener('DOMContentLoaded', function() {

    // --- Función para ajustar el tamaño de fuente según la longitud ---
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
        
        let maxCaracteres = window.innerWidth <= 768 ? 10 : 25;
        
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
        default: '16px', // tamaño normal
        condiciones: [
          { minCaracteres: 10, fontSize: '16px' },
          { minCaracteres: 14, fontSize: '12px' },
          { minCaracteres: 18, fontSize: '10px' }
        ]
      };
    
      // Aplicar truncado a títulos
      manejarTruncadoResponsivo('.productTitle');
    
      // Ajustar tamaño de fuente a rating y precio
      ajustarTamañoFuente('.productRating p', reglas);
      ajustarTamañoFuente('.productPrice p', reglas);
    }
  
    // Ejecutar ajustes inicialmente
    iniciarAjustes();
  
    // Reajustar en cambio de tamaño de pantalla
    window.addEventListener('resize', iniciarAjustes);
  
  });
  