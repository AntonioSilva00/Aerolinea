<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->vuelo_id) && !empty($data->pasajeros) && !empty($data->asiento)) {
    
    // Extraer el ID del usuario desde el Token JWT
    $headers = apache_request_headers();
    $usuario_id = 1; // ID de respaldo en caso de que falle el token
    
    if(isset($headers['Authorization'])) {
        $token = str_replace("Bearer SF_JWT_SECURE_", "", $headers['Authorization']);
        $payload = json_decode(base64_decode($token));
        if (isset($payload->user_id)) {
            $usuario_id = $payload->user_id;
        }
    }

    $query = "INSERT INTO reservas (usuario_id, vuelo_id, codigo_reserva, pasajeros, asiento, total_pagado) VALUES (:usuario_id, :vuelo_id, :codigo, :pasajeros, :asiento, :total)";
    $stmt = $db->prepare($query);

    // Generar un código de reserva aleatorio (ej. A8F3B9)
    $codigo_reserva = strtoupper(substr(md5(uniqid(rand(), true)), 0, 6));
    $total_simulado = 1500.00; 

    $stmt->bindParam(":usuario_id", $usuario_id);
    $stmt->bindParam(":vuelo_id", $data->vuelo_id);
    $stmt->bindParam(":codigo", $codigo_reserva);
    $stmt->bindParam(":pasajeros", $data->pasajeros);
    $stmt->bindParam(":asiento", $data->asiento);
    $stmt->bindParam(":total", $total_simulado);

    if ($stmt->execute()) {
        // Descontar el asiento de la tabla de vuelos
        $updateQuery = "UPDATE vuelos SET asientos_disponibles = asientos_disponibles - :pasajeros WHERE id = :vuelo_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(":pasajeros", $data->pasajeros);
        $updateStmt->bindParam(":vuelo_id", $data->vuelo_id);
        $updateStmt->execute();

        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Reserva confirmada", "codigo" => $codigo_reserva]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al guardar la reserva en la base de datos."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos incompletos para la reserva."]);
}
?>