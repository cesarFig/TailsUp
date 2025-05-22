<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'DBManager.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['idDireccion'], $data['idUsuario'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$idDireccion = $data['idDireccion'];
$idUsuario = $data['idUsuario'];

try {
    $db = new DBManager();
    $result = $db->eliminarDireccion($idDireccion, $idUsuario);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Dirección eliminada correctamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se pudo eliminar la dirección']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
