<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    $user = $db->selectOne("users", ["id" => $userId]);

    if (!$user || empty($user)) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'User not found',
                'body' => null
            ])
            ->send();
    }

    if ($user["isAdmin"] === true) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Already an admin',
                'body' => null
            ])
            ->send();
    }

    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input["requestReason"] || empty($input["requestReason"])) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Wrong inserted data',
                'body' => null
            ])
            ->send();
    }

    $existing = $db->selectOne("promotionrequests", ["userId" => $userId]);

    if ($existing) {
        $db->setStatus(409) // Conflict
            ->setResponse([
                'success' => false,
                'message' => 'You have already sent a promotion request',
                'body' => null
            ])
            ->send();
    }
    
    $newId = $db->insert("promotionrequests", [
        "userId" => $userId,
        "requestReason" => $input["requestReason"],
    ]);

    if (!$newId) {
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
            'message' => 'Request sent successfully',
            'body' => $newId
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