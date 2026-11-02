
<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

try {

    $database = new Database();
    $conexion = $database->connect();

    // Comprobar que MySQL responde
    $resultado = $conexion->query("SELECT DATABASE() AS base_datos");
    $db = $resultado->fetch();

    // Comprobar que existen las tablas
    $tablas = $conexion->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        "success" => true,
        "message" => "Conexión con MySQL exitosa",
        "database" => $db['base_datos'],
        "tables" => $tablas
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
