<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
require_once 'DBManager.php';

$query = isset($_GET['query']) ? trim($_GET['query']) : '';

if ($query === '') {
    echo json_encode([]);
    exit;
}

$db = new DBManager();
$productos = $db->buscarProductos($query);
echo json_encode($productos);
?>
