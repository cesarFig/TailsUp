<?php
// Allow cross-origin requests
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once 'DBManager.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['idCupon'])) {
    $idCupon = $_GET['idCupon'];

    $dbManager = new DBManager();
    $cupon = $dbManager->getCuponById($idCupon);

    if ($cupon) {
        echo json_encode($cupon);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Cupón no encontrado"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["error" => "Solicitud inválida"]);
}
?>