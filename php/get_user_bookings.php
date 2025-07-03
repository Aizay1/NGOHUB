<?php
require_once 'config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'You must be logged in to view bookings']);
    exit;
}

$userId = $_SESSION['user_id'];

// Get user bookings with NGO details
$stmt = $conn->prepare("
    SELECT b.id, b.visit_date, b.visit_time, n.name as ngo_name 
    FROM bookings b
    JOIN ngos n ON b.ngo_id = n.id
    WHERE b.user_id = ?
    ORDER BY b.visit_date DESC, b.visit_time DESC
");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    $bookings[] = $row;
}

echo json_encode([
    'success' => true,
    'bookings' => $bookings
]);

$stmt->close();
$conn->close();
?>