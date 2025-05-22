<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'DBManager.php';

$data = json_decode(file_get_contents('php://input'), true);

error_log('Datos recibidos en endPointGuardarTicket.php: ' . json_encode($data));

if (!isset($data['idUsuario'], $data['folio'], $data['subtotal'], $data['descuento'], $data['total'], $data['fecha_entrega'], $data['items'], $data['es_a_direccion'])) {
    error_log('Error: Datos incompletos en el payload recibido.');
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$idUsuario = $data['idUsuario'];
$folio = $data['folio'];
$subtotal = $data['subtotal'];
$descuento = $data['descuento'];
$total = $data['total'];
$fechaEntrega = $data['fecha_entrega'];
$idDireccion = $data['id_direccion'] ?? null;
$idPunto = $data['id_punto'] ?? null;
$esADireccion = isset($data['es_a_direccion']) ? (int)$data['es_a_direccion'] : 1;

error_log('Valor de es_a_direccion recibido: ' . json_encode($data['es_a_direccion']));
error_log('Valor de es_a_direccion convertido: ' . $esADireccion);

$items = $data['items'];

try {
    $db = new DBManager();

    // Insertar el ticket
    $ticketQuery = "INSERT INTO tickets (idUsuario, folio, subtotal, descuento, total, fecha_entrega, id_direccion, id_punto, es_a_direccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $ticketParams = [$idUsuario, $folio, $subtotal, $descuento, $total, $fechaEntrega, $idDireccion, $idPunto, $esADireccion];
    $idTicket = $db->executeInsert($ticketQuery, $ticketParams, 'issddssii');

    // Insertar los items del ticket
    $itemQuery = "INSERT INTO ticket_items (id_ticket, nombre_producto, cantidad, precio_unitario, precio_total) VALUES (?, ?, ?, ?, ?)";

    foreach ($items as $item) {
        $itemParams = [$idTicket, $item['nombre_producto'], $item['cantidad'], $item['precio_unitario'], $item['precio_total']];
        $db->executeInsert($itemQuery, $itemParams, 'isidd');

        // Actualizar stock y unidades vendidas en la tabla productos
        $updateProductQuery = "UPDATE productos SET stock = stock - ?, unidades_vendidas = unidades_vendidas + ? WHERE nombre_producto = ?";
        $db->executeInsert($updateProductQuery, [$item['cantidad'], $item['cantidad'], $item['nombre_producto']], 'iis');
    }

    // Quitar el cupón del carrito
    $removeCouponQuery = "UPDATE carritos SET id_cupon = NULL WHERE idUsuario = ?";
    $db->executeInsert($removeCouponQuery, [$idUsuario], 'i');

    // Eliminar los items comprados del carrito del usuario
    $deleteCartItemsQuery = "DELETE FROM carrito_items WHERE id_carrito = (SELECT id_carrito FROM carritos WHERE idUsuario = ?) AND id_producto IN (SELECT id_producto FROM productos WHERE nombre_producto IN (" . implode(",", array_fill(0, count($items), '?')) . "))";
    $productNames = array_map(fn($item) => $item['nombre_producto'], $items);
    $params = array_merge([$idUsuario], $productNames);
    $types = 'i' . str_repeat('s', count($productNames));
    $db->executeInsert($deleteCartItemsQuery, $params, $types); 

    echo json_encode(['success' => true, 'message' => 'Ticket y items guardados correctamente']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
