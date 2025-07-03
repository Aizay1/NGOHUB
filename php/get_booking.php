<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
    exit;
}

$bookingId = $_GET['id'];

// Get booking details with NGO info
$stmt = $conn->prepare("
    SELECT b.*, n.name as ngo_name 
    FROM bookings b
    JOIN ngos n ON b.ngo_id = n.id
    WHERE b.id = ?
");
$stmt->bind_param("i", $bookingId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Booking not found']);
    exit;
}

$booking = $result->fetch_assoc();

echo json_encode([
    'success' => true,
    'booking' => $booking
]);

$stmt->close();
$conn->close();
?>