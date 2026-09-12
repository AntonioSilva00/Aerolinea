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

if(!empty($data->email) && !empty($data->password)) {
    $query = "SELECT id, nombre, email, password_hash FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Verificación de Hash
        if(password_verify($data->password, $row['password_hash'])) {
            // Generación de Token Simulado o JWT
            $tokenPayload = base64_encode(json_encode([
                "user_id" => $row['id'],
                "email" => $row['email'],
                "exp" => time() + (3600 * 24)
            ]));
            
            $token = "SF_JWT_SECURE_" . $tokenPayload;

            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Autenticación exitosa.",
                "token" => $token,
                "user" => [
                    "id" => $row['id'],
                    "nombre" => $row['nombre'],
                    "email" => $row['email']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Contraseña incorrecta."]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Usuario no encontrado."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Proporcione usuario y contraseña."]);
}
?>
