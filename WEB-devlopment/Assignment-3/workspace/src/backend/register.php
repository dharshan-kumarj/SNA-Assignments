<?php
header("Content-Type: application/json");
require_once 'Database.php';
require_once 'User.php';

// Defensive: Limit request methods
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['name']) || !isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit;
}

try {
    $db = new Database();
    $user = new User($db);
    
    $id = $user->register($input['name'], $input['email'], $input['password']);

    echo json_encode(["success" => true, "id" => (string)$id]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
