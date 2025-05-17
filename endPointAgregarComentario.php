<?php
require "DBManager.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"));

    $id_producto = $data->id_producto ?? 0;
    $usuario = $data->usuario ?? '';
    $texto = $data->texto ?? '';
    $rating = $data->rating ?? 0;

    if (!$id_producto || !$usuario || !$texto || !$rating) {
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
        exit;
    }

    $db = new DBManager();
    $resultado = $db->agregarComentario($id_producto, $usuario, $texto, $rating);
    echo json_encode($resultado);
    exit;
}
