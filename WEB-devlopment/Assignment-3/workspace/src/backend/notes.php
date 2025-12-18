<?php
header("Content-Type: application/json");
session_start();
require_once 'Database.php';
require_once 'Note.php';

// Defensive: Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

// Defensive: Validate session fingerprint
if (isset($_SESSION['ip_agent'])) {
    $currentFingerprint = md5($_SERVER['REMOTE_ADDR'] . $_SERVER['HTTP_USER_AGENT']);
    if ($_SESSION['ip_agent'] !== $currentFingerprint) {
        session_destroy();
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Session hijacking detected"]);
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

try {
    $db = new Database();
    $note = new Note($db, $_SESSION['user_id']);

    switch ($method) {
        case 'GET':
            // Get all notes or single note
            $noteId = $_GET['id'] ?? null;
            if ($noteId) {
                $data = $note->getById($noteId);
            } else {
                $data = $note->getAll();
            }
            echo json_encode(["success" => true, "data" => $data]);
            break;

        case 'POST':
            // Create new note
            if (empty($input['title'])) {
                throw new Exception("Title is required");
            }
            $id = $note->create($input['title'], $input['content'] ?? '');
            echo json_encode(["success" => true, "id" => (string)$id]);
            break;

        case 'PUT':
            // Update note
            if (empty($input['id']) || empty($input['title'])) {
                throw new Exception("ID and Title are required");
            }
            $note->update($input['id'], $input['title'], $input['content'] ?? '');
            echo json_encode(["success" => true, "message" => "Note updated"]);
            break;

        case 'DELETE':
            // Delete note
            $noteId = $_GET['id'] ?? ($input['id'] ?? null);
            if (empty($noteId)) {
                throw new Exception("Note ID is required");
            }
            $note->delete($noteId);
            echo json_encode(["success" => true, "message" => "Note deleted"]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["success" => false, "message" => "Method not allowed"]);
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
