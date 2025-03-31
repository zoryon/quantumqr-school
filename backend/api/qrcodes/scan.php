<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';

// Handle PUT request
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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
    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
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

    // Increment scan count
    $db->executeQuery(
        "UPDATE qrcodes SET scans = scans + 1 WHERE id = ?",
        [$qrId]
    );

    // Get updated scan count
    $result = $db->executeQuery(
        "SELECT scans FROM qrcodes WHERE id = ?",
        [$qrId]
    );

    if (empty($result)) {
        $db->setStatus(404)
            ->setResponse([
                'success' => false,
                'message' => 'QR code not found',
                'body' => null
            ])
            ->send();
    }

    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Scan count updated',
            'body' => [
                'scans' => (int)$result[0]['scans']
            ]
        ])
        ->send();

} catch (Exception $e) {
    error_log('Scan count update error: ' . $e->getMessage());
    $db->setStatus(500)
        ->setResponse([
            'success' => false,
            'message' => 'Internal server error',
            'body' => null
        ])
        ->send();
}