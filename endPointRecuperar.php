<?php
require 'vendor/autoload.php';
require 'DBManager.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST["email"];
    $db = new DBManager();

    $usuario = $db->findUsuarioPorCorreo($email);

    if ($usuario) {
        // Generar código aleatorio de 6 dígitos
        $codigo = rand(100000, 999999);

        // Guardar el código en la base de datos
        $db->guardarCodigoRecuperacion($email, $codigo);

        // Enviar correo
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = ''; // CAMBIA ESTO
            $mail->Password   = '';         // CAMBIA ESTO
            $mail->SMTPSecure = 'tls';
            $mail->Port       = 587;

            $mail->setFrom('tu_correo@gmail.com', 'TailsUp');
            $mail->addAddress($email, $usuario['nombre']);

            $mail->Subject = 'Codigo de recuperacion';
            $mail->Body    = "Hola {$usuario['nombre']}, tu código de recuperación es: $codigo";

            $mail->send();
            echo json_encode(['success' => true, 'message' => 'Correo enviado con el código.']);
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error al enviar el correo: ' . $mail->ErrorInfo]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'El correo no existe.']);
    }
}
