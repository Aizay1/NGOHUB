<?php
require_once 'config.php';

header('Content-Type: application/json');

$ngoId = $_GET['id'] ?? 0;

if (empty($ngoId)) {
    echo json_encode(['success' => false, 'message' => 'NGO ID is required']);
    exit;
}

// Get NGO details
$stmt = $conn->prepare("
    SELECT 
        id, 
        name, 
        category, 
        description, 
        location, 
        focus_areas, 
        image_url, 
        founded, 
        team_size, 
        projects, 
        impact 
    FROM ngos 
    WHERE id = ?
");
// After fetching the NGO data from database
$ngo['image_url'] = "http://localhost/ngohub-pro/images/" . basename($ngo['image_url']);
$stmt->bind_param("i", $ngoId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'NGO not found']);
    exit;
}

$ngo = $result->fetch_assoc();

// Convert projects string to array
$ngo['projects'] = explode(',', $ngo['projects']);

echo json_encode([
    'success' => true,
    'ngo' => $ngo
]);

$stmt->close();
$conn->close();
?>