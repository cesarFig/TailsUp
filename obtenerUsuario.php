<?php
session_start();
if (isset($_SESSION['usuario']) && $_SESSION['usuario']['autenticado']) {
    echo json_encode(['nombre' => $_SESSION['usuario']['nombre']]);
} else {
    echo json_encode(['nombre' => null]);
}
?>