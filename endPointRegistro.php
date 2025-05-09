<?php
require "DBManager.php";

// Encabezados para permitir CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

// Validar método POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nombre = $_POST["nombre"] ?? '';
    $email = $_POST["email"] ?? '';
    $contrasena = $_POST["contrasena"] ?? '';

    $db = new DBManager();
    $usuario = $db->addUsuario($nombre, $email, $contrasena);    

    if ($usuario) {
        // Respuesta JSON exitosa
        echo json_encode([
            'success' => true,
            'nombre' => $nombre
        ]);
    } else {
        // Respuesta de error
        echo json_encode([
            'success' => false,
            'error' => 'Error en el registro'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'No se recibió un formulario POST válido'
    ]);
}
