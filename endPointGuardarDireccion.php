<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'DBManager.php';

// Agregar registros para depuración
error_log('Solicitud recibida en endPointGuardarDireccion.php');

// Decodificar datos JSON si el contenido es application/json
if ($_SERVER['CONTENT_TYPE'] === 'application/json') {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    $_POST = $input ?? [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validar entradas
    $idUsuario = $_POST['idUsuario'] ?? null;
    $direccion = $_POST['direccion'] ?? null;
    $codigoPostal = $_POST['codigo_postal'] ?? null;
    $estado = $_POST['estado'] ?? null;
    $municipio = $_POST['municipio'] ?? null;
    $localidad = $_POST['localidad'] ?? null;
    $colonia = $_POST['colonia'] ?? null;
    $numeroInterior = $_POST['numero_interior'] ?? null;
    $nombre = $_POST['nombre'] ?? null;
    $telefono = $_POST['telefono'] ?? null;

    // Verificar que no falten datos obligatorios
    if (!$idUsuario || !$direccion || !$codigoPostal || !$estado || !$municipio || !$colonia || !$nombre || !$telefono) {
        error_log('Faltan datos obligatorios en la solicitud.');
        echo json_encode(['success' => false, 'message' => 'Faltan datos obligatorios.']);
        http_response_code(400);
        exit;
    }

    $dbManager = new DBManager();
    $result = $dbManager->guardarDireccion($idUsuario, $direccion, $codigoPostal, $estado, $municipio, $localidad, $colonia, $numeroInterior, $nombre, $telefono);

    if ($result) {
        error_log('Dirección guardada correctamente.');
        echo json_encode(['success' => true, 'message' => 'Dirección guardada correctamente.']);
    } else {
        error_log('Error al guardar la dirección en la base de datos.');
        echo json_encode(['success' => false, 'message' => 'Error al guardar la dirección.']);
        http_response_code(500);
    }
} else {
    error_log('Método no permitido: ' . $_SERVER['REQUEST_METHOD']);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    http_response_code(405);
}
?>
