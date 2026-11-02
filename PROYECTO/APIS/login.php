<?php
declare(strict_types=1);
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}


function responder(int $codigo, array $datos): void {
    http_response_code($codigo);

    echo json_encode(
        $datos,
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

try {
    $datos = json_decode(
        file_get_contents('php://input'),
        true
    );

    if (!is_array($datos)) {
        responder(400, [
            'success' => false,
            'message' => 'JSON inválido'
        ]);
    }

    $email = trim((string)($datos['email'] ?? ''));
    $password = $datos['password'] ?? '';

    if (
        $email === '' ||
        !is_string($password) ||
        $password === ''
    ) {
        responder(400, [
            'success' => false,
            'message' => 'Completa todos los campos'
        ]);
    }

    $database = new Database();
    $conexion = $database->connect();

    $sql = "SELECT
                id,
                nombre,
                apellidos,
                correo,
                password
            FROM usuarios
            WHERE correo = :correo
            LIMIT 1";

    $consulta = $conexion->prepare($sql);

    $consulta->execute([
        ':correo' => $email
    ]);

    $usuario = $consulta->fetch(PDO::FETCH_ASSOC);

    if (
        !$usuario ||
        !password_verify(
            $password,
            $usuario['password']
        )
    ) {
        responder(401, [
            'success' => false,
            'message' => 'Correo o contraseña incorrectos'
        ]);
    }

    // Generar un token seguro de 256 bits
    $token = bin2hex(random_bytes(32));

    // Guardar solo el hash, no el token original
    $tokenHash = hash('sha256', $token);

    // Duración de sesión: 7 días
    $sqlSesion = "
        INSERT INTO api_sesiones (
            usuario_id,
            token_hash,
            expira_en
        )
        VALUES (
            :usuario_id,
            :token_hash,
            DATE_ADD(NOW(), INTERVAL 7 DAY)
        )
    ";

    $sesion = $conexion->prepare($sqlSesion);

    $sesion->execute([
        ':usuario_id' => (int)$usuario['id'],
        ':token_hash' => $tokenHash
    ]);

    unset($usuario['password']);

    responder(200, [
        'success' => true,
        'message' => 'Inicio de sesión exitoso',
        'token' => $token,
        'token_type' => 'Bearer',
        'expires_in' => 604800,
        'usuario' => $usuario
    ]);

} catch (Throwable $e) {

    error_log('Error login: ' . $e->getMessage());

    responder(500, [
        'success' => false,
        'message' => 'Error interno del servidor'
    ]);
}
