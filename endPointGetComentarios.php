<?php
require "DBManager.php";

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$id_producto = $_GET['id_producto'] ?? 0;

if (!$id_producto) {
    echo json_encode(['status' => 'error', 'message' => 'ID de producto faltante']);
    exit;
}

$db = new DBManager();
$comentarios = $db->obtenerComentariosPorProducto($id_producto);
echo json_encode(['status' => 'success', 'comentarios' => $comentarios]);
exit;
