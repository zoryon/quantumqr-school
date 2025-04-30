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

    // --- Increment Scan Count Atomically ---
    // Use execute for raw SQL UPDATE with atomic increment
    $updateSql = "UPDATE qrcodes SET scans = scans + 1 WHERE id = ?";
    $stmt = $db->execute($updateSql, [$qrId]);

    // Check if the execute call succeeded and if any row was actually updated
    if (!$stmt || $stmt->rowCount() === 0) {
        // If rowCount is 0, it means no record with that ID was found/updated
        // We should check if the record exists first, or infer from rowCount.
        // Inferring from rowCount is simpler here.
        $db->setStatus(404) // Not Found
            ->setResponse([
                'success' => false,
                'message' => 'QR code not found or update failed.',
                'body' => null
            ])
            ->send();
    }

    // --- Get Updated Scan Count ---
    // Fetch the updated record to get the new scan count
    // selectOne returns the row array or false
    $updatedQrData = $db->selectOne("qrcodes", ["id" => $qrId]);

    if (!$updatedQrData) {
        $db->setStatus(500)
            ->setResponse([
                'success' => false,
                'message' => 'QR code not found after update.',
                'body' => null
            ])
            ->send();
    }

    $db->setStatus(200)
        ->setResponse([
            'success' => true,
            'message' => 'Scan count updated',
            'body' => [
                'scans' => (int)$updatedQrData['scans']
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