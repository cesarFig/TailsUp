<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'DBManager.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    error_log('Datos recibidos en el endpoint: ' . json_encode($input));

    $idUsuario = $input['idUsuario'] ?? null;

    error_log('idUsuario recibido: ' . $idUsuario);

    if (!$idUsuario) {
        echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios.']);
        http_response_code(400);
        exit;
    }

    $dbManager = new DBManager();
    $direcciones = $dbManager->listarDirecciones($idUsuario);

    if ($direcciones !== false) {
        echo json_encode(['success' => true, 'direcciones' => $direcciones]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al obtener las direcciones.']);
        http_response_code(500);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    http_response_code(405);
}
?>