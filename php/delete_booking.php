<?php
require_once 'config.php';

header('Content-Type: application/json');

if (!isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
    exit;
}

$bookingId = $_GET['id'];

// Check if booking exists
$stmt = $conn->prepare("SELECT id FROM bookings WHERE id = ?");
$stmt->bind_param("i", $bookingId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Booking not found']);
    exit;
}

// Delete booking
$stmt = $conn->prepare("DELETE FROM bookings WHERE id = ?");
$stmt->bind_param("i", $bookingId);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Booking deleted successfully'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Booking deletion failed: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>