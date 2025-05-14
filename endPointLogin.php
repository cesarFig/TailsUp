<?php
require "DBManager.php";

// Permitir CORS y JSON como respuesta
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Solo procesar POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST["email"] ?? '';
    $contrasena = $_POST["contrasena"] ?? '';

    $db = new DBManager();
    $usuario = $db->findUsuario($email, $contrasena);
    
    if ($usuario) {
                
        echo json_encode([
            'success' => true,
            'nombre' => $usuario['nombre'],
            'idUsuario' => $usuario['idUsuario'],
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Email o contraseña incorrectos'
        ]);
    }
    exit();
}
