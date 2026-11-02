
<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

try {

    require_once __DIR__ . '/db.php';

    $database = new Database();
    $db = $database->connect();

    $query = "
        SELECT
            id,
            origen,
            destino,
            fecha_salida,
            fecha_llegada,
            precio,
            capacidad,
            estado
        FROM vuelos
        WHERE capacidad > 0
          AND estado = 'disponible'
          AND fecha_salida >= NOW()
        ORDER BY fecha_salida ASC
    ";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $vuelos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);

    echo json_encode(
        $vuelos,
        JSON_UNESCAPED_UNICODE
    );

} catch (Throwable $e) {

    error_log('[VUELOS] ' . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Error al consultar los vuelos'
    ]);

}
?>
