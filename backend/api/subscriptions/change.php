<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';

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

$db = DB::getInstance();

try {
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

    $subscription = $db->selectOne("subscriptions", [
        "userId" => $userId,
        "canceledAt" => null
    ]);

    $input = json_decode(file_get_contents('php://input'), true);

    if ($input === null || !isset($input['id']) || !is_numeric($input['id'])) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Invalid input. Expecting JSON object with a numeric "id".',
                'body' => null
            ])
            ->send();
    }

    if ($subscription["tierId"] === $input["id"]) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'You already have this tier',
                'body' => null
            ])
            ->send();
    }

    $newTierId = (int)$input['id'];

    $newTier = $db->selectOne("tiers", ["id" => $newTierId]);
    if (!$newTier) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'The selected subscription tier does not exist.',
                'body' => null
            ])
            ->send();
    }

    $affectedRows = $db->update("subscriptions", ["tierId" => $newTierId], ["id" => $subscription["id"]]);

    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Tier changed successfully',
            'body' => $affectedRows
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
