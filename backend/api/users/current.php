<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    ApiResponse::methodNotAllowed()->send();
}

try {
    $db = DB::getInstance();

    // Check existing session
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId) {
        ApiResponse::clientError('Not found')->send();
    }

    // Find confirmed user
    $query = "SELECT u.*, t.name AS tier,
            (SELECT COUNT(*) FROM qrcodes WHERE userId = u.id) AS qrCodesCount,
            (SELECT COALESCE(SUM(scans), 0) FROM qrcodes WHERE userId = u.id) AS totalScans
          FROM users u
          JOIN subscriptions s ON u.id = s.userId
          JOIN tiers t ON s.tierId = t.id
          WHERE u.id = ?";
    $stmt = $db->execute($query, [$userId]);
    $userData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$userData || empty($userData)) {
        ApiResponse::notFound('User not found or subscription missing')->send();
    }

    ApiResponse::success('User found successfully', $userData)->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();
}