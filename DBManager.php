<?php
class DBManager
{
    private $db;
    private $host;
    private $user;
    private $pass;

    public function __construct()
    {
        $this->db = "tailsup";
        $this->host = "localhost";
        $this->user = "root";
        $this->pass = null;
    }

    private function open()
    {
        $link = mysqli_connect(
            $this->host,
            $this->user,
            $this->pass,
            $this->db
        ) or die('Error al abrir conexion');

        return $link;
    }

    private function close($link)
    {
        mysqli_close($link);
    }

    public function findUsuario($email, $contrasenaPlana)
    {
        $link = $this->open();

        $sql = "SELECT  idUsuario, nombre, email, contrasena FROM usuarios WHERE email = ?";
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

    public function getProductos()
    {

        $link = $this->open();
        $sql = "SELECT * FROM productos";

        $result = mysqli_query($link, $sql, MYSQLI_ASSOC) or die('Error query');

        $rows = [];
        while ($columns = mysqli_fetch_array($result, MYSQLI_ASSOC)) {
            $rows[] = $columns;
        }

        $this->close($link);

        return $rows;
    }
    public function guardarCodigoRecuperacion($email, $codigo)
    {
        $link = $this->open();

        $stmt = mysqli_prepare($link, "UPDATE usuarios SET codigo_password = ? WHERE email = ?");
        mysqli_stmt_bind_param($stmt, "is", $codigo, $email);
        $resultado = mysqli_stmt_execute($stmt);

        $this->close($link);
        return $resultado; // true si tuvo éxito, false si falló
    }
    public function findUsuarioPorCorreo($email)
    {
        $link = $this->open();

        $stmt = mysqli_prepare($link, "SELECT nombre, email FROM usuarios WHERE email = ?");
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $usuario = mysqli_fetch_array($result, MYSQLI_ASSOC);

        $this->close($link);
        return $usuario; // Devuelve null si no hay coincidencia
    }
    public function verificarCodigoporEmail($codigo, $email)
    {
        $link = $this->open();

        $stmt = mysqli_prepare($link, "SELECT codigo_password FROM usuarios WHERE codigo_password = ? AND email = ?");
        mysqli_stmt_bind_param($stmt, "ss", $codigo, $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $existe = mysqli_fetch_array($result, MYSQLI_ASSOC);

        $this->close($link);
        return $existe !== null; // Devuelve true si encontró una coincidencia exacta
    }
    public function actualizarContrasena($email, $nuevaContrasena)
    {
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

    public function agregarFavorito($id_usuario, $id_producto)
    {
        $link = $this->open();

        $sql = "INSERT INTO favoritos (idUsuario, id_producto) VALUES (?, ?)";
        $stmt = mysqli_prepare($link, $sql);


        mysqli_stmt_bind_param($stmt, "ii", $id_usuario, $id_producto);
        $resultado = mysqli_stmt_execute($stmt);

        mysqli_stmt_close($stmt);
        $this->close($link);

        return $resultado;
    }

    public function obtenerIdUsuarioPorNombre($nombre)
    {
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

    public function eliminarFavorito($id_usuario, $id_producto)
    {
        $link = $this->open();

        $sql = "DELETE FROM favoritos WHERE idUsuario = ? AND id_producto = ?";
        $stmt = mysqli_prepare($link, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $id_usuario, $id_producto);
        $resultado = mysqli_stmt_execute($stmt);

        mysqli_stmt_close($stmt);
        $this->close($link);

        return $resultado;
    }
    public function obtenerProductosFavoritosPorNombre($nombre)
    {
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
    public function buscarProductos($texto)
    {
        $link = $this->open();

        $stmt = mysqli_prepare($link, "SELECT * FROM productos WHERE nombre_producto LIKE CONCAT('%', ?, '%') LIMIT 10");
        mysqli_stmt_bind_param($stmt, "s", $texto);
        mysqli_stmt_execute($stmt);

        $result = mysqli_stmt_get_result($stmt);

        $productos = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $productos[] = $row;
        }

        mysqli_stmt_close($stmt);
        $this->close($link);

        return $productos;
    }

    public function getCarritoItems($idUsuario)
    {
        $link = $this->open();

        $sql = "SELECT ci.id_item, ci.id_producto, ci.cantidad, p.nombre_producto, p.precio_actual,p.precio_anterior, p.imagen_producto, ci.is_selected FROM carrito_items ci INNER JOIN productos p ON ci.id_producto = p.id_producto WHERE ci.id_carrito = (SELECT id_carrito FROM carritos WHERE idUsuario = ?)";
        error_log("Ejecutando consulta SQL: $sql con idUsuario=$idUsuario");
        $query = mysqli_prepare($link, $sql);

        if (!$query) {
            $this->close($link);
            return false;
        }

        mysqli_stmt_bind_param($query, "i", $idUsuario);
        mysqli_stmt_execute($query);
        $result = mysqli_stmt_get_result($query);

        $items = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $items[] = $row;
        }

        $this->close($link);
        return $items;
    }



    public function eliminarCarritoItem($id, $idUsuario)
    {
        $link = $this->open();

        $query = "DELETE FROM carrito_items WHERE id_item = ? AND id_carrito = (SELECT id_carrito FROM carritos WHERE idUsuario = ?)";
        $stmt = mysqli_prepare($link, $query);
        mysqli_stmt_bind_param($stmt, "ii", $id, $idUsuario);

        $resultado = mysqli_stmt_execute($stmt);

        $this->close($link);

        return $resultado;
    }

    public function actualizarCarritoItem($id, $cantidad, $idUsuario, $isChecked)
    {
        $link = $this->open();

        $query = "UPDATE carrito_items SET cantidad = ?, is_selected = ? WHERE id_item = ? AND id_carrito = (SELECT id_carrito FROM carritos WHERE idUsuario = ?)";
        $stmt = mysqli_prepare($link, $query);
        mysqli_stmt_bind_param($stmt, "iisi", $cantidad, $isChecked, $id, $idUsuario);

        $resultado = mysqli_stmt_execute($stmt);

        $this->close($link);

        return $resultado;
    }

    public function agregarItemCarrito($idCarrito, $idProducto, $cantidad)
    {
        $link = $this->open();

        // Check if the item already exists in the cart
        $checkQuery = "SELECT cantidad FROM carrito_items WHERE id_carrito = ? AND id_producto = ?";
        $checkStmt = mysqli_prepare($link, $checkQuery);
        mysqli_stmt_bind_param($checkStmt, "ii", $idCarrito, $idProducto);
        mysqli_stmt_execute($checkStmt);
        $result = mysqli_stmt_get_result($checkStmt);

        if ($row = mysqli_fetch_assoc($result)) {
            // If the item exists, update the quantity
            $newCantidad = $row['cantidad'] + $cantidad;
            $updateQuery = "UPDATE carrito_items SET cantidad = ? WHERE id_carrito = ? AND id_producto = ?";
            $updateStmt = mysqli_prepare($link, $updateQuery);
            mysqli_stmt_bind_param($updateStmt, "iii", $newCantidad, $idCarrito, $idProducto);
            $resultado = mysqli_stmt_execute($updateStmt);
        } else {
            // If the item does not exist, insert a new row
            $insertQuery = "INSERT INTO carrito_items (id_carrito, id_producto, cantidad) VALUES (?, ?, ?)";
            $insertStmt = mysqli_prepare($link, $insertQuery);
            mysqli_stmt_bind_param($insertStmt, "iii", $idCarrito, $idProducto, $cantidad);
            $resultado = mysqli_stmt_execute($insertStmt);
        }

        $this->close($link);

        return $resultado;
    }

    public function getCarritoId($idUsuario)
    {
        $link = $this->open();

        $sql = "SELECT id_carrito FROM carritos WHERE idUsuario = ?";
        $stmt = mysqli_prepare($link, $sql);

        if (!$stmt) {
            $this->close($link);
            return false;
        }

        mysqli_stmt_bind_param($stmt, "i", $idUsuario);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $carrito = mysqli_fetch_assoc($result);

        mysqli_stmt_close($stmt);
        $this->close($link);

        return $carrito;
    }



    public function getCuponByCodigo($codigoCupon)
    {
        $link = $this->open();

        $sql = "SELECT * FROM cupones WHERE codigo_cupon = ?";
        $query = mysqli_prepare($link, $sql);

        if (!$query) {
            $this->close($link);
            return false;
        }

        mysqli_stmt_bind_param($query, "s", $codigoCupon);
        mysqli_stmt_execute($query);
        $result = mysqli_stmt_get_result($query);

        if ($result && $cupon = mysqli_fetch_assoc($result)) {
            $this->close($link);
            return $cupon;
        }

        $this->close($link);
        return false;
    }

    public function getCuponById($idCupon)
    {
        $link = $this->open();

        $sql = "SELECT * FROM cupones WHERE id_cupon = ?";
        $query = mysqli_prepare($link, $sql);

        if (!$query) {
            $this->close($link);
            return false;
        }

        mysqli_stmt_bind_param($query, "i", $idCupon);
        mysqli_stmt_execute($query);
        $result = mysqli_stmt_get_result($query);

        if ($result && $cupon = mysqli_fetch_assoc($result)) {
            $this->close($link);
            return $cupon;
        }

        $this->close($link);
        return false;
    }

    public function actualizarCuponCarrito($idUsuario, $idCupon)
    {
        $link = $this->open();

        $sql = "UPDATE carritos SET id_cupon = ? WHERE idUsuario = ?";
        $query = mysqli_prepare($link, $sql);

        if (!$query) {
            $this->close($link);
            return false;
        }

        mysqli_stmt_bind_param($query, "ii", $idCupon, $idUsuario);
        $success = mysqli_stmt_execute($query);

        $this->close($link);

        return $success;
    }

    public function getCarrito($idUsuario)
    {
        $link = $this->open();

        $sql = "SELECT * FROM carritos WHERE idUsuario = ?";
        $stmt = mysqli_prepare($link, $sql);

        if (!$stmt) {
            $this->close($link);
            return false;
        }

        mysqli_stmt_bind_param($stmt, "i", $idUsuario);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $carrito = mysqli_fetch_assoc($result);

        mysqli_stmt_close($stmt);
        $this->close($link);

        return $carrito;
    }
    public function agregarComentario($id_producto, $usuario, $texto, $rating)
    {
        $link = $this->open();

        $stmt = mysqli_prepare($link, "INSERT INTO comentarios (id_producto, usuario, texto, rating) VALUES (?, ?, ?, ?)");
        mysqli_stmt_bind_param($stmt, "issi", $id_producto, $usuario, $texto, $rating);
        mysqli_stmt_execute($stmt);

        // Calcular nuevo promedio
        $avgQuery = "SELECT AVG(rating) AS promedio FROM comentarios WHERE id_producto = ?";
        $stmtAvg = mysqli_prepare($link, $avgQuery);
        mysqli_stmt_bind_param($stmtAvg, "i", $id_producto);
        mysqli_stmt_execute($stmtAvg);
        $result = mysqli_stmt_get_result($stmtAvg);
        $row = mysqli_fetch_assoc($result);
        $nuevoRating = round($row['promedio'], 1);

        // Actualizar productos
        $stmtUpdate = mysqli_prepare($link, "UPDATE productos SET rating = ? WHERE id_producto = ?");
        mysqli_stmt_bind_param($stmtUpdate, "di", $nuevoRating, $id_producto);
        mysqli_stmt_execute($stmtUpdate);

        $this->close($link);
        return ['status' => 'success', 'nuevo_rating' => $nuevoRating];
    }
    public function obtenerComentariosPorProducto($id_producto)
    {
        $link = $this->open();

        $stmt = mysqli_prepare($link, "SELECT usuario, texto, rating, fecha FROM comentarios WHERE id_producto = ? ORDER BY fecha DESC");
        mysqli_stmt_bind_param($stmt, "i", $id_producto);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $comentarios = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $comentarios[] = $row;
        }

        $this->close($link);
        return $comentarios;
    }

    public function getItemsOrdenUsuario($idUsuario)
    {
        $link = $this->open();

        $sql = "SELECT ci.id_item, ci.id_producto, ci.cantidad, p.nombre_producto, p.precio_actual, p.precio_anterior, p.imagen_producto, ci.is_selected 
                FROM carrito_items ci 
                INNER JOIN productos p ON ci.id_producto = p.id_producto 
                WHERE ci.id_carrito = (SELECT id_carrito FROM carritos WHERE idUsuario = ?) AND ci.is_selected = 1";
        error_log("Ejecutando consulta SQL: $sql con idUsuario=$idUsuario");
        $query = mysqli_prepare($link, $sql);

        if (!$query) {
            $this->close($link);
            return false;
        }

        mysqli_stmt_bind_param($query, "i", $idUsuario);
        mysqli_stmt_execute($query);
        $result = mysqli_stmt_get_result($query);

        $items = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $items[] = $row;
        }

        $this->close($link);
        return $items;
    }

    public function guardarDireccion($idUsuario, $direccion, $codigoPostal, $estado, $municipio, $localidad, $colonia, $numeroInterior, $nombre, $telefono)
    {
        $link = $this->open();

        $query = "INSERT INTO direccion (idUsuario, direccion, codigo_postal, estado, municipio, localidad, colonia, numero_interior, nombre, telefono) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $link->prepare($query);

        if (!$stmt) {
            error_log('Error al preparar la consulta: ' . $link->error);
            return false;
        }

        $stmt->bind_param("isssssssss", $idUsuario, $direccion, $codigoPostal, $estado, $municipio, $localidad, $colonia, $numeroInterior, $nombre, $telefono);

        $result = $stmt->execute();

        if (!$result) {
            error_log('Error al ejecutar la consulta: ' . $stmt->error);
        }

        $stmt->close();
        $this->close($link);

        return $result;
    }

    public function listarDirecciones($idUsuario)
    {
        $link = $this->open();

        $query = "SELECT id_direccion, direccion, codigo_postal, estado, municipio, localidad, colonia, numero_interior, nombre, telefono 
                  FROM direccion WHERE idUsuario = ?";
        $stmt = $link->prepare($query);

        if (!$stmt) {
            error_log('Error al preparar la consulta: ' . $link->error);
            return false;
        }

        $stmt->bind_param("i", $idUsuario);

        if (!$stmt->execute()) {
            error_log('Error al ejecutar la consulta: ' . $stmt->error);
            return false;
        }

        $result = $stmt->get_result();
        $direcciones = $result->fetch_all(MYSQLI_ASSOC);

        $stmt->close();
        $this->close($link);

        return $direcciones;
    }

    public function executeInsert($query, $params, $types)
    {
        $link = $this->open();
        $stmt = mysqli_prepare($link, $query);

        if (!$stmt) {
            $this->close($link);
            throw new Exception('Error al preparar la consulta: ' . mysqli_error($link));
        }

        mysqli_stmt_bind_param($stmt, $types, ...$params);

        if (!mysqli_stmt_execute($stmt)) {
            $error = mysqli_error($link);
            mysqli_stmt_close($stmt);
            $this->close($link);
            throw new Exception('Error al ejecutar la consulta: ' . $error);
        }

        $insertId = mysqli_insert_id($link);
        mysqli_stmt_close($stmt);
        $this->close($link);

        return $insertId;
    }

    public function getTickets($idUsuario)
    {
        $link = $this->open();

        $sql = "SELECT * FROM tickets WHERE idUsuario = ?";
        $stmt = mysqli_prepare($link, $sql);

        if (!$stmt) {
            $this->close($link);
            return false;
        }

        mysqli_stmt_bind_param($stmt, "i", $idUsuario);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $tickets = mysqli_fetch_all($result, MYSQLI_ASSOC);

        mysqli_stmt_close($stmt);
        $this->close($link);

        return $tickets;
    }

    public function getTicketItems($id_ticket)
    {
        $link = $this->open();

        $sql = "SELECT ti.*, p.marca, p.imagen_producto FROM ticket_items ti JOIN productos p ON ti.nombre_producto = p.nombre_producto WHERE ti.id_ticket = ?";
        $stmt = mysqli_prepare($link, $sql);

        if (!$stmt) {
            $this->close($link);
            return false;
        }

        mysqli_stmt_bind_param($stmt, "i", $id_ticket);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $ticketItems = mysqli_fetch_all($result, MYSQLI_ASSOC);

        mysqli_stmt_close($stmt);
        $this->close($link);

        return $ticketItems;
    }
}
?>