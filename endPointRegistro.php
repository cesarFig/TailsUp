<?php
require "DBManager.php";

if (isset($_POST["btnRegistro"])) {
    $nombre = $_POST["nombre"];
    $email = $_POST["email"];
    $contrasena = $_POST["contrasena"];    

    $db = new DBManager();
    $usuario = $db->addUsuario($nombre, $email, $contrasena);    
    
    if ($usuario) {
        // Iniciar sesión automáticamente después de registrar al usuario
        session_start();  // Asegúrate de iniciar la sesión

        $_SESSION['usuario'] = [
            'nombre' => $nombre,
            'email' => $email,
            'autenticado' => true
        ];

        // Redirigir al usuario a la página de inicio o a otra página
        header("Location: index.html");
        exit();
    } else {
        // Mensaje de error si el registro falla
        echo "Error en el registro";
    }
} else {
    echo "No se recibió un formulario POST válido";
}
?>
