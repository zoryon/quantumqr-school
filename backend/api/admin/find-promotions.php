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
    $user = $db->selectOne("users", [
        "id" => $userId, 
        "isAdmin" => true,
        "isEmailConfirmed" => true
    ]);

    if (!$user || empty($user)) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'User not found',
                'body' => null
            ])
            ->send();
    }

    $promotionRequests = $db->select("promotionrequests", [ "reviewedAt" => null ]);
    if ($promotionRequests == null) {
        $promotionRequests = [];
    } elseif ($promotionRequests === false) {
        $db->setStatus(500)
            ->setResponse([
                'success' => false,
                'message' => 'Internal server error',
                'body' => null
            ])
            ->send();
    }

    // Successful response
    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Promotion requests found successfully',
            'body' => $promotionRequests
        ])
        ->send();
} catch (Exception $e) {
    $db->setStatus(500)
        ->setResponse([
            'success' => false,
            'message' => $e->getMessage(),
            'body' => null
        ])
        ->send();
}