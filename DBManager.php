<?php
class DBManager{
    private $db;
	private $host;
	private $user;
	private $pass;

    public function __construct() {
        $this->db = "tailsUp";
        $this->host = "localhost";
        $this->user = "root";
        $this->pass = null;        
    }

    private function open()
    {
        $link = mysqli_connect(
            $this->host, $this->user, $this->pass, $this->db
        ) or die('Error al abrir conexion');

        return $link;
    }

    private function close($link)
    {
        mysqli_close($link);
    }

    public function findUsuario($email, $contrasenaPlana) {
        $link = $this->open();
        
        $sql = "SELECT  nombre, email, contrasena FROM usuarios WHERE email = ?";
        $query = mysqli_prepare($link, $sql);
        
        if (!$query) {
            $this->close($link);
            return false;
        }
        
        mysqli_stmt_bind_param($query, "s", $email);
        mysqli_stmt_execute($query);
        $result = mysqli_stmt_get_result($query); // Línea clave
        
        if ($result && $usuario = mysqli_fetch_assoc($result)) {
            if (password_verify($contrasenaPlana, $usuario['contrasena'])) {
                unset($usuario['contrasena']); // Eliminar contraseña antes de devolver
                $this->close($link);
                return $usuario;
            }
        }
        
        $this->close($link);
        return false;
    }

    public function addUsuario($nombre, $email, $contrasena)
    { 
        $link = $this->open();
    
        // Usar password_hash para un hashing seguro
        $contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);
    
        $sql = "INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)";
    
        $query = mysqli_prepare($link, $sql);
        mysqli_stmt_bind_param($query, "sss", $nombre, $email, $contrasenaHash);
        $resultado = mysqli_stmt_execute($query);
    
        $this->close($link);
    
        return $resultado;
    }

    public function getProductos(){
        $link = $this->open();
        $sql = "SELECT * FROM productos";
        $query = mysqli_prepare($link, $sql);
        $resultado = mysqli_stmt_execute($query);
        $this->close($link);
    
        return $resultado;
    }
    
    
}
?>