<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';

$SESSION_SECRET = '171ba917ee3c87ccc7628e79e96e6804dd0c416b8e01b6a55051a0442bbc5e85';

// Handle GET request
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

    $input = json_decode(file_get_contents('php://input'), true);

    if (
        !isset($input["userId"]) || empty($input["userId"]) 
    ) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Wrong data was passed',
                'body' => null
            ])
            ->send();
    }

    $affectedRows = $db->update("promotionrequests", $input, ["userId" => $input["userId"]]);

    if ($affectedRows !== 1) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Wrong data was passed',
                'body' => null
            ])
            ->send();
    }

    if (!empty($input["acceptedAt"]) && $input["acceptedAt"] !== null) {
        $affectedRows = $db->update("users", ["isAdmin" => true], [
            "id" => $input["userId"],
            "isEmailConfirmed" => true
        ]);

        if ($affectedRows !== 1) {
            $db->setStatus(500)
            ->setResponse([
                'success' => false,
                'message' => 'Interal server error',
                'body' => null
            ])
            ->send();
        }
    } 

    // Successful response
    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Promotion successfully reviewed',
            'body' => $affectedRows
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