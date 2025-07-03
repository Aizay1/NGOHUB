<?php
require_once 'config.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Validate input
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

// Get user by email
$stmt = $conn->prepare("SELECT id, first_name, last_name, email, phone, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Incorrect password']);
    exit;
}

// Set session
$_SESSION['user_id'] = $user['id'];

// Remove password before returning user data
unset($user['password']);

echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'user' => $user
]);

$stmt->close();
$conn->close();
?>