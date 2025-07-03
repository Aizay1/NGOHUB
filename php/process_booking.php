<?php
require_once 'config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'You must be logged in to book a visit']);
    exit;
}

$userId = $_SESSION['user_id'];
$ngoId = $_POST['ngo_id'] ?? '';
$visitDate = $_POST['visit_date'] ?? '';
$visitTime = $_POST['visit_time'] ?? '';

// Validate input
if (empty($ngoId) || empty($visitDate) || empty($visitTime)) {
    echo json_encode(['success' => false, 'message' => 'All booking information is required']);
    exit;
}

// Check if the NGO exists
$stmt = $conn->prepare("SELECT name FROM ngos WHERE id = ?");
$stmt->bind_param("i", $ngoId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'NGO not found']);
    exit;
}

$ngo = $result->fetch_assoc();
$ngoName = $ngo['name'];

// Insert booking
$stmt = $conn->prepare("INSERT INTO bookings (user_id, ngo_id, visit_date, visit_time) VALUES (?, ?, ?, ?)");
$stmt->bind_param("iiss", $userId, $ngoId, $visitDate, $visitTime);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Booking successful',
        'booking_id' => $stmt->insert_id,
        'ngo_name' => $ngoName
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Booking failed: ' . $conn->error]);
}

$stmt->close();
$conn->close();
?>