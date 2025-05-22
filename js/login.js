document.getElementById('Formlogin').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(this);
        const response = await fetch('http://localhost/TailsUp-Backend/endPointLogin.php', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('userAuth', 'true');
            window.location.href = '../index.html';
        } else {
            if (result.message) {
                showCustomAlert(result.message, '#E52727');
            } else {
                showCustomAlert('Credenciales incorrectas', '#E52727');
            }
        }
    } catch (error) {
        console.error('Error en la petición:', error);
        alert('Error al conectar con el servidor. Intente nuevamente.');
    }
});