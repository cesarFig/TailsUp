<?php
require_once 'DBManager.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $idUsuario = isset($_GET['idUsuario']) ? intval($_GET['idUsuario']) : null;

    if (!$idUsuario) {
        echo json_encode(["error" => "Falta el idUsuario"]);
        exit;
    }

    $dbManager = new DBManager();
    $tickets = $dbManager->getTickets($idUsuario);

    if ($tickets) {
        echo json_encode($tickets);
    } else {
        echo json_encode(["error" => "No se pudo obtener los tickets"]);
    }
} else {
    echo json_encode(["error" => "Método no permitido"]);
}
?>