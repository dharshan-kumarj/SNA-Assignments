<?php
header("Content-Type: application/json");
session_start();

// Defensive: Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

// Security: Allowed file types
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxFileSize = 2 * 1024 * 1024; // 2MB

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No file uploaded or upload error"]);
    exit;
}

$file = $_FILES['avatar'];

// Defensive: Check file size
if ($file['size'] > $maxFileSize) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "File too large. Max 2MB allowed."]);
    exit;
}

// Security: Validate MIME type using finfo (not just extension)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid file type. Only JPG, PNG, GIF, WEBP allowed."]);
    exit;
}

// Security: Generate random filename to prevent overwrites and path traversal
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$safeExtension = preg_replace('/[^a-zA-Z0-9]/', '', $extension);
$newFilename = bin2hex(random_bytes(16)) . '.' . strtolower($safeExtension);

// Create uploads directory if not exists
$uploadDir = __DIR__ . '/../uploads/avatars/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$destination = $uploadDir . $newFilename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // In a real app, you'd save the filename to the user's profile in MongoDB
    echo json_encode([
        "success" => true, 
        "message" => "Avatar uploaded successfully",
        "filename" => $newFilename,
        "url" => "/uploads/avatars/" . $newFilename
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to save file"]);
}
?>
