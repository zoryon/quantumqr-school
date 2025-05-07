<?php

require_once '../../vendor/autoload.php';
require_once '../../db/DB.php';
require_once '../../db/ApiResponse.php';

// Handle PUT request
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    ApiResponse::methodNotAllowed()->send();
}

$db = DB::getInstance();

try {
    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        ApiResponse::clientError('Missing QR code ID')->send();
    }

    $qrId = (int)$input['id'];
    if ($qrId <= 0) {
        ApiResponse::clientError('Invalid QR code ID')->send();
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
        ApiResponse::notFound('QR code not found or update failed')->send();
    }

    // --- Get Updated Scan Count ---
    // Fetch the updated record to get the new scan count
    // selectOne returns the row array or false
    $updatedQrData = $db->selectOne("qrcodes", ["id" => $qrId]);

    if (!$updatedQrData) {
        ApiResponse::internalServerError('QR code not found after update')->send();
    }

    ApiResponse::success('Scan count updated', [
        'scans' => (int)$updatedQrData['scans']
    ])->send();
} catch (Exception $e) {
    ApiResponse::internalServerError($e->getMessage())->send();

}