<?php
require "DBManager.php";
header("Access-Control-Allow-Origin: *");

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["codigoCompleto"]) && isset($_POST["email"])) {
    $codigo = $_POST["codigoCompleto"];
    $email = $_POST["email"];

    $db = new DBManager();
    $codigoValido = $db->verificarCodigoPorEmail($codigo, $email); // Debes implementar esto

    if ($codigoValido) {
        echo "✔️ Código correcto.";
    } else {
        echo "❌ Código incorrecto.";
    }
} else {
    echo "⚠️ Datos incompletos.";
}
?>
