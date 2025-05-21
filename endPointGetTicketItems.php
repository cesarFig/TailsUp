<?php
require_once 'DBManager.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id_ticket = isset($_GET['id_ticket']) ? intval($_GET['id_ticket']) : null;

    if (!$id_ticket) {
        echo json_encode(["error" => "Falta el id_ticket"]);
        exit;
    }

    $dbManager = new DBManager();
    $ticketItems = $dbManager->getTicketItems($id_ticket);

    if ($ticketItems) {
        echo json_encode($ticketItems);
    } else {
        echo json_encode(["error" => "No se pudo obtener los ticketItems"]);
    }
} else {
    echo json_encode(["error" => "Método no permitido"]);
}
?>