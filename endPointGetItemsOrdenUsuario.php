<?php
require_once 'DBManager.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $idUsuario = isset($_GET['idUsuario']) ? intval($_GET['idUsuario']) : null;

    if (!$idUsuario) {
        echo json_encode(["error" => "Falta el idUsuario"]);
        exit;
    }

    $dbManager = new DBManager();
    $carrito = $dbManager->getItemsOrdenUsuario($idUsuario);

    if ($carrito) {
        echo json_encode($carrito);
    } else {
        echo json_encode(["error" => "No se pudo obtener el carrito"]);
    }


} else {
    echo json_encode(["error" => "Método no permitido"]);
}
?>