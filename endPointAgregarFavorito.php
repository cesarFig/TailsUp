<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'DBManager.php';
header("Content-Type: application/json");

$datos = json_decode(file_get_contents("php://input"), true);

if (isset($datos['nombre']) && isset($datos['id_producto']) && isset($datos['liked'])) {
    $db = new DBManager();
    $idUsuario = $db->obtenerIdUsuarioPorNombre($datos['nombre']);

    if ($idUsuario === false) {
        echo json_encode([
            "status" => "error",
            "message" => "Usuario no encontrado"
        ]);
        exit();
    }

    if ($datos['liked']) {
        $resultado = $db->agregarFavorito($idUsuario, $datos['id_producto']);
        $mensaje = "Favorito agregado";
    } else {
        $resultado = $db->eliminarFavorito($idUsuario, $datos['id_producto']);
        $mensaje = "Favorito eliminado";
    }

    echo json_encode([
        "status" => $resultado ? "success" : "error",
        "message" => $mensaje
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Datos incompletos"
    ]);
}
