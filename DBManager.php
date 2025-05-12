<?php
class DBManager{
    private $db;
	private $host;
	private $user;
	private $pass;

    public function __construct() {
        $this->db = "tailsup";
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

        $result = mysqli_query($link, $sql, MYSQLI_ASSOC) or die('Error query');

        $rows = [];
        while($columns = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
            $rows[] = $columns;
        }

        $this->close($link);

        return $rows;
    }
    public function guardarCodigoRecuperacion($email, $codigo) {
        $link = $this->open();
    
    $stmt = mysqli_prepare($link, "UPDATE usuarios SET codigo_password = ? WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "is", $codigo, $email);
    $resultado = mysqli_stmt_execute($stmt);
    
    $this->close($link);
    return $resultado; // true si tuvo éxito, false si falló
    }
    public function findUsuarioPorCorreo($email) {
        $link = $this->open();
    
        $stmt = mysqli_prepare($link, "SELECT nombre, email FROM usuarios WHERE email = ?");
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
    
        $usuario = mysqli_fetch_array($result, MYSQLI_ASSOC);
    
        $this->close($link);
        return $usuario; // Devuelve null si no hay coincidencia
    }
    public function verificarCodigoporEmail($codigo, $email) {
        $link = $this->open();
    
        $stmt = mysqli_prepare($link, "SELECT codigo_password FROM usuarios WHERE codigo_password = ? AND email = ?");
        mysqli_stmt_bind_param($stmt, "ss", $codigo, $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
    
        $existe = mysqli_fetch_array($result, MYSQLI_ASSOC);
    
        $this->close($link);
        return $existe !== null; // Devuelve true si encontró una coincidencia exacta
    }
    public function actualizarContrasena($email, $nuevaContrasena) {
        $link = $this->open();
    
        $hash = password_hash($nuevaContrasena, PASSWORD_DEFAULT);
    
        // Actualiza la contraseña y borra el código
        $sql = "UPDATE usuarios SET contrasena = ?, codigo_password = NULL WHERE email = ?";
    
        $stmt = mysqli_prepare($link, $sql);
        mysqli_stmt_bind_param($stmt, "ss", $hash, $email);
        $resultado = mysqli_stmt_execute($stmt);
    
        $this->close($link);
    
        return $resultado;
    }
    
    public function agregarFavorito($id_usuario, $id_producto) {
    $link = $this->open();

    $sql = "INSERT INTO favoritos (idUsuario, id_producto) VALUES (?, ?)";
    $stmt = mysqli_prepare($link, $sql);


    mysqli_stmt_bind_param($stmt, "ii", $id_usuario, $id_producto);
    $resultado = mysqli_stmt_execute($stmt);

    mysqli_stmt_close($stmt);
    $this->close($link);

    return $resultado;
}
public function obtenerIdUsuarioPorNombre($nombre) {
    $link = $this->open();

    $sql = "SELECT idUsuario FROM usuarios WHERE nombre = ?";
    $stmt = mysqli_prepare($link, $sql);

    if (!$stmt) {
        $this->close($link);
        return false;
    }

    mysqli_stmt_bind_param($stmt, "s", $nombre);
    mysqli_stmt_execute($stmt);

    $resultado = mysqli_stmt_get_result($stmt);

    if ($fila = mysqli_fetch_assoc($resultado)) {
        $idUsuario = $fila['idUsuario'];
    } else {
        $idUsuario = false;
    }

    mysqli_stmt_close($stmt);
    $this->close($link);

    return $idUsuario;
}

public function eliminarFavorito($id_usuario, $id_producto) {
    $link = $this->open();

    $sql = "DELETE FROM favoritos WHERE idUsuario = ? AND id_producto = ?";
    $stmt = mysqli_prepare($link, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $id_usuario, $id_producto);
    $resultado = mysqli_stmt_execute($stmt);

    mysqli_stmt_close($stmt);
    $this->close($link);

    return $resultado;
}
public function obtenerProductosFavoritosPorNombre($nombre) {
    $link = $this->open();

    $query = "
        SELECT p.* 
        FROM usuarios u
        JOIN favoritos f ON u.idUsuario = f.idUsuario
        JOIN productos p ON f.id_producto = p.id_producto
        WHERE u.nombre = ?
    ";

    $stmt = mysqli_prepare($link, $query);
    mysqli_stmt_bind_param($stmt, "s", $nombre);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $productos = [];
    while ($row = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
        $productos[] = $row;
    }

    $this->close($link);
    return $productos; // Devuelve array vacío si no hay favoritos
}



    
}
?>