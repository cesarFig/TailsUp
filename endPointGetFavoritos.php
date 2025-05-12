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

    // Recibir y decodificar el JSON enviado desde el frontend
    $datos = json_decode(file_get_contents("php://input"), true);

    // Verificar que 'usuario' esté presente
    if (isset($datos['usuario'])) {
        $db = new DBManager();
        
        // Llamar la función que busca favoritos por nombre
        $productos = $db->obtenerProductosFavoritosPorNombre($datos['usuario']);

        echo json_encode([
            "status" => "success",
            "productos" => $productos
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Nombre de usuario no proporcionado"
        ]);
    }
