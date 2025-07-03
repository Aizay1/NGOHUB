<?php
require_once 'config.php';

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
    
    $stmt = $conn->prepare("SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode(['loggedIn' => true, 'user' => $user]);
    } else {
        echo json_encode(['loggedIn' => false]);
    }
    
    $stmt->close();
} else {
    echo json_encode(['loggedIn' => false]);
}

$conn->close();
?>