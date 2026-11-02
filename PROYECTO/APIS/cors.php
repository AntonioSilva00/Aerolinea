
<?php

// Orígenes permitidos para Ionic Angular
$origenesPermitidos = [
    'http://localhost:8100',
    'http://127.0.0.1:8100',
    'http://192.168.1.9:8100',
    'http://192.168.1.9',
    'http://localhost',
    'http://localhost:4200',
    'capacitor://localhost'
];

$origen = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origen, $origenesPermitidos, true)) {
    header('Access-Control-Allow-Origin: ' . $origen);
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
