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
    $users = $db->executeQuery(
        "SELECT email, username FROM users 
        WHERE id = ?
        AND isEmailConfirmed = 1
        ", [$userId]
    );

    if (empty($users)) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'User not found',
                'body' => null
            ])
            ->send();
    }
    $user = $users[0];

    // Successful response
    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'User found successfully',
            'body' => $user
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