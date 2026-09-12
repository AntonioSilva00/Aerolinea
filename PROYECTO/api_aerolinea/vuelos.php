<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de la petición Preflight de CORS generada por Axios
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db.php';

$database = new Database();
$db = $database->getConnection();

// Seleccionar vuelos con asientos disponibles
$query = "SELECT id, numero_vuelo, origen, destino, fecha_salida, precio, asientos_disponibles FROM vuelos WHERE asientos_disponibles > 0";
$stmt = $db->prepare($query);
$stmt->execute();

$vuelos = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    array_push($vuelos, $row);
}

echo json_encode($vuelos);
?>