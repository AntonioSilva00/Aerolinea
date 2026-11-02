
<?php

class Database {

    private $host = '127.0.0.1';
    private $database = 'aerolinea_db';
    private $username = 'root';
    private $password = '';

    public function connect() {

        try {

            $pdo = new PDO(
                "mysql:host={$this->host};dbname={$this->database};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );

            return $pdo;

        } catch (PDOException $e) {

            error_log($e->getMessage());

            throw new Exception('No se pudo conectar con la base de datos');
        }
    }
}
