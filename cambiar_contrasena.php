<?php
require "DBManager.php";
header("Access-Control-Allow-Origin: *");

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["email"], $_POST["nuevaContrasena"])) {
    $email = $_POST["email"];
    $nuevaContrasena = $_POST["nuevaContrasena"];

    $db = new DBManager();
    $resultado = $db->actualizarContrasena($email, $nuevaContrasena);

    if ($resultado) {
        echo "✔️ Contraseña actualizada correctamente.";
    } else {
        echo "❌ Error al actualizar la contraseña.";
    }
} else {
    echo "⚠️ Datos incompletos.";
}
?>
