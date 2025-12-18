<?php
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

class Database {
    private $client;
    private $db;

    public function __construct() {
        $host = getenv('MONGO_HOST') ?: 'mongo';
        $port = getenv('MONGO_PORT') ?: '27017';
        $user = getenv('MONGO_USER') ?: 'root';
        $pass = getenv('MONGO_PASS') ?: 'rootpassword';
        $db_name = getenv('MONGO_DB') ?: 'app_db';

        // Fix: Use correct Mongo Connection String format for auth
        // If user/pass are empty (default mongo image might be), handle that
        if ($user && $pass) {
            $uri = "mongodb://{$user}:{$pass}@{$host}:{$port}";
        } else {
            $uri = "mongodb://{$host}:{$port}";
        }
        
        try {
            $this->client = new Client($uri);
            $this->db = $this->client->selectDatabase($db_name);
        } catch (Exception $e) {
            // Return JSON error if connection fails, don't just die printing HTML
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "DB Connection Failed: " . $e->getMessage()]);
            exit;
        }
    }

    public function getCollection($collectionName) {
        return $this->db->selectCollection($collectionName);
    }
}
?>
