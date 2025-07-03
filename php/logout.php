<?php
require_once 'config.php';

header('Content-Type: application/json');

// Destroy the session
session_destroy();

echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>