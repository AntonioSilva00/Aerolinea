<?php
declare(strict_types=1);
ini_set('log_errors', '1');
ini_set('error_log', '/tmp/skyflow_php_errors.log');
error_reporting(E_ALL);
// Cargar CORS antes de procesar cualquier petición
require_once __DIR__ . '/cors.php';
function reply(int $status, array $data): never { http_response_code($status); echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE); exit; }
function db(): PDO {
  $pdo = new PDO('mysql:host=127.0.0.1;dbname=aerolinea_db;charset=utf8mb4', 'root', '', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false
  ]);
  $pdo->exec("SET time_zone = '-06:00'"); // DEMO Durango; sustituir por UTC + zonas por aeropuerto.
  return $pdo;
}

function userId(PDO $pdo): int {

    $headers = function_exists('getallheaders')
        ? getallheaders()
        : [];

    $auth = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    // Recuperar Authorization sin depender de mayúsculas.
    if ($auth === '') {
        foreach ($headers as $nombre => $valor) {
            if (strcasecmp($nombre, 'Authorization') === 0) {
                $auth = $valor;
                break;
            }
        }
    }

    if (!preg_match('/^Bearer\s+([A-Za-z0-9._~-]+)$/i', trim($auth), $m)) {
        reply(401, [
            'message' => 'Sesión requerida'
        ]);
    }

    $tokenHash = hash('sha256', $m[1]);

    $consulta = $pdo->prepare("
        SELECT usuario_id
        FROM api_sesiones
        WHERE token_hash = :token_hash
          AND expira_en > NOW()
        LIMIT 1
    ");

    $consulta->execute([
        ':token_hash' => $tokenHash
    ]);

    $usuarioId = $consulta->fetchColumn();

    if (!$usuarioId) {
        reply(401, [
            'message' => 'Token inválido o vencido'
        ]);
    }

    return (int) $usuarioId;
}
