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

if(!empty($data->nombre) && !empty($data->email) && !empty($data->password)) {
    // Verificar si el email ya existe
    $checkQuery = "SELECT id FROM usuarios WHERE email = :email LIMIT 1";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(":email", $data->email);
    $checkStmt->execute();

    if($checkStmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "El correo electrónico ya está registrado."]);
        exit();
    }

    // Hash seguro con Bcrypt
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

    $query = "INSERT INTO usuarios (nombre, email, password_hash) VALUES (:nombre, :email, :password_hash)";
    $stmt = $db->prepare($query);

    $stmt->bindParam(":nombre", $data->nombre);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":password_hash", $password_hash);

    if($stmt->execute()) {
        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Usuario registrado exitosamente."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al registrar usuario."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Datos incompletos."]);
}
?>