<?php
// Allow cross-origin requests
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
    exit;
}

require_once 'DBManager.php';

$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['idUsuario'], $input['idCupon'])) {
    $idUsuario = $input['idUsuario'];
    $idCupon = $input['idCupon'];

    $dbManager = new DBManager();
    $success = $dbManager->actualizarCuponCarrito($idUsuario, $idCupon);

    if ($success) {
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error al actualizar el cupón en el carrito"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Datos incompletos"]);
}