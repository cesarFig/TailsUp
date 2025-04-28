<?php

require 'DBManager.php';

function getProductos() {    
    $dbManager = new DBManager();
    $productos = $dbManager->getProductos();
    
    echo json_encode($productos);
}

$response = getProductos();

?>