<?php
require "DBManager.php";
session_start();

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["btnInicioSesion"])) {
    $email = $_POST["email"];
    $contrasena = $_POST["contrasena"];
    $db = new DBManager();
    $usuario = $db->findUsuario($email, $contrasena);
    
    if ($usuario) {
        // Guardar el nombre del usuario en la sesión
        $_SESSION['usuario'] = [
            'nombre' => $usuario['nombre'], // Aquí se almacena el nombre
            'email' => $usuario['email'],
            'autenticado' => true
        ];
        
        header("Location: index.html");
        exit();
    } else {
        echo "Email o contraseña incorrectos";
    }
}
?>