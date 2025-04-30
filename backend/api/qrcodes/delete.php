<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../lib/session.php';

// Handle DELETE request
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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
    // Validate session
    $userId = getIdFromSessionToken($_COOKIE['session_token'] ?? '');
    if (!$userId) {
        $db->setStatus(401)
            ->setResponse([
                'success' => false,
                'message' => 'You are not logged in',
                'body' => null
            ])
            ->send();
    }

    // Parse input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['id'])) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Missing QR code ID',
                'body' => null
            ])
            ->send();
    }

    $qrId = (int)$input['id'];
    if ($qrId <= 0) {
        $db->setStatus(400)
            ->setResponse([
                'success' => false,
                'message' => 'Invalid QR code ID',
                'body' => null
            ])
            ->send();
    }

    // Perform deletion
    $affectedRows = $db->delete("qrcodes", [
        "id" => $qrId, 
        "userId" => $userId
    ]);

    if ($affectedRows === 0) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'QR code not found',
                'body' => null
            ])
            ->send();
    }

    // Return deleted QR code data
    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'QR code deleted',
            'body' => $affectedRows
        ])
        ->send();
} catch (Exception $e) {
    error_log('Delete error: ' . $e->getMessage());
    $db->setStatus(500)
        ->setResponse([
            'success' => false,
            'message' => 'Internal server error',
            'body' => null
        ])
        ->send();
}