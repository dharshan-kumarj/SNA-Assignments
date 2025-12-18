<?php
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

class Database {
    private $client;
    private $db;

    public function __construct() {
        $host = getenv('MONGO_HOST') ?: 'mongo';
        $port = getenv('MONGO_PORT') ?: '27017';
        $user = getenv('MONGO_USER') ?: 'admin';
        $pass = getenv('MONGO_PASS') ?: 'secret123';
        $db_name = getenv('MONGO_DB') ?: 'app_db';

        // Construct URI with Authentication Source (admin)
        if ($user && $pass) {
            $uri = "mongodb://{$user}:{$pass}@{$host}:{$port}/?authSource=admin";
        } else {
            $uri = "mongodb://{$host}:{$port}";
        }
        
        try {
            // Disable SSL for local dev if needed, or keep default
            $this->client = new Client($uri);
            $this->db = $this->client->selectDatabase($db_name);
            
            // Test Connection
            $this->client->listDatabases();
            
        } catch (Exception $e) {
            error_log("MongoDB Connection Error: " . $e->getMessage());
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                "success" => false, 
                "message" => "Database Error: " . $e->getMessage()
            ]);
            exit;
        }
    }

    public function getCollection($collectionName) {
        return $this->db->selectCollection($collectionName);
    }
}
?>
