<?php
header("Access-Control-Allow-Origin: *");
require 'DBManager.php';


function getProductos() {    
    $dbManager = new DBManager();
    $productos = $dbManager->getProductos();
    
    echo json_encode($productos);
}

getProductos(); 

?>
