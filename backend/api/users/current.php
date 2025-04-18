<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    DB::getInstance()
        ->setStatus(405)
        ->setResponse([
            'success' => false,
            'message' => 'Method not allowed',
            'body' => null
        ])
        ->send();
}

try {
    $db = DB::getInstance();

    // Check existing session
    $userId = getIdFromSessionToken($_COOKIE['session_token']);
    if (!$userId) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'Not found', // Confusing unauthorized users 
                'body' => null
            ])
            ->send();
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

    if (empty($userData)) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'User not found or subscription missing',
                'body' => null
            ])
            ->send();
    }

    // Successful response
    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'User found successfully',
            'body' => $userData
        ])
        ->send();
} catch (Exception $e) {
    error_log($e->getMessage());
    $db->setStatus(500)
        ->setResponse([
            'success' => false,
            'message' => $e->getMessage(),
            'body' => null
        ])
        ->send();
}