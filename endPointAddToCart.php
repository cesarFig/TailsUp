<?php
require_once 'DBManager.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $idUsuario = isset($input['idUsuario']) ? intval($input['idUsuario']) : null;
    $idProducto = isset($input['idProducto']) ? intval($input['idProducto']) : null;
    $cantidad = isset($input['cantidad']) ? intval($input['cantidad']) : 1;

    if (!$idUsuario || !$idProducto) {
        echo json_encode(["error" => "Faltan datos obligatorios: idUsuario o idProducto"]);
        exit;
    }

    $dbManager = new DBManager();

    try {
        $carrito = $dbManager->getCarritoId($idUsuario);

        if (!$carrito) {
            echo json_encode(["error" => "No se encontró un carrito para el usuario"]);
            exit;
        }

        $idCarrito = $carrito['id_carrito'];
        $resultado = $dbManager->agregarItemCarrito($idCarrito, $idProducto, $cantidad);

        if ($resultado) {
            echo json_encode(["success" => "Producto añadido al carrito"]);
        } else {
            echo json_encode(["error" => "No se pudo añadir el producto al carrito"]);
        }
    } catch (Exception $e) {
        echo json_encode(["error" => "Error del servidor: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["error" => "Método no permitido"]);
}
?>